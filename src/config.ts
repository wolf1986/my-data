import { ConfigSecret } from "./config-secret";


export let Config = {
  GoogleAuth: {
    ClientId: ConfigSecret.GoogleClientId,
    Scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.appdata',
    ],
  },

  GoogleApiDiscoveryDocs: [
    'https://sheets.googleapis.com/$discovery/rest?version=v4',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  ],

  Drive: {
    SettingsFileName: 'GoogleSheetForm - Settings.json',
    SheetFormPrefix: 'Form',
  },

  App: {
    DefaultSettings: {
      SpreadsheetId: '',
      DateFormat: 'YYYY-MM-DD',
    },
  },
};
