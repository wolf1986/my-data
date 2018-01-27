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
  subscriptionGoogleUser: Subscription;
  msgs: Message[];

  constructor(private googleAuthService: GoogleAuthService, private messageService: MessageService) {
    this.subscriptionGoogleUser = this.googleAuthService.googleUser$.subscribe(this.onGoogleUser.bind(this));
  }

  onGoogleUser(googleUser: gapi.auth2.GoogleUser) {
    if (googleUser.isSignedIn()) {
      const greet_message = 'Welcome ' + googleUser.getBasicProfile().getName() + '!';
      this.messageService.add(
        { severity: 'success', summary: 'Google Authentication', detail: greet_message }
      );
    } else {
      this.messageService.add(
        { severity: 'warn', summary: 'Google Authentication', detail: 'Not signed in !' }
      );
    }
  }

  ngAfterViewInit() {
    this.googleAuthService.clientConfig = {
      client_id: Config.GoogleAuth.ClientId,
      scope: Config.GoogleAuth.Scopes.join(' '),
    };

    this.googleAuthService.discoveryDocs = Config.GoogleApiDiscoveryDocs;

    this.googleAuthService.initAuth2Flow().catch((error) => {
      this.messageService.add(
        { severity: 'error', summary: 'Google Authentication', detail: String(error) }
      );
    });

    // this.messageService.addAll([
    //   { severity: 'success', summary: 'Service Message', detail: 'Via MessageService' },
    //   { severity: 'info', summary: 'Info Message', detail: 'Via MessageService' }
    // ]);
  }

  ngOnDestroy(): void {
    this.subscriptionGoogleUser.unsubscribe();
  }
}
