import { Component } from '@angular/core';
import { AppProvider } from '../../providers/app/app';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'custom-toolbar',
  templateUrl: 'custom-toolbar.html'
})
export class CustomToolbarComponent {
  get title() {
    try {
      if (this.navController.getActive()) {
        return this.navController.getActive().instance.title;
      }
    } catch (error) { }
    return '<Loading ...>';
  }

  constructor(public appProvider: AppProvider, public navController: NavController) {
  }
}
