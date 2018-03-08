import { Component, Input } from '@angular/core';
import { CalendarModal, CalendarModalOptions, CalendarResult } from "ion2-calendar";
import { ModalController } from 'ionic-angular';

import * as moment from 'moment';

@Component({
  selector: 'dynamic-form',
  templateUrl: 'dynamic-form.html',
})
export class DynamicFormComponent {
  controlsModel: DynamicFormControl[] = [];

  @Input('controls') set controls(value: DynamicFormControl[] | { [id: string]: DynamicFormControl }) {
    if (Array.isArray(value)) {
      this.controlsModel = value;
    } else {
      this.controlsModel = Object.values(value);
    }
  }

  @Input('dateFormat') dateFormat: string;

  constructor(public modalCtrl: ModalController) {
    this.controls = [];
    this.dateFormat = 'YYYY-MM-DD'
  }

  newlineToBr(text) {
    return text.replace(/\n/g, '<br>');
  }

  setDate(valueObject, valueKey = 'value') {
    const dateInitial = valueObject[valueKey];
    const options: CalendarModalOptions = {
      title: 'Select Date',
      defaultDate: dateInitial,
      // from: 0,
      to: 0,
      canBackwardsSelected: true,
      defaultScrollTo: moment(dateInitial).toDate()
    };

    const myCalendar = this.modalCtrl.create(
      CalendarModal,
      {
        options: options
      });

    myCalendar.present();
    myCalendar.onDidDismiss((date: CalendarResult, type: string) => {
      if (type === 'done') {
        valueObject[valueKey] = moment(date.dateObj).format(this.dateFormat);
      }
    });
  }

  formatTime(isoTime) {
    return moment(isoTime).format('HH:mm');
  }
}

export interface DynamicFormControl {
  description?: string,
  descriptionHtml?: string,
  label: string;
  type: 'text' | 'textarea' | 'select' | 'autocomplete' | 'date' | 'time' | 'hidden';
  options?: string[];
  value?: string;
  valueMagic?: string;
  placeholder?: string;
}

// const CONTROLS_DEMO = [
//   {
//     label: 'Select an option',
//     type: 'select',
//     options: ['opt1', 'opt2', 'opt3'],
//     value: 'opt1',
//   },
//   {
//     label: 'Enter some text',
//     type: 'text',
//     placeholder: '',
//     value: null,
//   },
//   {
//     label: 'Enter long text',
//     type: 'textarea',
//     placeholder: '',
//     value: null,
//   },
//   {
//     label: 'Autocomplete Lbl',
//     placeholder: 'Autocomplete PH',
//     type: 'autocomplete',
//     options: ['opt1', 'opt2', 'opt3'],
//     value: 'opt2',
//   },
//   {
//     label: 'Date Lbl',
//     type: 'date',
//     value: '2018-02-26',
//   },
//   {
//     label: 'Date Lbl2',
//     type: 'date',
//     value: '2018-02-25',
//   },
// ];