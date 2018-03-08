import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormDisplayPage } from './form-display';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    FormDisplayPage,
  ],
  imports: [
    IonicPageModule.forChild(FormDisplayPage),
    ComponentsModule,
  ],
})
export class FormDisplayPageModule {}
