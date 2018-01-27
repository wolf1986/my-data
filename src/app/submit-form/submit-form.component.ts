import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GoogleSheetHelper } from '../google_sheet_helper';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
  selector: 'app-submit-form',
  templateUrl: './submit-form.component.html',
  styleUrls: ['./submit-form.component.scss'],
})

export class SubmitFormComponent implements OnInit {
  @ViewChild('submitForm') form: NgForm;

  constructor(private localStorage: LocalStorageService) {
  }

  ngOnInit() { }

  async onSubmit() {
    const settings = this.localStorage.get('settings');


    const form_values = this.form.control.value;
    console.log(form_values);

    await GoogleSheetHelper.appendRows(settings['spreadsheet_id'], settings['range'], [
      form_values['date'],
      form_values['category'],
      form_values['sum'],
      form_values['details'],
    ]);
  }
}
