<template>
  <v-card id="loginWindow" tile height="100%">
    <v-toolbar id="header" class="drag" light flat>
      <img class="ml-n2" width="50%" :src="require('../assets/logo-reveal.png')" />
      <v-spacer></v-spacer>

      <v-btn id="btn-close" class="no-drag" text icon right small fab @click="quit">
        <v-icon color="error">close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-card-text id="content">
      <v-form v-on:submit.prevent ref="form" v-model="valid" validation>
        <v-text-field
          class="pt-7"
          prepend-icon="person"
          v-model="username"
          :rules="requiredRule"
          :label="forgot ? 'Username or email' : 'Username'"
          required
        ></v-text-field>
        <v-flex v-if="forgot" pb-11>
          <h4>Please enter your username or email to reset your password.</h4>
        </v-flex>
        <v-text-field
          v-if="!forgot"
          prepend-icon="lock"
          v-model="password"
          :rules="requiredRule"
          label="Password"
          type="password"
          required
        ></v-text-field>
        <v-flex text-right>
          <a id="toggle-forgot" @click="forgot = !forgot" class="text-right">
            <v-icon v-if="forgot">arrow_back</v-icon>
            {{forgot ? "Back" : "Forgot?"}}
          </a>
          <div id="alert-container" class="pt-2 p-b2 text-left">
            <v-alert
              id="alert-box"
              dark
              dismissible
              elevation="2"
              v-model="alert.show"
              :color="alert.type"
              :data-test="alert.message"
            >{{alert.message}}</v-alert>
          </div>
        </v-flex>

        <div v-if="!forgot" class="my-2">
          <v-btn
            id="btn-login"
            block
            color="primary"
            type="submit"
            :disabled="!valid"
            @click="login"
          >Login</v-btn>
        </div>
        <div v-if="forgot" class="my-2">
          <v-btn id="btn-reset" block color="primary" :disabled="!username" @click="resetPwd">Reset</v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { ipcRenderer } from 'electron';
import api from '../services/api.js';
import { mapState, mapActions } from 'vuex';
import electronSettings from 'electron-settings';

export default {
  data: () => ({
    drawer: null,
    valid: false,
    username: null,
    requiredRule: [v => !!v || 'This field is required'],
    password: null,
    alert: {
      show: false,
      type: 'error',
      message: 'Invalid username or password!',
    },
    forgot: false,
  }),
  methods: {
    ...mapActions(['SET_USER']),
    quit() {
      ipcRenderer.send('quit');
    },
    async login() {
      console.log(this.username, this.password);
      const result = await api.login({
        username: this.username,
        password: this.password,
      });
      if (!result.success) {
        this.alert = { show: true, type: 'error', message: result.error };
        return;
      }
      electronSettings.set('user', result.user);
      this.SET_USER(result.user);
      // We're in, initialise and re-route
      ipcRenderer.send('init-user');
      ipcRenderer.send('close-window', 'LOGIN');
      ipcRenderer.send('open-window', 'BLOCKS');
    },
    async resetPwd() {
      api.putLog('RESETPWD');
      const result = await api.forgotPwd(this.username);
      if (!result.success) {
        this.alert = {
          show: true,
          type: 'error',
          message: "Ooops, we don't recognise that username!",
        };
      } else {
        this.alert = {
          show: true,
          type: 'success',
          message: 'Thanks, please check your email!',
        };
        this.forgot = false;
      }
    },
  },
};
</script>
<style scoped>
#loginWindow {
  border-radius: 10px;
}
#header {
  background-color: #f5f5f5;
  border-radius: 10px 10px 0px 0px;
}
#content {
  padding-top: 0px;
}
#alert-box {
  padding: 9px 9px 9px 19px;
  margin: 0px;
  font-size: 14px;
}
#alert-container {
  min-height: 40px;
}
  
</style>
