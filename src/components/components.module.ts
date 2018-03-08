import { NgModule, LOCALE_ID } from '@angular/core';
import { DynamicFormComponent } from './dynamic-form/dynamic-form';
import { IonicModule } from 'ionic-angular';
import { AutosizeModule } from 'ionic2-autosize';
import { AvatarModule } from 'ngx-avatar';

import { CalendarModule } from "ion2-calendar";
import { CustomToolbarComponent } from './custom-toolbar/custom-toolbar';

@NgModule({
	declarations: [
		DynamicFormComponent,
		CustomToolbarComponent,
	],
	imports: [
		AutosizeModule,
		IonicModule,
		CalendarModule,
		AvatarModule,
	],
	exports: [
		DynamicFormComponent,
		CustomToolbarComponent,
	],
	providers: [{ provide: LOCALE_ID, useValue: "en-GB" }]
})
export class ComponentsModule { }
