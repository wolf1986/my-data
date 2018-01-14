import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule } from '@angular/material';

const modules = [MatButtonModule, MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule];

@NgModule({
  imports: [CommonModule, ...modules],
  exports: modules,
  declarations: [],
})
export class MaterialModule {}
