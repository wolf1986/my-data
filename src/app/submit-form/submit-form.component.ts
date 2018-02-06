import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment';
import * as _ from 'lodash';
import { AppService } from '../app.service';
import { GoogleSheetHelper } from '../../google-utils/google_sheet_helper';

export class ReportRow {
  date = moment();
  category = '';
  sumVera = '';
  sumWilly = '';
  details = '';
}

@Component({
  selector: 'app-submit-form',
  templateUrl: './submit-form.component.html',
  styleUrls: ['./submit-form.component.scss'],
})

export class SubmitFormComponent {
  public reportRow = new ReportRow();

  constructor(public appService: AppService) { }

  async onSubmit() {
    try {
      const result = await GoogleSheetHelper.appendRows(
        this.appService.settings.spreadsheet_id, this.appService.settings.range,
        [
          this.reportRow.date.format('YYYY-MM-DD'),
          this.reportRow.category,
          this.reportRow.sumVera,
          this.reportRow.sumWilly,
          this.reportRow.details,
        ]
      );

      console.log('Form submitted successfully:');
      console.log(result);
      this.appService.messageService.add(
        { severity: 'success', summary: 'Row appended', detail: 'Updated range: <br><br>' + result.result.updates.updatedRange }
      );

    } catch (error) {
      console.log('Error while submitting form:');
      console.error(error);
      const full_message = `"${error.result.error.message}"<br><br>Please make sure that the settings are correct, and try again later`;
      this.appService.messageService.add(
        { severity: 'error', summary: 'Form Submission Failed', detail: full_message }
      );
    }
  }
}
