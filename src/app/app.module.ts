import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';

import { ReactiveFormsModule } from '@angular/forms';
import { AvatarModule } from 'ngx-avatar';

import { AppProvider } from '../providers/app/app';
import { GoogleAuthService } from '../lib/google-utils/google-auth.service';
import { FormDisplayPageModule } from '../pages/form-display/form-display.module';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { FormDisplayPage } from '../pages/form-display/form-display';
import { ComponentsModule } from '../components/components.module';

const deepLinkingConfig = {
  links: [
    { component: HomePage, name: 'Home', segment: 'home' },
    { component: SettingsPage, name: 'Settings', segment: 'settings' },
    { component: FormDisplayPage, name: 'FormDisplay', segment: 'form/:formId' },
  ]
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AvatarModule,
    FormDisplayPageModule,
    SettingsPageModule,
    ComponentsModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp, {}, deepLinkingConfig),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AppProvider,
    GoogleAuthService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    // { provide: LocationStrategy, useClass: PathLocationStrategy },
  ]
})
export class AppModule { }
