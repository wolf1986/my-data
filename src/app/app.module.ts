import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { SubmitFormComponent } from './submit-form/submit-form.component';
import { MatToolbarModule, MatButtonModule, MAT_DATE_FORMATS } from '@angular/material';
import { SettingsComponent } from './settings/settings.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { MaterialModule } from './material/material.module';

import { CovalentMessageModule, CovalentNotificationsModule, CovalentMenuModule, CovalentCommonModule } from '@covalent/core';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { GrowlModule } from 'primeng/growl';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppService } from './app.service';
import { HttpClientModule } from '@angular/common/http';
import { GoogleAuthService } from '../google-utils/google-auth.service';
import { SheetPreviewComponent } from './sheet-preview/sheet-preview.component';

const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    // dateA11yLabel: 'LL',
    // monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [AppComponent, SubmitFormComponent, SettingsComponent, SheetPreviewComponent],
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
    FlexLayoutModule,
    MessageModule,
    MessagesModule,
    GrowlModule,
    HttpClientModule,
  ],
  providers: [
    GoogleAuthService,
    MessageService,
    AppService,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  bootstrap: [AppComponent],
})

export class AppModule { }
