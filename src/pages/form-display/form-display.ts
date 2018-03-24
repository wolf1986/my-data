import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppProvider } from '../../providers/app/app';

import * as _ from 'lodash';
import * as moment from 'moment';

import { GoogleSheetForm } from '../../lib/google-utils/google-sheet-form';
import { DynamicFormControl } from '../../components/dynamic-form/dynamic-form'
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-form-display',
  templateUrl: 'form-display.html',
})
export class FormDisplayPage {
  formId: string;
  controlsModel: DynamicFormControl[];
  subscriptions = new Subscription();

  get title() {
    return this.formId;
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public appProvider: AppProvider
  ) {
    this.formId = navParams.get('formId');

    this.subscriptions.add(
      this.appProvider.state$.subscribe(this.stateChanged.bind(this))
    );

    this.stateChanged(this.appProvider.state);
  }

  stateChanged(state) {
    if (state === 'ready') {
      this.controlsModel = this.createDynamicFormControls(this.appProvider.pageSettings[this.formId]);
    } else {
      this.controlsModel = [];
    }
  }

  resetOriginalControls() {
    this.controlsModel = this.createDynamicFormControls(this.appProvider.pageSettings[this.formId]);
  }

  async submit() {
    const loading = this.appProvider.loadingCtrl.create({
      content: 'Waiting for Google Server'
    });

    loading.present();

    try {
      const values = this.controlsModel.map(c => c.value);
      await GoogleSheetForm.appendSheetRowWithSettings(
        values, this.appProvider.pageSettings[this.formId]
      );

      this.appProvider.toastCtrl
        .create({ message: 'Submitted successfully !', showCloseButton: true })
        .present();
    } catch (error) {
      this.appProvider.alertCtrl
        .create({
          title: 'Error',
          message: JSON.stringify(error),
          buttons: ['Dismiss'],
        }).present();
    }

    loading.dismiss();
  }

  createDynamicFormControls(settings: GoogleSheetForm.IPageSettings) {
    return settings.FieldNames.map((field_name, i) => {
      const field = settings.Fields[field_name];
      const control: DynamicFormControl = {
        label: field_name,
        type: field.Type.toLowerCase() as any,
        value: field.DefaultValue || '',
        placeholder: field.Placeholder || '',
      };

      const userProfile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();

      // if (field.DefaultValue !== null) { control['default'] = field.DefaultValue; }
      if (field.DefaultValue !== null) { control.value = field.DefaultValue; }

      if (field.DefaultValue === '__USER_NAME__') { control.value = userProfile.getName(); }
      if (field.DefaultValue === '__USER_EMAIL__') { control.value = userProfile.getEmail(); }

      if (field.Autocomplete.toLowerCase() == 'history') {
        control.type = 'autocomplete';
        control.options = field.Options;
      }

      // Initialize select values to first option
      if (['select', 'autocomplete'].includes(control.type) && control.options.length > 0) {
        if (!control.value) {
          control.value = control.options[0];
        }
        if (!control.options.includes(control.value)) {
          control.options = _.sortedUniq([... control.options, control.value].sort());
        }
      }

      if (control.type === 'date' && !control.value) {
        control.value = moment().format(this.appProvider.appSettings.DateFormat)
      }

      if (control.type === 'time') {
        if (!control.value) {
          control.value = moment().format('HH:mm')
        }

        control.valueMagic = moment(control.value, 'HH:mm').local().format()
      }

      return control;
    });
  }

  ionViewDidLeave() {
    this.subscriptions.unsubscribe();
  }
}
