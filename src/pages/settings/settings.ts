import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { DynamicFormControl } from '../../components/dynamic-form/dynamic-form';
import { AppProvider } from '../../providers/app/app';
import { Subscription } from 'rxjs/Subscription';
import { GoogleDriveHelper } from '../../lib/google-utils/google-drive-helper';
import { Config } from '../../config';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  _subscriptions = new Subscription();

  title = 'Settings';

  controlsDict: { [id: string]: DynamicFormControl } = {
    SpreadsheetId: {
      descriptionHtml: 'Forms are managed using a spreadsheet. ' +
        `Use the <a href="${Config.App.DefaultSettings.SpreadsheetId}" target="_blank"> template spreadsheet</a> as a start for your forms.`,
      label: 'Settings SpreadsheetID',
      type: 'text',
      value: this.appProvider.appSettings.SpreadsheetId,
    }
  };

  constructor(public navParams: NavParams, public appProvider: AppProvider) {
    const self = this;
    this._subscriptions.add(
      this.appProvider.state$.subscribe((state) => {
        if (state === 'ready') {
          self.controlsDict.SpreadsheetId.value = this.appProvider.appSettings.SpreadsheetId;
        }
      })
    );
  }

  async save() {
    try {
      this.appProvider.appSettings.SpreadsheetId = this.controlsDict.SpreadsheetId.value;
      console.log('Save following values to global settings - ', this.appProvider.appSettings);

      const settingsMetadata = {
        mimeType: 'application/json',
      };

      // Override the file if exists, save to root otherwise
      let patchId = null;
      if (this.appProvider.settingsFileId) {
        patchId = this.appProvider.settingsFileId
      } else {
        settingsMetadata['parents'] = ['root'];
      }

      const response = await GoogleDriveHelper.createFileWithJSONContent(
        Config.Drive.SettingsFileName, this.appProvider.appSettings, settingsMetadata, patchId
      );

      console.log(response);
      this.appProvider.toastCtrl
        .create({ message: 'Saved successfully !', showCloseButton: true })
        .present();

      this.appProvider.loadSettings()
    } catch (error) {
      console.error(error);
      const full_message = `"${error.result.error.message}"<br><br>Unable to save settings`;
      this.appProvider.alertCtrl
        .create({
          title: 'Error',
          message: full_message,
          buttons: ['Dismiss'],
        }).present();
    }
  }

  ionViewDidLeave() {
    this._subscriptions.unsubscribe();
  }
}
