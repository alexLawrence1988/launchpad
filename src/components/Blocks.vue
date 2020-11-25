<template>
  <v-container class="blocks pa-1">
    <v-row no-gutters>
      <v-col cols="12" data-test-type="blocks">
        <Block
          v-for="(block, index) in filteredBlocks"
          :key="block.visitId"
          class="mb-2"
          :block="block"
          :index="index"
        ></Block>
      </v-col>
    </v-row>
    <!-- provides a buffer for the gradient to scroll off -->
    <v-row no-gutters style="height:45px"></v-row>
    <!-- Main snackbar -->
    <v-snackbar
      id="snackbar-main"
      v-model="mainSnackbar.visible"
      :color="mainSnackbar.color"
      :timeout="mainSnackbar.timeout"
      :data-test-value="mainSnackbar.message"
    >{{ mainSnackbar.message }}</v-snackbar>
    <!-- Error snackbar (with support link) --->
    <v-snackbar
      id="snackbar-error"
      v-model="errorSnackbar.visible"
      :color="errorSnackbar.color"
      :timeout="0"
      :data-test="errorSnackbar.message"
    >
      <div>
        {{ errorSnackbar.message }}
        <div v-if="errorSnackbar.showSupportLink">
          If the problem persists, please contact our
          <a style="color:inherit" href="#" @click="openSupportLink()">support team</a>.
        </div>
      </div>
      <v-btn id="btn-close-toaster" icon x-small @click="errorSnackbar.visible = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import { shell } from 'electron';
import { mapState } from 'vuex';
import Block from './Block.vue';

export default {
  components: {
    Block,
  },
  computed: {
    ...mapState(['blocks', 'triggerReportList', 'triggerReportColors', 'settings', 'dismissedVisits', 'mainSnackbar', 'errorSnackbar']),
    filteredBlocks() {
      const dismissedVisitIds = this.dismissedVisits.map(d => d.visitId);
      return this.blocks.filter(b => !dismissedVisitIds.includes(b.visitId));
    },
  },
  methods: {
    openSupportLink() {
      shell.openExternal('https://portal.leadforensics.com/Support');
    },
  },
};
</script>

<style>
.blocks {
  height: calc(100vh - 44px);
  overflow: scroll;
}
.blocks::-webkit-scrollbar {
  width: 10px;
}
.blocks::after {
  content: '';
  position: absolute;
  pointer-events: none;
  bottom: 0;
  left: 0;
  width: 97%;
  height: 90px;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8), white);
}
</style>