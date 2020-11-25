<template>
  <v-app :style="{ opacity: settings.opacity/100 }" :class="isHome ? 'main-window' : ''" >
    <ToolBar v-if="isHome" />
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState } from 'vuex';
import ToolBar from './components/ToolBar.vue';

export default {
  components: {
    ToolBar,
  },
  computed: {
    ...mapState(['settings']),
    isHome: function () {
      return this.$route.name === 'home';
    },
  },
};
</script>

<style>
::-webkit-scrollbar {
  width: 0px;
  background-color: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background-color: #bbb;
  border-radius: 10px;
}

.main-window {
  height: 100vh;
  overflow: hidden;
}

body {
  padding: 0px;
  margin: 0px;
}

.drag {
  -webkit-app-region: drag;
}

.no-drag {
 -webkit-app-region: no-drag;
}

#app {
  border-radius: 10px;
}
</style>
