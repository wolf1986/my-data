/*
    // Get vaues of range in sheet
    let rangeQueryResult = gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '...',
        range: '...',
    });
*/

export namespace GoogleSheetHelper {
  declare const gapi: any;
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
        values: [rows],
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
  export function rangeToObject(rangeObject) {
    if (rangeObject.values.length === 0) {
      return {};
    }

    // Read Headers
    const headers = rangeObject.values[0];
    const listRecords = [];

    // Read Data
    for (const rowData of rangeObject.values.slice(1)) {
      const record = {};

      // tslint:disable-next-line:forin
      for (const col in rowData) { record[headers[col]] = rowData[col]; }

      listRecords.push(record);
    }

    return listRecords;
  }
}
