import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { SubmitFormComponent } from './submit-form/submit-form.component';
import { MatToolbarModule, MatButtonModule } from '@angular/material';
import { SettingsComponent } from './settings/settings.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { MaterialModule } from './material/material.module';
import { GoogleAuthService } from './google-auth.service';
import { LocalStorageModule } from 'angular-2-local-storage';
import { CovalentCommonModule, CovalentMessageModule, CovalentNotificationsModule, CovalentMenuModule } from '@covalent/core';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { GrowlModule } from 'primeng/growl';
import { MessageService } from 'primeng/components/common/messageservice';

const local_storage = LocalStorageModule.withConfig({
  prefix: 'app',
  storageType: 'localStorage',
});

@NgModule({
  declarations: [AppComponent, SubmitFormComponent, SettingsComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    AppRoutingModule,
    CovalentCommonModule,
    CovalentMessageModule,
    CovalentNotificationsModule,
    CovalentMenuModule,
    MessageModule,
    MessagesModule,
    GrowlModule,
    FlexLayoutModule,
    local_storage,
  ],
  providers: [GoogleAuthService, MessageService],
  bootstrap: [AppComponent],
})

export class AppModule { }
