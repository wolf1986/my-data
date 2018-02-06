import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatMomentDateModule} from '@angular/material-moment-adapter';

import { MatDatepickerModule, MatAutocompleteModule } from '@angular/material';
import { MatCardModule, MatIconModule, MatDividerModule, MatMenuModule, MatListModule } from '@angular/material';
import { MatButtonModule, MatToolbarModule, MatInputModule, MatProgressSpinnerModule } from '@angular/material';

const modules = [
  MatButtonModule, MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule, MatIconModule, MatDividerModule,
  MatMenuModule, MatListModule, MatDatepickerModule, MatMomentDateModule, MatAutocompleteModule
];

@NgModule({
  imports: [CommonModule, ...modules],
  exports: modules,
  declarations: [],
})
export class MaterialModule { }
