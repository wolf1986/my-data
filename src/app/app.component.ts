import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { GoogleAuthService } from './google-auth.service';
import { Config } from './config';
// import { MessagesService } from './messages.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnDestroy, AfterViewInit {
  messages: string;
  subscriptionGoogleUser: Subscription;
  msgs: Message[];

  constructor(private googleAuthService: GoogleAuthService, private messageService: MessageService) {
    this.subscriptionGoogleUser = this.googleAuthService.googleUser$.subscribe(this.onGoogleUser);
    this.msgs = [];
  }

  onGoogleUser(googleUser: gapi.auth2.GoogleUser) {
    console.log(googleUser);
  }

  ngAfterViewInit() {
    this.googleAuthService.clientConfig = {
      client_id: Config.GoogleAuth.ClientId,
      scope: Config.GoogleAuth.Scopes.join(' '),
    };

    this.googleAuthService.discoveryDocs = Config.GoogleApiDiscoveryDocs;

    this.googleAuthService.initAuth2Flow().catch((error) => {
      this.messages = String(error);
    });
  }

  ngOnDestroy(): void {
    this.subscriptionGoogleUser.unsubscribe();
  }
}
