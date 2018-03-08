import { GoogleSheetHelper } from './google-sheet-helper';
import { DefaultDict } from '../utils';
import * as _ from 'lodash';

export namespace GoogleSheetForm {
  declare const gapi: any;

  export class SheetSettings {
    // User input
    SpreadsheetId = '';
    Title = '';
    FieldsRange = 'A:Z';
    CopyPreviousRow = 'No';

    get fullRange() {
      return `'${this.Title}'!${this.FieldsRange}`
    }
    // Will be filled automatically
    SheetId = -1;
  }

  export class FieldSettings {
    Placeholder = '';
    Type = 'text';
    DefaultValue = null;
    Autocomplete = '';
    Options: string[] = null;
  }

  export class FormSettings {
    Title = '';
  }

  export class Settings {
    Sheet = new SheetSettings();
    Form = new FormSettings();
    Fields = new DefaultDict<FieldSettings>(() => new FieldSettings());
    FieldNames = [];

    setDefaults() {
      if (!this.Form.Title) { this.Form.Title = this.Sheet.Title; }
    }
  }

  export interface IAppendResult {
    rangeUpdated: string;
  }

  function _assignByPath(obj, path, value) {
    // tslint:disable-next-line:no-eval
    eval('obj.' + path + '=`' + value + '`;');
  }

  export async function formSettingsFromSheet(spreadsheetId: string, sheetTitle: string) {
    const settings_obj_raw = await GoogleSheetHelper.getRows(spreadsheetId, sheetTitle + '!A:B');
    const settings = new Settings();

    settings_obj_raw.forEach(obj => {
      const path = obj['Parameter'];
      const value = obj['Value'];

      if (path != null && value != null) { _assignByPath(settings, path.trim(), value.trim()); }
    });

    // Allow user to enter urls instead of ids
    settings.Sheet.SpreadsheetId = GoogleSheetHelper.parseSpreadsheetId(settings.Sheet.SpreadsheetId);

    settings.setDefaults();

    const spreadsheet_meta = await GoogleSheetHelper.getSpreadsheetMetadata(settings.Sheet.SpreadsheetId);
    const sheet_ids = GoogleSheetHelper.spreadsheetMetaToSheetIds(spreadsheet_meta);
    settings.Sheet.SheetId = sheet_ids[settings.Sheet.Title];

    // Download subject sheet to load specific fields
    const query_values = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: settings.Sheet.SpreadsheetId,
      range: settings.Sheet.fullRange
    });

    const spreadsheet_values_object = GoogleSheetHelper.rangeToObject(query_values.result)

    settings.FieldNames = query_values.result.values[0];
    settings.FieldNames.forEach(field_name => {
      // Skip empty columns
      if (!field_name) { return; }

      const field = settings.Fields.get(field_name);
      
      // Assign 'text' types to fields in sheet unknown in settings
      if (!Object.keys(settings.Fields).includes(field_name)) {
        field.Type = 'text';
      }

      // Read history for requested fields
      if (field.Autocomplete.toLocaleLowerCase() === 'history') {
        field.Options = parseAutoCompleteData(spreadsheet_values_object, field_name);
      }
    });

    return settings;
  }

  export function parseAutoCompleteData(tableObject, fieldName) {
    const values = tableObject.map(o => o[fieldName])
    return _.sortedUniq(_.flatten(values).sort());
  }

  export async function appendSheetRowWithSettings(rowToAppend: string[], formSettings: Settings): Promise<IAppendResult> {
    try {
      const appendResult = {} as IAppendResult;

      let result = await GoogleSheetHelper.appendRows(
        formSettings.Sheet.SpreadsheetId,
        formSettings.Sheet.fullRange,
        [rowToAppend]
      );

      // console.log('Rows append result:');
      // console.log(result);

      const rowNumber = Number.parseInt(
        (result.result.updates.updatedRange as string).match(/(\d+)$/g)[0]
      );

      if (formSettings.Sheet.CopyPreviousRow.toLowerCase() === 'yes') {
        const batchUpdateRequest = {
          requests: [
            {
              'copyPaste': {
                'source': {
                  'sheetId': formSettings.Sheet.SheetId,
                  'startRowIndex': rowNumber - 2,
                  'endRowIndex': rowNumber - 1,
                },
                'destination': {
                  'sheetId': formSettings.Sheet.SheetId,
                  'startRowIndex': rowNumber - 1,
                  'endRowIndex': rowNumber,
                },
                'pasteType': 'PASTE_NORMAL',
                'pasteOrientation': 'NORMAL'
              }
            },
          ]
        };

        const batchResult = await gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: formSettings.Sheet.SpreadsheetId,
          resource: batchUpdateRequest
        });

        console.log('Batch update result', batchResult);
      }

      let [, columnStart, , columnEnd] = /([A-Za-z]*)(\d*):([A-Za-z]*)(\d*)/g.exec(formSettings.Sheet.FieldsRange);
      const rangeToUpdate = `${formSettings.Sheet.Title}!${columnStart}${rowNumber}:${columnEnd}${rowNumber}`;

      result = await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: formSettings.Sheet.SpreadsheetId,
        range: rangeToUpdate,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowToAppend],
          majorDimension: 'ROWS',
        },
      });

      // console.log('Rows update result:');
      // console.log(result);

      appendResult.rangeUpdated = rangeToUpdate;
      return appendResult;
    } catch (error) {
      console.log('Error appending row:');
      console.error(error);

      let full_message = ``;
      try {
        full_message = `${error.result.error.message}`;
      } catch (e) { }

      throw new Error(full_message);
    }
  }
}
