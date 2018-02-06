import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';

import { Subscription } from 'rxjs/Subscription';
import { Config } from './config';
import { Message } from 'primeng/components/common/message';
import { GoogleAuthService } from '../google-utils/google-auth.service';

import * as _ from 'lodash';
import 'rxjs/add/operator/toPromise';

export class AppSettingsData {
  spreadsheet_id = '';
  range = '';
}

@Injectable()
export class AppService implements OnDestroy {
  settings = new AppSettingsData();
  settingsFileId: string = null;
  subscriptions = new Subscription();
  categorySuggestions: string[] = [];

  constructor(public httpClient: HttpClient, public authService: GoogleAuthService, public messageService: MessageService) {
    this.authService.clientConfig = {
      client_id: Config.GoogleAuth.ClientId,
      scope: Config.GoogleAuth.Scopes.join(' '),
    };

    this.authService.discoveryDocs = Config.GoogleApiDiscoveryDocs;

    this.subscriptions.add(
      this.authService.googleUser$.subscribe(
        this.onGoogleUser.bind(this)
      ));

    this.authService.actionBeforeInitCompleted = async () => {
      console.log('Loading drive client API');
      await new Promise((resolve, reject) => {
        gapi.client.load('drive', 'v3', resolve);
      });
    };

    this.authService.initAuth2Flow().catch((error) => {
      this.messageService.add(
        { severity: 'error', summary: 'Google Authentication', detail: String(error) }
      );
    });
  }

  async loadSettings() {
    const response = await gapi.client.drive.files.list({
      q: `name = '${Config.Drive.SettingsFileName}'`,
      // q: `name = 'settings.json' and 'root' in parents`,
      // q: `'appDataFolder' in parents`,
      'fields': 'files(id, name, webContentLink, webViewLink)',
      // spaces: 'appDataFolder'
      // spaces: 'drive'
    });

    if (response.result.files.length > 0) {
      const fileMeta = response.result.files[0];
      this.settingsFileId = fileMeta.id;

      // await gapi.client.drive.files.delete({
      //     fileId: file.id,
      // });

      console.log(`Found saved settings file:`);

      if (fileMeta.webContentLink) {
        const url = 'https://www.googleapis.com/drive/v3/files/' + fileMeta.id + '?alt=media';
        this.settings = await this.httpClient.get<AppSettingsData>(url, {
          headers: {
            'Authorization': 'Bearer ' + gapi.auth.getToken().access_token,
            'Access-Control-Allow-Origin': '*'
          }
        }).toPromise();
        console.log(this.settings);
      }
    } else {
      console.log(`Couldn't find saved settings`);
    }
  }

  async loadAutoCompleteData() {
    if (this.authService.isSignedIn && this.settings.spreadsheet_id !== '') {
      const rangeQueryResult = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.settings.spreadsheet_id,
        range: 'Expenses - Vera!B1:B',
      });

      console.log('Loaded auto-complete data:');
      console.log(rangeQueryResult);
      this.categorySuggestions = _.sortedUniq(_.flatten(rangeQueryResult.result.values).sort());
    }
  }

  async onGoogleUser(googleUser: gapi.auth2.GoogleUser) {
    if (googleUser.isSignedIn()) {
      await this.loadSettings();
      this.loadAutoCompleteData();

      const greet_message = 'Welcome ' + googleUser.getBasicProfile().getName() + '!';
      this.messageService.add(
        { severity: 'success', summary: 'Google Authentication', detail: greet_message }
      );
    } else {
      Object.assign(this.settings, new AppSettingsData());
      this.messageService.add(
        { severity: 'warn', summary: 'Google Authentication', detail: 'Not signed in !' }
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
