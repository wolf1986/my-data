import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppService, AppSettingsData } from '../app.service';
import { GoogleDriveHelper } from '../../google-utils/google_drive_helper';
import { Config } from '../config';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {
  constructor(public appService: AppService) {
    this.appService.authService.promiseInitCompleted.then(() => {
      const auth2 = gapi.auth2.getAuthInstance();
      auth2.attachClickHandler(
        document.getElementById('googleBtn'), {}, null, null);
    });
  }

  public get settings(): AppSettingsData {
    return this.appService.settings;
  }

  ngOnInit() { }

  public onSignOutClicked() {
    const auth2 = gapi.auth2.getAuthInstance().signOut();
  }

  public async onSave() {
    try {
      console.log('Save following values to AppData:');
      console.log(this.appService.settings);

      const settingsMetadata = {
        mimeType: 'application/json',
        parents: ['root'],
      };

      if (this.appService.settingsFileId) {
        settingsMetadata['id'] = this.appService.settingsFileId;
      }

      const response = await GoogleDriveHelper.createFileWithJSONContent(
        Config.Drive.SettingsFileName, this.appService.settings, settingsMetadata);

      console.log(response);
      this.appService.messageService.add(
        { severity: 'success', summary: 'Save to settings', detail: 'Saved !' }
      );
    } catch (error) {
      console.error(error);
      const full_message = `"${error.result.error.message}"<br><br>Unable to save settings`;
      this.appService.messageService.add(
        { severity: 'error', summary: 'Save failed', detail: full_message }
      );
    }
  }

  public onDebug() {
    // Object.assign(this.settings, new AppSettingsData());
    this.appService.settings.range = '';
    this.appService.settings.spreadsheet_id = '';
  }
}
