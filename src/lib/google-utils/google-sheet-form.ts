import { GoogleSheetHelper } from "./google-sheet-helper";
import * as _ from "lodash";
import { Dictionary } from "../utils";

export namespace GoogleSheetForm {
  declare const gapi: any;

  export interface ISheetSettings {
    // User input
    SpreadsheetUrl: string;

    FieldsRange: string;
    CopyPreviousRow: string;

    // Will be filled automatically
    SheetId: string;
    SpreadsheetId: string;
    Title: string;
  }

  export interface IFieldSettings {
    Type: string;
    Autocomplete: string;

    DefaultValue?: string;
    Placeholder?: string;
    Options?: string[];
  }

  export interface IFormSettings {
    Title?: string;
  }

  export interface IPageSettings {
    Sheet: ISheetSettings;
    Form: IFormSettings;
    Fields: Dictionary<IFieldSettings>;
    FieldNames: string[];
  }

  function PageSettingsFactory() {
    return <IPageSettings>{
      Sheet: {
        FieldsRange: "A:Z"
      },
      Form: {},
      Fields: {},
      FieldNames: [],
    };
  }

  function getField(fields: Dictionary<IFieldSettings>, fieldName: string): IFieldSettings {
    if (!(fieldName in fields)) {
      fields[fieldName] = {
        Type: "text",
        Autocomplete: ""
      };
    }

    return fields[fieldName];
  }

  function getFullRange(sheet: ISheetSettings) {
    return `'${sheet.Title}'!${sheet.FieldsRange}`;
  }

  export interface IAppendResult {
    rangeUpdated: string;
  }

  function _assignParameterValue(obj: IPageSettings, path, value) {
    function get_field_param(x) {
      const re_varname = /^Fields\.(\w*)\./gm;
      const re_dict_access = /^Fields\[\'([^']*)\'\]\./gm;

      let re_result = re_varname.exec(x);
      if (re_result) {
        return re_result[1];
      }

      re_result = re_dict_access.exec(x);
      if (re_result) {
        return re_result[1];
      }

      return null;
    }

    const field_param = get_field_param(path);
    if (field_param) {
      getField(obj.Fields, field_param);
    }

    // tslint:disable-next-line:no-eval
    eval("obj." + path + "=`" + value + "`;");
  }

  export async function formSettingsFromSheet(spreadsheetId: string, sheetTitle: string) {
    const settings_obj_raw = await GoogleSheetHelper.getRows(spreadsheetId, sheetTitle + "!A:B");
    const page_settings = PageSettingsFactory();

    // Set default values
    page_settings.Form.Title = sheetTitle;

    settings_obj_raw.forEach(obj => {
      const path = obj["Parameter"];
      const value = obj["Value"];

      if (path != null && value != null) {
        _assignParameterValue(page_settings, path.trim(), value.trim());
      }
    });

    // Allow user to enter urls instead of ids
    if (page_settings.Sheet.SpreadsheetUrl != "") {
      const parse_result = GoogleSheetHelper.parseSpreadsheetUrl(page_settings.Sheet.SpreadsheetUrl);
      page_settings.Sheet.SpreadsheetId = parse_result.spreadsheetId;
      page_settings.Sheet.SheetId = parse_result.sheetId;
    }
    page_settings.Sheet.SpreadsheetId = GoogleSheetHelper.parseSpreadsheetId(page_settings.Sheet.SpreadsheetId);

    const spreadsheet_meta = await GoogleSheetHelper.getSpreadsheetMetadata(page_settings.Sheet.SpreadsheetId);
    const sheet_meta_by_title = GoogleSheetHelper.spreadsheetMetaByTitle(spreadsheet_meta);
    if (page_settings.Sheet.Title) {
      page_settings.Sheet.SheetId = sheet_meta_by_title[page_settings.Sheet.Title].sheetId;
    } else {
      for (const key of Object.keys(sheet_meta_by_title)) {
        if (sheet_meta_by_title[key].sheetId == page_settings.Sheet.SheetId) {
          page_settings.Sheet.Title = sheet_meta_by_title[key].title;
        }
      }
    }

    // Download subject sheet to load specific fields
    const query_values = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: page_settings.Sheet.SpreadsheetId,
      range: getFullRange(page_settings.Sheet)
    });

    const spreadsheet_values_object = GoogleSheetHelper.rangeToObject(query_values.result);

    page_settings.FieldNames = query_values.result.values[0];
    page_settings.FieldNames.forEach(field_name => {
      // Skip empty columns
      if (!field_name) {
        return;
      }

      // Assign 'text' types to fields in sheet unknown in settings
      const field = getField(page_settings.Fields, field_name);

      // Read history for requested fields
      if (field.Autocomplete.toLowerCase() === "history") {
        field.Options = parseAutoCompleteData(spreadsheet_values_object, field_name);
      }
    });

    return page_settings;
  }

  export function parseAutoCompleteData(tableObject, fieldName) {
    const values = tableObject.map(o => o[fieldName]);
    return _.sortedUniq(_.flatten(values).sort());
  }

  export async function appendSheetRowWithSettings(
    rowToAppend: string[],
    formSettings: IPageSettings
  ): Promise<IAppendResult> {
    try {
      const appendResult = {} as IAppendResult;

      let result = await GoogleSheetHelper.appendRows(
        formSettings.Sheet.SpreadsheetId,
        getFullRange(formSettings.Sheet),
        [rowToAppend]
      );
      // console.log('Rows append result:');
      // console.log(result);

      const rowNumber = Number.parseInt((result.result.updates.updatedRange as string).match(/(\d+)$/g)[0]);

      if (formSettings.Sheet.CopyPreviousRow.toLowerCase() === "yes") {
        const batchUpdateRequest = {
          requests: [
            {
              copyPaste: {
                source: {
                  sheetId: formSettings.Sheet.SheetId,
                  startRowIndex: rowNumber - 2,
                  endRowIndex: rowNumber - 1
                },
                destination: {
                  sheetId: formSettings.Sheet.SheetId,
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber
                },
                pasteType: "PASTE_NORMAL",
                pasteOrientation: "NORMAL"
              }
            }
          ]
        };

        const batchResult = await gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: formSettings.Sheet.SpreadsheetId,
          resource: batchUpdateRequest
        });

        console.log("Batch update result", batchResult);
      }

      let [, columnStart, , columnEnd] = /([A-Za-z]*)(\d*):([A-Za-z]*)(\d*)/g.exec(formSettings.Sheet.FieldsRange);
      const rangeToUpdate = `${formSettings.Sheet.Title}!${columnStart}${rowNumber}:${columnEnd}${rowNumber}`;

      result = await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: formSettings.Sheet.SpreadsheetId,
        range: rangeToUpdate,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [rowToAppend],
          majorDimension: "ROWS"
        }
      });

      // console.log('Rows update result:');
      // console.log(result);

      appendResult.rangeUpdated = rangeToUpdate;
      return appendResult;
    } catch (error) {
      console.log("Error appending row:");
      console.error(error);

      let full_message = ``;
      try {
        full_message = `${error.result.error.message}`;
      } catch (e) {}

      throw new Error(full_message);
    }
  }
}
