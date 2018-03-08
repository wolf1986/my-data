/*
    // Get vaues of range in sheet
    let rangeQueryResult = gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '...',
        range: '...',
    });
*/

export namespace GoogleSheetHelper {
  declare const gapi: any;

  export interface SpreadsheetUrl {
    sheetId: string;
    spreadsheetId: string;
  }

  export function parseSpreadsheetUrl(url): SpreadsheetUrl {
    const re = /\/d\/(.*?)\/?(?:edit#gid=)?(\d+)?$/g;
    const result = {
      spreadsheetId: null,
      sheetId: null,
    };
    try {
      [, result.spreadsheetId, result.sheetId] = re.exec(url);
    } catch (error) { }
    return result;
  }

  export function parseSpreadsheetId(idOrUrl) {
    const url_parts = GoogleSheetHelper.parseSpreadsheetUrl(idOrUrl)
    if (url_parts.spreadsheetId) { idOrUrl = url_parts.spreadsheetId; }

    return idOrUrl;
  }

  export function spreadsheetUrl(id) {
    return 'https://docs.google.com/spreadsheets/d/1WzYyjRmW70bAfUWYMoJEkeVBhiZYwMcwhIklSQT402w/' + id;
  }

  export async function getRows(spreadsheetId, rangeSearch) {
    // Get values of range in sheet
    const rangeQueryResult = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: rangeSearch,
    });

    return rangeToObject(rangeQueryResult.result);
  }

  export function appendRows(spreadsheetId, rangeSearch, rows) {
    return gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: rangeSearch,
      valueInputOption: 'USER_ENTERED', // 'RAW' / 'USER_ENTERED'
      resource: {
        values: rows,
        majorDimension: 'ROWS',
      },
    });
  }

  export async function getSpreadsheetMetadata(spreadsheetId) {
    return gapi.client.sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      ranges: [],
      includeGridData: false,
    });
  }

  export function spreadsheetMetaToSheetIds(spreadsheetMetadata) {
    const sheetIdByTitle = {};
    for (const sheet of spreadsheetMetadata.result.sheets) {
      sheetIdByTitle[sheet.properties.title] = sheet.properties.sheetId;
    }

    return sheetIdByTitle;
  }

  export async function deleteRows(spreadsheetId, sheetId, rowFrom, rowTo) {
    const requestDelete = {
      deleteDimension: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: rowFrom,
          endIndex: rowTo,
        },
      },
    };

    return gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [requestDelete],
      },
    });
  }
  /**
   * @param rangeObject - Returned from gapi call
   * @returns JSON style object, according to titles from first row
   */
  export function rangeToObject(rangeObject): any[] {
    if (rangeObject.values.length === 0) {
      return [];
    }

    // Read Headers
    const headers = rangeObject.values[0];
    const listRecords = [];

    // Read Data
    for (const rowData of rangeObject.values.slice(1)) {
      const record = {};
      headers.forEach(header => {
        record[header] = null;
      });

      rowData.forEach((rowValue, col) => {
        record[headers[col]] = rowData[col];
      });

      listRecords.push(record);
    }

    return listRecords;
  }
}
