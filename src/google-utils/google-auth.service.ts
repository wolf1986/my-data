import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { NgZone } from '@angular/core';

type Action<T> = (param: T) => void;

@Injectable()
export class GoogleAuthService {
  private _googleUser = new Subject<gapi.auth2.GoogleUser>();
  private _deferredInitCompleted = new Deferred();

  public googleUser$ = this._googleUser.asObservable();
  public promiseInitCompleted = this._deferredInitCompleted.promise;
  public actionBeforeInitCompleted?: () => Promise<void>;
  public isSignedIn = false;
  public initCompleted = false;

  public clientConfig: gapi.auth2.ClientConfig;
  public discoveryDocs: string[];

  constructor(private _zone: NgZone) {
  }

  async initAuth2Flow() {
    if (this.initCompleted) {
      return;
    }

    await _initAuth2Flow(
      this.clientConfig, this.discoveryDocs,
      (x) => this._zone.run(() => this.onGoogleSignIn(x))
    );

    this.initCompleted = true;
    await this.actionBeforeInitCompleted();

    this._deferredInitCompleted.resolve();
  }

  public onGoogleSignIn(googleUser: gapi.auth2.GoogleUser) {
    setTimeout(() => {
      this._googleUser.next(googleUser);
    });

    this.isSignedIn = googleUser.isSignedIn();

    if (!this.isSignedIn) {
      console.log('User is now signed out !');
    } else {
      const profile = googleUser.getBasicProfile();
      console.log('User is now signed in !');
      console.log('Token || ' + googleUser.getAuthResponse().id_token);
      console.log('ID: ' + profile.getId());
      console.log('Name: ' + profile.getName());
      console.log('Image URL: ' + profile.getImageUrl());
      console.log('Email: ' + profile.getEmail());
    }
  }
}

async function _initAuth2Flow(
  clientConfig: gapi.auth2.ClientConfig, discoveryDocs: string[],
  onSignInStateChanged?: Action<gapi.auth2.GoogleUser>
) {
  if (!onSignInStateChanged) {
    onSignInStateChanged = (x) => { };
  }

  await new Promise((resolve, reject) => {
    console.log('Loading gapi...');
    gapi.load('client:auth2', resolve);
  });

  await gapi.client.init({
    discoveryDocs: discoveryDocs,
  });

  console.log('Waiting for gapi.auth2.init() ...');
  const auth2 = gapi.auth2.init(clientConfig);
  await auth2.then(null, null);

  console.log('Google Auth initialization finished !');

  let _previous_user_id = null;
  function _onSignInStateChangedWrapper(user: gapi.auth2.GoogleUser) {
    if (user.isSignedIn() && _previous_user_id === user.getId()) {
      return;
    }

    if (!user.isSignedIn()) {
      _previous_user_id = null;
    } else {
      _previous_user_id = user.getId();
    }

    onSignInStateChanged(user);
  }

  if (onSignInStateChanged) {
    auth2.currentUser.listen(_onSignInStateChangedWrapper);

    _onSignInStateChangedWrapper(auth2.currentUser.get());
  }
}

export class Deferred {
  reject: (reason?: any) => void;
  resolve: (value?: {} | PromiseLike<{}>) => void;
  promise: Promise<{}>;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
