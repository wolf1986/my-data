import { Component } from '@angular/core';
import { AppProvider } from '../../providers/app/app';
import { Config } from '../../config';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  Config = Config;
  
  title = 'Home';
  cards_state = {};

  constructor(public appProvider: AppProvider) {  }

  ngOnInit() {  }

  isOpen(id, default_value) {
    return this.cards_state[id] || default_value;
  }
}
