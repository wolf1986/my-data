/// <reference types="gapi.client" />
declare namespace gapi.client {
  namespace sheets {
    const spreadsheets: gapi.client.sheets.SpreadsheetsResource;
  }

  namespace drive {
    interface FilesResourceFix extends FilesResource {
      create(obj: any): Request<File>;
    }

    const files: FilesResourceFix;
  }
}

