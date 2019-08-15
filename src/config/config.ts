export interface ConfigType {
  Google: {
    ClientId: string;
    Scopes: string[];
    DiscoveryDocs: string[];
  };
}

export const Config: ConfigType = {
  Google: {
    ClientId: '_placeholder',
    Scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.appdata',
    ],
    DiscoveryDocs: [
      'https://sheets.googleapis.com/$discovery/rest?version=v4',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    ],
  },
};

if (process.env.DEV) {
  console.log('Running in DEV MODE');
  Config.Google.ClientId = '442618660562-7nlckakrfi4gmtgqg1bnjkganvc28fu8.apps.googleusercontent.com';
} else {
  console.log('Running in PROD MODE');
  Config.Google.ClientId = '771965071521-vpjafcd4e7s4uqpm3b9dabb7qspcdu7a.apps.googleusercontent.com';
}
