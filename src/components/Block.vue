<template>
  <v-flex>
    <v-card
      class="block"
      outlined
      :data-test-visitId="block.visitId"
      :data-test-businessId="block.businessId">
      <!-- Dismiss Block -->
      <div class="float-right">
        <v-btn id="btn-delete" color="error" icon x-small @click="dismissBlock()">
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </div>
      <!-- Trigger Report Colours -->
      <div
        v-if="activeTriggerReportColors.length > 0"
        class="trigger-colours float-left">
        <div
          v-for="triggerReport in activeTriggerReportColors"
          :key="triggerReport.name"
          :title="triggerReport.name"
          :style="{ height: `${100 / activeTriggerReportColors.length}%`, 'background-color':triggerReport.hex }"
        ></div>
      </div>

      <v-list-item three-line>
        <v-list-item-content class="business-description">
          <v-list-item-subtitle
            class="font-weight-light mb-1"
            data-test-type="visitDateTime"
          >{{ formattedStartDate }}</v-list-item-subtitle>
          <v-list-item-title>
            <span class="pointer font-weight-bold mb-1 d-inline-block text-truncate"
              @click="openVisitDetail()"
              :title="block.business.name"
              data-test-type="businessName"
            >{{ block.business.name }}</span>
          </v-list-item-title>
          <v-list-item-subtitle
            v-if="block.business.industry"
            class="mb-1"
            data-test-type="industry"
          >{{ block.business.industry }}</v-list-item-subtitle>
          <v-list-item-subtitle
            data-test-type="businessAddress"
          >{{ block.business.country }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-card-actions>
        <v-container class="pa-0">
          <v-row no-gutters>
            <v-col cols="6">
              <!-- Take Action -->
              <v-menu
                v-model="actionsMenu"
                class="pr-2"
                offset-y
                :close-on-content-click="false"
                attach>
                <template v-slot:activator="{ on }">
                  <v-btn
                    small
                    color="primary"
                    v-on="on"
                    data-test-type="actionButton"
                    :data-test-menu-visitId="block.visitId"
                  >
                    TAKE ACTION
                    <v-icon>{{ actionsMenu ? 'mdi-menu-up' : 'mdi-menu-down' }}</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <!-- Add Category -->
                  <v-menu max-height="400" max-width="175" offset-x open-on-hover full-width>
                    <template v-slot:activator="{ on }">
                      <v-list-item
                        v-on="on"
                        data-test-action="assignCategory"
                        :data-test-menu-visitId="block.visitId"
                      >
                        <v-list-item-title>
                          Add Category
                          <v-icon>mdi-menu-right</v-icon>
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                    <v-list dense>
                      <v-list-item
                        v-for="category in availableCategoryList"
                        :key="category.id"
                        @click="addBusinessCategory(category)"
                      >
                        <v-list-item-icon class="mr-2">
                          <v-icon :color="category.hex">mdi-square</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title
                            data-test-type="category"
                            :data-test-menu-visitId="block.visitId"
                          >{{ category.name }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <!-- Assign to User -->
                  <v-menu max-height="400" max-width="175" offset-x open-on-hover full-width>
                    <template v-slot:activator="{ on }">
                      <v-list-item
                        v-on="on"
                        data-test-action="assignUser"
                        :data-test-menu-visitId="block.visitId"
                      >
                        <v-list-item-title>
                          Assign to User
                          <v-icon>mdi-menu-right</v-icon>
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                    <v-list dense>
                      <v-list-item
                        v-for="clientUser in availableClientUserList"
                        :key="clientUser.id"
                        @click="addBusinessAssignment(clientUser)"
                      >
                        <v-list-item-content>
                          <v-list-item-title
                            data-test-type="clientUser"
                            :data-test-menu-visitId="block.visitId"
                          >{{ clientUser.name }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <!-- Email Visit -->
                  <v-menu
                    v-model="emailMenu"
                    :close-on-content-click="false"
                    offset-x
                    full-width
                    @input="email = null"
                  >
                    <template v-slot:activator="{ on }">
                      <v-list-item
                        v-on="on"
                        data-test-action="emailVisit"
                        :data-test-menu-visitId="block.visitId"
                      >
                        <v-list-item-title>Email Visit</v-list-item-title>
                      </v-list-item>
                    </template>
                    <v-form v-on:submit.prevent v-model="validEmail" validation>
                      <v-card>
                        <v-list>
                          <v-list-item>
                            <v-list-item-content>
                              <v-text-field
                                ref="email"
                                v-model="email"
                                class="e-address"
                                label="Email Address"
                                prepend-icon="email"
                                :rules="emailRule"
                                clearable
                              ></v-text-field>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn text @click="emailMenu = false">Cancel</v-btn>
                          <v-btn
                            :disabled="!validEmail"
                            type="submit"
                            color="primary"
                            text
                            @click="sendVisitEmail()"
                          >Send</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-form>
                  </v-menu>
                  <!-- Open In Portal -->
                  <v-list-item
                    @click="openInPortal()"
                    data-test-action="viewInPortal"
                    :data-test-menu-visitId="block.visitId"
                  >
                    <v-list-item-title>View in Portal</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
            <v-col cols="1">
              <v-icon
                v-if="block.assignments.length > 0"
                :title="assignmentNames"
                color="grey"
                data-test-type="userAssigned"
                size="22"
              >{{ block.assignments.length > 1 ? "mdi-account-group" : "mdi-account" }}</v-icon>
            </v-col>
            <v-col cols="5" class="category-container" :class="{ 'mt-1': block.categories.length <= 7 }">
              <div
                v-for="category in block.categories"
                :key="category.id"
                class="category"
                :style="{ backgroundColor: category.hex }"
                :title="category.name"
                data-test-type="categoryAssigned"
              ></div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>

    <v-snackbar
      id="block-snackbar"
      :data-test="snackbar.message"
      v-model="snackbar.visible"
      :color="snackbar.color"
    >{{ snackbar.message }}</v-snackbar>
  </v-flex>
</template>
<script>
import { shell, ipcRenderer } from 'electron';
import { mapState, mapActions } from 'vuex';
import api from '../services/api';

export default {
  data: () => ({
    actionsMenu: false,
    emailMenu: false,
    email: null,
    validEmail: false,
    emailRule: [
      v => !!v || 'This field is required',
      (v) => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(v) || 'Invalid e-mail';
      },
    ],
    snackbar: {
      visible: false,
      color: null,
      message: null,
    },
  }),
  props: {
    block: {
      type: Object,
      default: {},
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapState(['categoryList', 'clientUserList', 'settings', 'triggerReportColors', 'triggerReportList']),
    assignmentNames() {
      return this.block.assignments.map(assignee => assignee.name).join(', ');
    },
    formattedStartDate() {
      // Format visit start date - 1/1/1989, 0:00AM
      return new Date(this.block.startDate).toLocaleString().replace(/:\d{2}\s/, '');
    },
    availableCategoryList() {
      const categoryIds = this.block.categories.map(c => c.id);
      return this.categoryList.filter(c => !categoryIds.includes(c.id));
    },
    availableClientUserList() {
      const clientUserIds = this.block.assignments.map(cu => cu.id);
      return this.clientUserList.filter(cu => !clientUserIds.includes(cu.id));
    },
    activeTriggerReportColors() {
      const activeColors = [];
      for (const triggerReportId of this.block.triggerReports) {
        const hex = this.triggerReportColors[triggerReportId];
        const name = this.triggerReportName(triggerReportId);
        activeColors.push({ name, hex });
      }

      return activeColors;
    },
  },
  methods: {
    ...mapActions(['ADD_BUSINESSCATEGORY', 'ADD_BUSINESSASSIGNMENT', 'ADD_DISMISSEDVISIT']),
    triggerReportName(triggerReportId) {
      const triggerReport = this.triggerReportList.filter(triggerReport => triggerReport.id === triggerReportId);
      if (triggerReport) {
        return triggerReport.shift().name;
      }

      return '[NAME UNKNOWN]';
    },
    openInPortal() {
      this.actionsMenu = false;
      const link = `http://links.leadforensics.com?redir=portal&PageID=1&VisitID=${this.block.visitId}`;
      shell.openExternal(link);
    },
    addBusinessCategory(category) {
      this.actionsMenu = false;
      api.putBusinessCategory(this.block.businessId, category, this.onAddBusinessCategorySuccess, this.onError);
    },
    openVisitDetail() {
      ipcRenderer.send('open-visit-detail', this.block.visitId.toString());
    },
    addBusinessAssignment(clientUser) {
      this.actionsMenu = false;
      api.putBusinessAssignment(this.block.businessId, clientUser, this.onAddBusinessAssignmentSuccess, this.onError);
    },
    onAddBusinessCategorySuccess(category) {
      this.ADD_BUSINESSCATEGORY({ businessId: this.block.businessId, category });
      this.showSnackbar('Category added successfully', true);
    },
    onAddBusinessAssignmentSuccess(clientUser) {
      this.ADD_BUSINESSASSIGNMENT({ businessId: this.block.businessId, clientUser });
      this.showSnackbar('Assignee added successfully', true);
    },
    sendVisitEmail() {
      this.actionsMenu = false;
      const user = this.$store.state.user.name;
      api.sendVisitEmail(this.email, this.block, user, this.onEmailSuccess, this.onError);
    },
    onEmailSuccess() {
      this.showSnackbar('Email sent sucessfully', true);
    },
    onError(error) {
      this.showSnackbar(error, false);
    },
    showSnackbar(message, success) {
      this.snackbar = {
        visible: true,
        color: success ? 'success' : 'error',
        message,
      };
    },
    dismissBlock() {
      api.putLog('DISMISSBLOCK');
      this.ADD_DISMISSEDVISIT(this.block.visitId);
    },
  },
};
</script>

<style>
.block {
  height: 153px;
}

.pointer {
  cursor: pointer;
}

.trigger-colours {
  width: 9px;
  height: 100%;
  overflow: hidden;
  border-radius: 4px 0 0 4px;
}

.category-container {
  line-height: 15px;
}
.category {
  display: inline-block;
  height: 15px;
  width: 15px;
  border-radius: 4px;
  box-shadow: 1px 1px grey;
  margin-right: 2px;
}

.e-address {
  width: 300px;
  font-size: 0.8em;
}

.business-description .v-list-item__subtitle {
  line-height: 1.1;
}
</style>
