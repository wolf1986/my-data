import { Injectable } from "@angular/core";
import { GoogleAuthService } from "../../lib/google-utils/google-auth.service";
import { ToastController, LoadingController, Events, Loading } from "ionic-angular";
import { AlertController } from "ionic-angular";
import { Config } from "../../config";
import { Subscription } from "rxjs/Subscription";
import { GoogleSheetForm } from "../../lib/google-utils/google-sheet-form";
import { GoogleDriveHelper } from "../../lib/google-utils/google-drive-helper";
import { GoogleSheetHelper } from "../../lib/google-utils/google-sheet-helper";
import { Subject } from "rxjs/Subject";
import { Storage } from "@ionic/storage";

import * as detect_browser from "detect-browser";
import * as _ from "lodash";

export class AppSettingsData {
  DateFormat = "";
  SpreadsheetId = "";
}

type StateEnum = "initializing" | "signed-out" | "loading" | "ready";

@Injectable()
export class AppProvider {
  userImageUrl: string = null;

  appSettings = new AppSettingsData();
  settingsFileId: string = null;
  subscriptions = new Subscription();
  pageSettings: { [id: string]: GoogleSheetForm.IPageSettings } = {};

  _state = new Subject<StateEnum>();
  state$ = this._state.asObservable();
  state: StateEnum = null;
  loadingToken: Loading = null;

  constructor(
    public authService: GoogleAuthService,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public events: Events
  ) {
    const self = this;

    this.state$.subscribe(state => {
      self.state = state;
      if (["initializing", "loading"].includes(self.state)) {
        if (!this.loadingToken) {
          this.loadingToken = this.loadingCtrl.create({
            content: `${state} ...`
          });
          this.loadingToken.present();
        }
      } else {
        if (this.loadingToken) {
          this.loadingToken.dismiss();
          this.loadingToken = null;
        }
      }

      if (["signed-out"].includes(self.state)) {
        const self = this;
        this.alertCtrl
          .create({
            title: "Google Auth",
            message: "Please sign in to use this app",
            enableBackdropDismiss: false,
            buttons: [
              // { text: 'Cancel', role: 'cancel' },
              {
                text: "Sign In",
                handler: () => {
                  self.authService.signIn().catch(error => {
                    this._state.next("signed-out");
                  });
                }
              }
            ]
          })
          .present();
      }
    });
  }

  public get formIds(): string[] {
    return Object.keys(this.pageSettings);
  }

  async signIn() {
    try {
      if (this.authService.clientConfig === null) {
        await this.initGoogleService();
      } else {
        await this.authService.signIn();
      }
    } catch (error) {
      console.error("Google Auth Failed:", error);
      this.alertCtrl
        .create({
          title: "Error - Google Sign In",
          message: "Operation Failed. \nOriginal Message: " + "\n" + JSON.stringify(error),
          buttons: ["Dismiss"]
        })
        .present();
    }
  }

  async initGoogleService() {
    let ux_mode = "popup";
    const browser = detect_browser.detect();
    console.log(`Detected browser: ${browser.name}; Full Object: `, browser);

    if (["Android OS", "iOS", "Windows Mobile"].includes(browser.os)) {
      ux_mode = "redirect";
    }

    console.log(`Setting ux_mode to: ${ux_mode}`);

    // Config constants
    this.authService.clientConfig = {
      client_id: Config.GoogleAuth.ClientId,
      scope: Config.GoogleAuth.Scopes.join(" "),
      ux_mode: ux_mode as any
    };

    this.authService.discoveryDocs = Config.GoogleApiDiscoveryDocs;

    this.authService.actionBeforeInitCompleted = async () => {
      this._state.next("initializing");

      console.log("Loading drive client API...");
      await new Promise((resolve, reject) => {
        gapi.client.load("drive", "v3", resolve);
      });

      console.log("Drive API loaded");
    };

    this.authService.googleUser$.subscribe(this.onGoogleUser.bind(this));

    await this.authService.initAuth2Flow();
  }

