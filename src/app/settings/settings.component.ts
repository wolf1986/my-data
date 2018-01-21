import { Component, OnInit } from '@angular/core';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { GoogleAuthService } from '../google-auth.service';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit, AfterViewInit {
  fields: any;

  constructor(public googleAuthService: GoogleAuthService) {
    this.fields = {};
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.googleAuthService.promiseInitCompleted.then(() => {
      const auth2 = gapi.auth2.getAuthInstance();
      auth2.attachClickHandler(
        document.getElementById('googleBtn'), {}, null, null);
    });
  }

  public onSignOutClicked() {
    const auth2 = gapi.auth2.getAuthInstance().signOut();
  }
}
