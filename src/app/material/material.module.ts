import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatIconModule, MatDividerModule, MatMenuModule, MatListModule } from '@angular/material';
import { MatButtonModule, MatToolbarModule, MatInputModule, MatProgressSpinnerModule } from '@angular/material';

const modules = [
  MatButtonModule, MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule, MatIconModule, MatDividerModule,
  MatMenuModule, MatListModule,
];

@NgModule({
  imports: [CommonModule, ...modules],
  exports: modules,
  declarations: [],
})
export class MaterialModule { }