  async loadSingleFormSettings(sheet_title: string, tryLoadingFromCache) {
    const loading = this.loadingCtrl.create({
      content: `Loading form: <br><b>${sheet_title}</b>`
    });

    loading.present();

    let page_settings: GoogleSheetForm.IPageSettings = null;
    const key_cache = `Cache/formSettingsFromSheet/${this.appSettings.SpreadsheetId}_${sheet_title}`;
    if (tryLoadingFromCache) {
      try {
        const cached_obj = await this.storage.get(key_cache);
        if (!_.isEmpty(cached_obj)) {
          page_settings = <GoogleSheetForm.IPageSettings>cached_obj;

          console.log(`Using data from cache: ${key_cache}`, page_settings);
        }
      } catch (error) {
        console.log(`Error loading from cache:`, error);
      }
    }

    if (!page_settings) {
      page_settings = await GoogleSheetForm.formSettingsFromSheet(this.appSettings.SpreadsheetId, sheet_title);
      this.storage.set(key_cache, page_settings);
    }

    this.pageSettings[sheet_title] = page_settings;
    console.log("Parsed sheet settings: ", page_settings);

    loading.dismiss();
  }

  async loadSettings(tryLoadingFromCache = true) {
    this._state.next("loading");
    // Download settings file from drive
    const response = await gapi.client.drive.files.list({
      q: `name = '${Config.Drive.SettingsFileName}'`,
      // q: `name = 'settings.json' and 'root' in parents`,
      // q: `'appDataFolder' in parents`,
      fields: "files(id, name)"
      // spaces: 'appDataFolder'
      // spaces: 'drive'
    });
    try {
      // Use defaults as a starting point
      Object.assign(this.appSettings, Config.App.DefaultSettings);

      if (response.result.files.length == 0) {
        console.log("Unable to find settings file; Using default ...");
      } else {
        let settings_obj = {};
        const fileMeta = response.result.files[0];
        this.settingsFileId = fileMeta.id;

        const settings_raw_req = await GoogleDriveHelper.downloadFileRawWithAuth(fileMeta.id);
        if (settings_raw_req.responseType === "json") {
          settings_obj = settings_raw_req.response;
        } else if (settings_raw_req.responseType === "" || settings_raw_req.responseType === "text") {
          settings_obj = JSON.parse(settings_raw_req.response);
        } else {
          throw Error(`Unable to parse settings file`);
        }
        for (const [key, value] of Object.entries(settings_obj)) {
          if (key in this.appSettings) {
            this.appSettings[key] = value;
          }
        }
      }

      // Allow user to enter urls instead of ids
      this.appSettings.SpreadsheetId = GoogleSheetHelper.parseSpreadsheetId(this.appSettings.SpreadsheetId);
      console.log(`Found saved settings file: `, this.appSettings);

      // Download settings sheet
      const spreadsheet_meta = await GoogleSheetHelper.getSpreadsheetMetadata(this.appSettings.SpreadsheetId);
      console.log("Spreadsheet metadata: ", spreadsheet_meta);

      this.pageSettings = {};
      for (const sheet of spreadsheet_meta.result.sheets) {
        try {
          const sheet_title = sheet.properties.title as string;
          if (!sheet_title.startsWith(Config.Drive.SheetFormPrefix)) {
            continue;
          }

          await this.loadSingleFormSettings(sheet_title, tryLoadingFromCache);
        } catch (error) {
          console.error("Unable to parse sheet settings: " + sheet.properties.title);
          console.error(error);

          this.alertCtrl
            .create({
              title: "Error - Loading settings file",
              message: "Please save settings. <br>Original Message:<br> " + "\n" + JSON.stringify(error),
              buttons: ["Dismiss"]
            })
            .present();
        }
      }
    } catch (error) {
      console.log(`Couldn't load settings file`);
      this.alertCtrl
        .create({
          title: "Error - Loading settings file",
          message: "Please save settings. <br>Original Message:<br> " + "\n" + JSON.stringify(error),
          buttons: ["Dismiss"]
        })
        .present();
    }
    this._state.next("ready");
  }

  async onGoogleUser(googleUser: gapi.auth2.GoogleUser) {
    if (googleUser.isSignedIn()) {
      this.userImageUrl = googleUser.getBasicProfile().getImageUrl();

      await this.loadSettings();
      this._state.next("ready");

      const greet_message = "Welcome " + googleUser.getBasicProfile().getName() + "!";
      this.toastCtrl.create({ message: "Google Auth - " + greet_message, duration: 3000 }).present();
    } else {
      this._state.next("signed-out");
      this.userImageUrl = null;
      Object.assign(this.appSettings, new AppSettingsData());
    }
  }
}
