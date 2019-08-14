declare interface Window {
  gapiLoaded: boolean;
  onGapiLoad: Function;
}

declare const window: Window;
export async function initAuth2Flow(
  clientConfig: gapi.auth2.ClientConfig,
  discoveryDocs: string[],
  onSignInStateChanged?: (user: gapi.auth2.GoogleUser) => void
) {
  if (!onSignInStateChanged) {
    onSignInStateChanged = user => {
      user;
    };
  }

  await new Promise((resolve, reject) => {
    console.log('Loading gapi...');
    gapi.load('client:auth2', resolve);
  });

  await gapi.client.init({
    discoveryDocs: discoveryDocs
  });

  console.log('Waiting for gapi.auth2.init() ...');
  const auth2 = gapi.auth2.init(clientConfig);

  await auth2.then(() => {}, () => {});

  console.log('Google Auth initialization finished !');

  let previousUserId: string | null = null;
  function _onSignInStateChangedWrapper(user: gapi.auth2.GoogleUser) {
    if (user.isSignedIn() && previousUserId === user.getId()) {
      return;
    }

    if (!user.isSignedIn()) {
      previousUserId = null;
    } else {
      previousUserId = user.getId();
    }

    if (onSignInStateChanged) onSignInStateChanged(user);
  }

  if (onSignInStateChanged) {
    auth2.currentUser.listen(_onSignInStateChangedWrapper);

    _onSignInStateChangedWrapper(auth2.currentUser.get());
  }
}

// eslint-disable-next-line
class _GoogleAuthHelper {
  public clientConfig: gapi.auth2.ClientConfig = {};
  public discoveryDocs: string[] = [];
  public isAuthFinished: boolean = false;

  public async signOut() {
    await gapi.auth2.getAuthInstance().signOut();
  }

  public async signIn() {
    await gapi.auth2.getAuthInstance().signIn({ prompt: 'select_account' });
  }

  public registerOnLoadHandler(onSignInStateChanged?: (user: gapi.auth2.GoogleUser) => void) {
    const self = this;
    function onGapiLoad() {
      console.log('onGapiLoad()');
      initAuth2Flow(self.clientConfig, self.discoveryDocs, onSignInStateChanged).then(function() {
        self.isAuthFinished = true;
      });
    }

    if (!window.gapiLoaded) {
      window.onGapiLoad = function() {
        onGapiLoad();
      };
    } else {
      onGapiLoad();
    }
  }
}

export const GoogleAuthHelper = new _GoogleAuthHelper();

// To init google-api automatically after the load of `platform.js` - add the following lines to  `index.html` file
// 
// <script>
// var gapiLoaded = false;
// function onGapiLoad() {
//   gapiLoaded = true;
// }
// </script>
// <script src="https://apis.google.com/js/platform.js?onload=onGapiLoad" async defer></script>