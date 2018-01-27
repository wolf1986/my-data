import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { GoogleAuthService } from '../google-auth.service';
import { Subscription } from 'rxjs/Subscription';
import { LocalStorageService } from 'angular-2-local-storage';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('settingsForm') form: NgForm;

  private _subscriptionFormChanges: Subscription;

  constructor(public googleAuthService: GoogleAuthService, private localStorageService: LocalStorageService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.googleAuthService.promiseInitCompleted.then(() => {
      const auth2 = gapi.auth2.getAuthInstance();
      auth2.attachClickHandler(
        document.getElementById('googleBtn'), {}, null, null);
    });

    setTimeout(this._updateValues.bind(this), 0);
  }

  _updateValues() {
    let settings = this.localStorageService.get('settings');
    if (settings == null) {
      settings = {};
    }

    for (const [key, value] of Object.entries(settings)) {
      try {
        this.form.controls[key].setValue(value);
      } catch (error) {
        console.log('Unexpected settings value found: ');
        console.log(key);
      }
    }

    this._subscriptionFormChanges = this.form.control.valueChanges.subscribe(this._saveValuesToStorage.bind(this));
  }

  public _saveValuesToStorage(values) {
    this.localStorageService.set('settings', values);
  }

  public onSignOutClicked() {
    const auth2 = gapi.auth2.getAuthInstance().signOut();
  }

  ngOnDestroy() {
    this._subscriptionFormChanges.unsubscribe();
  }
}
