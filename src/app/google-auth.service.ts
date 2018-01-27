import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { NgZone } from '@angular/core';
import { Config } from './config';

type Action<T> = (param: T) => void;

@Injectable()
export class GoogleAuthService {
  private _googleUserSource = new Subject<gapi.auth2.GoogleUser>();
  private _deferredInitCompleted = new Deferred();

  public googleUser$ = this._googleUserSource.asObservable();
  public promiseInitCompleted = this._deferredInitCompleted.promise;
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
    this._deferredInitCompleted.resolve();
  }

  public onGoogleSignIn(googleUser: gapi.auth2.GoogleUser) {
    this._googleUserSource.next(googleUser);
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
  clientConfig: gapi.auth2.ClientConfig, discoveryDocs: string[], onSignInStateChanged?: Action<gapi.auth2.GoogleUser>) {
  await new Promise((resolve, reject) => {
    console.log('Loading gapi...');
    gapi.load('auth2:client', resolve);
  });

  gapi.client.init({
    discoveryDocs: discoveryDocs,
  });

  const auth2 = gapi.auth2.init(clientConfig);

  console.log('Waiting for gapi.auth2.init() ...');
  await auth2.then(null, null);

  console.log('GooglAuth initialization finished !');

  if (onSignInStateChanged) {
    auth2.currentUser.listen(onSignInStateChanged);

    onSignInStateChanged(auth2.currentUser.get());
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
