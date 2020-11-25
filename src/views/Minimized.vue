<template>
  <div class="drag text-center">
    <v-icon size="30" id="btn-maximize" class="no-drag" @click="maximize">mdi-chevron-double-left</v-icon>
    <img class="logo" :src="require('../assets/minimized.png')">
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  methods: {
    maximize() {
      ipcRenderer.send('maximize');
    },
  },
};
</script>
<style>
.logo {
  width: 100%;
  margin-top: -5px;
}
</style>
