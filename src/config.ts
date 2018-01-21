export let Config = {
  GoogleAuth: {
    ClientId: '442618660562-7nlckakrfi4gmtgqg1bnjkganvc28fu8.apps.googleusercontent.com',
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
};
