import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { AppProvider } from '../providers/app/app';
import { FormDisplayPage } from '../pages/form-display/form-display';

import * as detect_browser from 'detect-browser'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = HomePage;
  pages: Array<{ title: string, component: any }>;

  constructor(
    platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public appProvider: AppProvider
  ) {
    this.pages = [
      { title: 'Home', component: this.rootPage },
      { title: 'Settings', component: SettingsPage },
    ]

    platform.ready().then(() => {
      const b = detect_browser.detect();
      console.log(b);
      
      statusBar.styleDefault();
      splashScreen.hide();

      this.appProvider.initGoogleService();
    });
  }

  openPage(page) {
    // this.zone.run(() => {
    //   this.navCtrl.setRoot(TabsPage);
    // });

    this.nav.setRoot(page.component);
  }

  openForm(formId) {
    this.nav.setRoot(FormDisplayPage, {
      formId: formId
    });
  }
}

