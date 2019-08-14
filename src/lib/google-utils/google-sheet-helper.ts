/*
    // Get vaues of range in sheet
    let rangeQueryResult = gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '...',
        range: '...',
    });
*/
export interface SpreadsheetUrl {
  sheetId: string | null;
  spreadsheetId: string | null;
}

export class GoogleSheetHelper {
  public static parseSpreadsheetUrl(url: string): SpreadsheetUrl {
    const re = /\/d\/(.*?)\/?(?:edit#gid=)?(\d+)?$/g;
    const result: SpreadsheetUrl = {
      spreadsheetId: '',
      sheetId: ''
    };

    [, result.spreadsheetId, result.sheetId] = re.exec(url) || [null, null, null];

    return result;
  }

  public static parseSpreadsheetId(idOrUrl: string) {
    const urlParts = GoogleSheetHelper.parseSpreadsheetUrl(idOrUrl);
    if (urlParts.spreadsheetId) {
      idOrUrl = urlParts.spreadsheetId;
    }

    return idOrUrl;
  }

  public static spreadsheetUrl(id: string) {
    return 'https://docs.google.com/spreadsheets/d/1WzYyjRmW70bAfUWYMoJEkeVBhiZYwMcwhIklSQT402w/' + id;
  }

  public static async getRows(spreadsheetId: string, rangeSearch: string) {
    // Get values of range in sheet
    const rangeQueryResult = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: rangeSearch
    });

    return GoogleSheetHelper.rangeToObject(rangeQueryResult.result);
  }

  public static appendRows(spreadsheetId: string, rangeSearch: string, rows: string) {
    return gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: rangeSearch,
      valueInputOption: 'USER_ENTERED', // 'RAW' / 'USER_ENTERED'
      // @ts-ignore
      resource: {
        values: rows,
        majorDimension: 'ROWS'
      }
    });
  }

  public static async getSpreadsheetMetadata(spreadsheetId: string) {
    return gapi.client.sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      ranges: '',
      includeGridData: false
    });
  }

  public static spreadsheetMetaToSheetIds(spreadsheetMetadata: gapi.client.Response<gapi.client.sheets.Spreadsheet>) {
    const sheetIdByTitle = new Map<string, number | null>();
    for (const sheet of spreadsheetMetadata.result.sheets || []) {
      if (sheet && sheet.properties && sheet.properties.title) {
        sheetIdByTitle.set(sheet.properties.title, sheet.properties.sheetId || null);
      }
    }

    return sheetIdByTitle;
  }

  public static async deleteRows(spreadsheetId: string, sheetId: number, rowFrom: number, rowTo: number) {
    const requestDelete = {
      deleteDimension: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: rowFrom,
          endIndex: rowTo
        }
      }
    };

    return gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      // @ts-ignore
      resource: {
        requests: [requestDelete]
      }
    });
  }
  /**
   * @param rangeObject - Returned from gapi call
   * @returns JSON style object, according to titles from first row
   */
  public static rangeToObject(rangeObject: any): object[] {
    if (rangeObject.values.length === 0) {
      return [];
    }

    // Read Headers
    const headers = rangeObject.values[0];
    const listRecords: any[] = [];

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
