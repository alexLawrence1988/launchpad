<template>
  <v-card max-width="344">
    <v-list-item three-line>
      <v-list-item-content id='update-card-content' class="pa-0">
        <v-list-item-avatar size="55" tile>
          <v-img id='img-brand-logo' class="drag" width="50" :src="require('../assets/logo-reveal.png')"></v-img>
        </v-list-item-avatar>
        <v-list-item-title id='update-card-title' class="headline mb-1">Update available</v-list-item-title>
        <v-list-item-subtitle id='update-card-subtitle'>A new update is ready. Please install it to receive all the latest cool features.</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-card-actions id='update-card-actions'>
      <v-spacer></v-spacer>
      <v-btn id='btn-update-later' text @click="close()">Later</v-btn>
      <v-btn id='btn-update-now' text color="green" @click="update()">Update</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  methods: {
    update() {
      ipcRenderer.send('install-update');
    },
    close() {
      ipcRenderer.send('hide-window', 'UPDATE');
    },
  },
};
</script>
