<template>
  <v-app-bar id="title-bar" class="drag" fixed flat app>
    <img class="ml-n2" width="50%" :src="require('../assets/logo-reveal.png')">
    <v-spacer></v-spacer>
    <div class="no-drag mr-n3">
      <!-- Undo button start -->
      <v-btn
        id="btn-undo"
        small
        icon
        :disabled="dismissedVisits.length === 0"
        @click="POP_DISMISSEDVISITS()"
      >
        <v-icon style="transform:scaleX(-1);">mdi-refresh</v-icon>
      </v-btn>
      <!-- Undo button finish -->
      <!-- Settings menu start -->
      <v-menu v-model="menu" offset-x :close-on-content-click="false" :nudge-width="200">
        <template v-slot:activator="{ on }">
          <v-btn id="btn-settings" v-on="on" small icon>
            <v-icon>mdi-settings-outline</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-list-item>
            <v-list-item-avatar id="acct-avatar" class="ml-n1 mr-3">
              <v-icon x-large>mdi-account-circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title id="user-name">{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle id="portal-name">{{ user.portal }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>

          <v-list>
            <v-list-item>
                <v-slider label="Opacity" id="opacity" tick-size="5" validate-on-blur min="30" v-model="opacity"></v-slider>
            </v-list-item>
            <v-list-item>
              <v-btn
                id="btn-all-settings"
                small
                block
                color="primary"
                @click="showSettings()"
              >Edit Filters</v-btn>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn id="btn-quit" text @click="logout()">Logout</v-btn>
            <v-btn id="btn-quit" text color="error" @click="quit()">Quit</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
      <!-- Settings menu finish -->
      <!-- Minimize app start -->
      <v-menu v-model="showMinimizeContextMenu" right>
        <template v-slot:activator="{ MinimizeMenuOn }">
          <v-btn
            id="btn-minimize"
            ref="btnMinimize"
            small
            icon
            @click="minimize()"
            @contextmenu="showMinimizeContextMenu = !showMinimizeContextMenu"
          >
            <v-icon size="30">mdi-chevron-double-right</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-btn text block @click="minimize((60 * 1000) * 5)">5 minutes</v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn text block @click="minimize((60 * 1000) * 60)">1 hour</v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn text block @click="minimize((60 * 1000) * 240)">4 hours</v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- Minimize app finish -->
    </div>
    <v-progress-linear
      :active="loading"
      indeterminate
      absolute
      bottom
      color="primary accent-4"
    ></v-progress-linear>
  </v-app-bar>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState, mapActions } from 'vuex';
import api from '../services/api.js';

export default {
  data: () => ({
    fav: true,
    menu: false,
    message: false,
    hints: true,
    showMinimizeContextMenu: false,
  }),
  computed: {
    ...mapState(['user', 'dismissedVisits', 'loading']),
    opacity: {
      get() {
        return this.$store.state.settings.opacity;
      },
      set(opacity) {
        this.UPDATE_SETTINGS({ opacity });
      },
    },
  },
  methods: {
    ...mapActions(['UPDATE_SETTINGS', 'POP_DISMISSEDVISITS']),
    showSettings() {
      this.menu = false;
      ipcRenderer.send('open-window', 'SETTINGS');
    },
    logout() {
      this.menu = false;
      api.logout();
    },
    quit() {
      api.putLog('QUITAPP');
      ipcRenderer.send('quit');
    },
    minimize(delay = (60 * 1000) * 5) {
      this.$refs.btnMinimize.$el.blur(); // remove focus from button when we minimize
      ipcRenderer.send('minimized-visit-id', this.$store.state.blocks.length ? this.$store.state.blocks[0].visitId : 0);
      ipcRenderer.send('minimize', delay);
    },
  },
};
</script>

<style>
#title-bar {
  background-color: #f5f5f5;
  border-radius: 10px;
}
</style>
