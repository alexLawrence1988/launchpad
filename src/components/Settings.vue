<template>
  <v-container class="pa-0">
    <v-toolbar id="header" class="drag" light flat>
      <h4>Edit Trigger Report Filters</h4>
      <v-spacer></v-spacer>

      <v-btn id="btn-close" class="no-drag" text icon right small fab @click="closeSettings()">
        <v-icon color="error">close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-row no-gutters>
      <v-list id="list-trigger-reports">
        <v-list-item-group v-model="triggerReportFilters" multiple color="primary">
          <v-list-item
            v-for="triggerReport in triggerReportList"
            :key="triggerReport.id"
            :value="triggerReport.id"
            :data-test-value="triggerReport.name"
          >
            <template v-slot:default="{ active, toggle }">
              <v-list-item-action>
                <v-checkbox
                  :input-value="active"
                  color="primary"
                  @click="toggle"
                ></v-checkbox>
              </v-list-item-action>
              <v-list-item-content v-text="triggerReport.name"></v-list-item-content>
            </template>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-snackbar
        id="snackbar"
        :data-test="snackbar.message"
        v-model="snackbar.visible"
        :color="snackbar.color"
      >{{ snackbar.message }}</v-snackbar>
    </v-row>
    <v-row no-gutters>
      <v-spacer></v-spacer>
      <v-btn
        id="btn-save"
        color="primary"
        class="ma-3"
        @click="postSettings()"
      >Save and Close</v-btn>
    </v-row>
  </v-container>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState, mapActions } from 'vuex';
import api from '../services/api';

export default {
  data: () => ({
    unsavedBlockExpireMins: null,
    unsavedTriggerReportFilters: null,
    snackbar: {
      visible: false,
      color: null,
      message: null,
    },
  }),
  computed: {
    ...mapState(['triggerReportList', 'triggerReportColors', 'blockExpireMinsList', 'settings']),
    opacity: {
      get() {
        return this.settings.opacity;
      },
      set(opacity) {
        this.UPDATE_SETTINGS({ opacity });
      },
    },
    triggerReportFilters: {
      get() {
        return this.settings.triggerReportFilters;
      },
      set(selectedTriggerReportFilters) {
        this.unsavedTriggerReportFilters = selectedTriggerReportFilters;
      },
    },
    blockExpireMins: {
      get() {
        return this.settings.blockExpireMins;
      },
      set(selectedBlockExpireMins) {
        this.unsavedBlockExpireMins = selectedBlockExpireMins;
      },
    },
  },
  methods: {
    ...mapActions(['UPDATE_SETTINGS', 'UPDATE_TRIGGERREPORTCOLORS', 'SET_SNACKBAR']),
    closeSettings() {
      ipcRenderer.send('close-window', 'SETTINGS');
    },
    postSettings() {
      if (!this.unsavedTriggerReportFilters) this.closeSettings();

      const settings = {
        blockExpireMins: this.unsavedBlockExpireMins,
        triggerReportFilters: this.unsavedTriggerReportFilters,
      };

      api.postUserSettings(settings, this.triggerReportColors, this.onSavedSuccess, this.onError);
    },
    async onSavedSuccess(settings, triggerReportFilterColors) {
      this.UPDATE_TRIGGERREPORTCOLORS(triggerReportFilterColors);
      this.UPDATE_SETTINGS(settings);
      ipcRenderer.send('refresh-feed');
      this.SET_SNACKBAR({ message: 'Filters updated successfully' });
      this.closeSettings();
    },
    onError(error) {
      this.snackbar = {
        visible: true,
        color: 'error',
        message: error,
      };
    },
  },
};
</script>

<style>
#header {
  background-color: #f5f5f5;
  border-radius: 10px;
}

#list-trigger-reports {
  height:395px;
  width:100%;
  overflow-y: scroll;
}
#list-trigger-reports::-webkit-scrollbar {
  width: 10px;
}
</style>
