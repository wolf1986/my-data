<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu">
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>My Data</q-toolbar-title>
        <div class="q-gutter-sm row items-center no-wrap">
          <!-- <q-btn round dense flat icon="apps">
            <q-tooltip anchor="center left" self="center middle">Google Apps</q-tooltip>
          </q-btn>
          <q-btn round dense flat icon="notifications">
            <q-badge color="red" text-color="white" floating>2</q-badge>
            <q-tooltip anchor="center left" self="center middle">Notifications</q-tooltip>
          </q-btn> -->

          <!-- Spinner placeholder while trying to authenticate -->
          <q-btn round color="blue-grey-5" v-if="!isAuthFinished || !isSignedIn" size="13px">
            <q-menu auto-close v-if="isAuthFinished">
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="signIn">
                  <q-item-section>Sign-In</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-avatar size="26px">
              <q-spinner color="primary" size="20px" v-if="!isAuthFinished" />
              <q-icon name="fas fa-user" v-else />
            </q-avatar>
            <q-tooltip anchor="center left" self="center middle">Account</q-tooltip>
          </q-btn>

          <!-- User avatar after logged in -->
          <q-btn round color="blue-grey-5" v-if="isAuthFinished && isSignedIn" size="13px">
            <q-menu auto-close>
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="signOut">
                  <q-item-section>Sign-Out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-avatar size="35px">
              <img :src="userImageUrl" v-if="userImageUrl" />
              <span v-else>{{userName.charAt(0)}}</span>
            </q-avatar>
            <q-tooltip anchor="center left" self="center middle">Account</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <q-list>
        <q-item-label header>Menu</q-item-label>

        <!-- Sign In -->
        <q-item clickable tag="a" v-if="isAuthFinished && !isSignedIn" v-on:click="signIn">
          <q-item-section avatar>
            <q-icon name="fas fa-key" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sign-in</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Sign Out -->
        <q-item clickable tag="a" v-if="isAuthFinished && isSignedIn" v-on:click="signOut">
          <q-item-section avatar>
            <q-icon name="fas fa-sign-out-alt" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sign-out</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Debug -->
        <!-- <q-item>
          <q-item-section>
            <q-item-label>User: {{userName.charAt(0)}}</q-item-label>
          </q-item-section>
        </q-item>-->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { openURL } from 'quasar';
import Vue from 'vue';
import { GoogleAuthHelper } from '../lib/google-utils/google-auth-helper';

export default Vue.extend({
  name: 'MyLayout',
  data() {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      isAuthFinished: false,
      isSignedIn: false,
      userName: '?',
      userImageUrl: ''
    };
  },
  created() {
    const self = this;
    console.log('Component created');

    GoogleAuthHelper.clientConfig = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_id: '442618660562-7nlckakrfi4gmtgqg1bnjkganvc28fu8.apps.googleusercontent.com',
      scope: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appdata'
      ].join(' ')
    };

    GoogleAuthHelper.discoveryDocs = [
      'https://sheets.googleapis.com/$discovery/rest?version=v4',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ];

    self.$root.$on('/google-auth/signInStateChanged', function(user: gapi.auth2.GoogleUser) {
      console.log('event: /google-auth/signInStateChanged', user);
      self.isAuthFinished = true;

      if (user && user.isSignedIn()) {
        self.isSignedIn = true;
        self.userName = user.getBasicProfile().getName();
        self.userImageUrl = user.getBasicProfile().getImageUrl();
      } else {
        self.isSignedIn = false;
        self.userName = '?';
        self.userImageUrl = '';
      }
    });

    self.$root.$on('/error', function(message: string) {
      console.log('event: /error', message);
      self.$q
        .dialog({
          title: 'Error',
          message: message,
          ok: {
            push: true
          },
          persistent: true
        })
        .onOk(() => {});
    });

    GoogleAuthHelper.registerOnLoadHandler(function(user) {
      self.$root.$emit('/google-auth/signInStateChanged', user);
    });
  },
  methods: {
    openURL,
    signIn: function() {
      const self = this;
      GoogleAuthHelper.signIn().catch(function(reason: object) {
        console.log('signIn()');
        const msg = 'Unable to sign in to Google: ' + JSON.stringify(reason);
        self.$root.$emit('/error', msg);
      });
    },
    signOut: function() {
      const self = this;
      GoogleAuthHelper.signOut().catch(function(reason: object) {
        console.log('signOut()');
        const msg = 'Unable to sign out from Google: ' + JSON.stringify(reason);
        self.$root.$emit('/error', msg);
      });
    },
  }
});
</script>

<style>
</style>
