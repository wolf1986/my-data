export let Config = {
  GoogleAuth: {
    ClientId: '<<GOOGLE_CLIENT_ID>>',
    Scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive',
    ],
  },
  
  GoogleApiDiscoveryDocs: [
    'https://sheets.googleapis.com/$discovery/rest?version=v4',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  ],
  
  Drive: {
    SettingsFileName: 'gsheet_form_settings - 0.3.0.json',
    SheetFormPrefix: 'Form'
  }
};
