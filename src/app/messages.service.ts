import { Injectable } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

const titleCasePipe = new TitleCasePipe();


export class AppNotificationMessage {
  type: 'info' | 'warning' | 'error';
  content: string;

  constructor(obj: object) {
    Object.assign(this, obj);
  }

  public get title(): string {
    return titleCasePipe.transform(this.type);
  }

  public get color(): string {
    const map = {
      'info': 'accent',
      'warning': 'primary',
      'error': 'warn',
    };

    return map[this.type];
  }
}

@Injectable()
export class MessagesService {
  count: number;
  messages: AppNotificationMessage[];

  constructor() {
    this.count = 0;
    this.messages = [];

    this.messages.push(...[
      new AppNotificationMessage({
        type: 'info',
        content: 'Hello info!',
      }),
      new AppNotificationMessage({
        type: 'warning',
        content: 'Hello info!',
      }),
      new AppNotificationMessage({
        type: 'error',
        content: 'Hello info!',
      }),
    ]);
  }
}
