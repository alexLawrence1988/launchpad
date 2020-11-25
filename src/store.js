import Vuex from 'vuex';
import { ipcRenderer } from 'electron';
import electronSettings from 'electron-settings';
import api from './services/api';

export const state = {
  // User Settings
  settings: {
    opacity: 100,
    // Active Trigger Report Filters [ TriggerReportID, ... ]
    triggerReportFilters: [],
    blockExpireMins: 0,
  },
  user: {
    name: '',
    portal: '',
  },
  // Trigger Report List [{ id, name }, ...]
  triggerReportList: [],
  // Trigger Report Colors { TriggerReportID: HexColor, ... }
  triggerReportColors: {},
  // Block Expire List (values TBD)
  blockExpireMinsList: [
    { value: 0, text: 'Never' },
    { value: 1, text: '1 minute' },
    { value: 2, text: '2 minutes' },
    { value: 3, text: '3 minutes' },
    { value: 4, text: '4 minutes' },
    { value: 5, text: '5 minutes' },
    { value: 6, text: '6 minutes' },
    { value: 7, text: '7 minutes' },
    { value: 8, text: '8 minutes' },
    { value: 9, text: '9 minutes' },
    { value: 10, text: '10 minutes' },
  ],
  // Categories List [{ id, name, hex }, ...]
  categoryList: [],
  // Client User List [{ id, name, email }, ...]
  clientUserList: [],
  /**
   * Blocks (Visits) [{
   *   visitId,
   *   businessId,
   *   business: { name, industry, country, add1, add2, add3, locality, town, county, state, postcode, country },
   *   logo,
   *   categories: [{ id, name, hex }, ...],
   *   assignments: [{ id, name }, ...],
   *   triggerReports: [ id, ... ]
   * }, ...]
   */
  blocks: [],
  // Dismissed Visits [ { visitId, created }, ... ]
  dismissedVisits: [],
  loading: false,
  mainSnackbar: {
    visible: false,
    color: null,
    message: null,
    timeout: null,
  },
  errorSnackbar: {
    visible: false,
    color: null,
    message: null,
    showSupportLink: false,
  },
};

export const mutations = {
  SET_USER: (state, user) => {
    if (user.clientUserName) {
      state.user.name = user.clientUserName;
    }
    if (user.clientName) {
      state.user.portal = user.clientName;
    }
  },
  UPDATE_SETTINGS: (state, settings) => {
    if (settings.opacity != null) {
      state.settings.opacity = settings.opacity;
    }

    if (settings.triggerReportFilters != null) {
      state.settings.triggerReportFilters = settings.triggerReportFilters;
    }

    if (settings.blockExpireMins != null) {
      state.settings.blockExpireMins = settings.blockExpireMins;
    }
  },
  SET_VISITS: (state, visits) => {
    state.blocks = visits;
  },
  SET_TRIGGERREPORTLIST: (state, triggerReportList) => {
    state.triggerReportList = triggerReportList;
  },
  SET_CATEGORYLIST: (state, categoryList) => {
    state.categoryList = categoryList;
  },
  SET_CLIENTUSERLIST: (state, clientUserList) => {
    state.clientUserList = clientUserList;
  },
  SET_TRIGGERREPORTCOLORS: (state, triggerReportColors) => {
    state.triggerReportColors = triggerReportColors;
  },
  SET_DISMISSEDVISITS: (state) => {
    // load dismissed visits from electron settings
    state.dismissedVisits = electronSettings.get('dismissedVisits', []);
  },
  UPDATE_TRIGGERREPORTCOLORS: (state, triggerReportColors) => {
    for (const triggerReportColor of triggerReportColors) {
      if (!triggerReportColor.triggerReportId || !triggerReportColor.colorHex) {
        continue;
      }

      state.triggerReportColors[triggerReportColor.triggerReportId] = triggerReportColor.colorHex;
    }
  },
  ADD_BUSINESSCATEGORY: (state, { businessId, category }) => {
    const matchedBlocks = state.blocks.filter(block => block.businessId === businessId);

    for (const matchedBlock of matchedBlocks) {
      matchedBlock.categories.push(category);
    }
  },
  ADD_BUSINESSASSIGNMENT: (state, { businessId, clientUser }) => {
    const matchedBlocks = state.blocks.filter(block => block.businessId === businessId);

    for (const matchedBlock of matchedBlocks) {
      matchedBlock.assignments.push(clientUser);
    }
  },
  ADD_DISMISSEDVISIT: (state, visitId) => {
    state.dismissedVisits.push({ visitId, created: Date.now() });
    electronSettings.set('dismissedVisits', state.dismissedVisits);
  },
  POP_DISMISSEDVISITS: (state) => {
    state.dismissedVisits.pop();
    electronSettings.set('dismissedVisits', state.dismissedVisits);
  },
  CLEAN_DISMISSEDVISITS: (state) => {
    const lifespan = 10800000; // 3 hour lifespan
    state.dismissedVisits = state.dismissedVisits.filter(d => d.created > Date.now() - lifespan);
    electronSettings.set('dismissedVisits', state.dismissedVisits);
  },
  SET_LOADING: (state, isLoading) => {
    state.loading = isLoading || false;
  },
  SET_SNACKBAR: (state, snackbar) => {
    state.mainSnackbar = {
      message: snackbar.message,
      color: snackbar.color || 'success',
      timeout: snackbar.timeout || 3000,
      visible: true,
    };
  },
  API_ERROR: (state, error) => {
    // handle api errors
    state.errorSnackbar = {
      message: error.response
        ? `Unable to connect to Lead Forensics API (Status Code: ${error.response.status}).`
        : 'No Internet Connection Detected. Please connect to a network to start receiving notifications...',
      showSupportLink: !!error.response,
      color: 'error',
      visible: true,
    };

    if (error.response) return;

    // automatically clear offline errors
    setTimeout(async () => {
      if (await api.ping()) {
        // connection restored
        state.errorSnackbar.visible = false;
      }
    }, 31000);
  },
};

/**
 * NOTE: Due to the setup of our shared vuex store within electron,
 * actions MUST only commit a SINGLE mutation each.
 * The mutation/action names AND payloads must align exactly.
 * This is because mutations are propogated on change via:
 * store.dispatch(MUTATION_NAME, ...MUTATION_PAYLOAD);
 */
export const actions = {
  SET_USER: ({ commit }, user) => {
    if (!user) return;

    commit('SET_USER', user);
  },
  UPDATE_SETTINGS: ({ commit }, settings) => {
    if (!settings) return;

    commit('UPDATE_SETTINGS', settings);
  },
  SET_VISITS: async ({ commit }, visits) => {
    if (!visits) return;

    commit('SET_VISITS', visits);
  },
  SET_TRIGGERREPORTLIST: async ({ commit }, triggerReportList) => {
    if (!triggerReportList) return;

    commit('SET_TRIGGERREPORTLIST', triggerReportList);
  },
  SET_CATEGORYLIST: async ({ commit }, categoryList) => {
    if (!categoryList) return;

    commit('SET_CATEGORYLIST', categoryList);
  },
  SET_CLIENTUSERLIST: async ({ commit }, clientUserList) => {
    if (!clientUserList) return;

    commit('SET_CLIENTUSERLIST', clientUserList);
  },
  SET_TRIGGERREPORTCOLORS: ({ commit }, triggerReportColors) => {
    if (!triggerReportColors) return;

    commit('SET_TRIGGERREPORTCOLORS', triggerReportColors);
  },
  SET_DISMISSEDVISITS: ({ commit }) => {
    commit('SET_DISMISSEDVISITS');
  },
  UPDATE_TRIGGERREPORTCOLORS: ({ commit }, triggerReportColors) => {
    if (!triggerReportColors) return;

    commit('UPDATE_TRIGGERREPORTCOLORS', triggerReportColors);
  },
  ADD_BUSINESSCATEGORY: ({ commit }, { businessId, category }) => {
    if (!businessId || !category) return;

    commit('ADD_BUSINESSCATEGORY', { businessId, category });
  },
  ADD_BUSINESSASSIGNMENT: ({ commit }, { businessId, clientUser }) => {
    if (!businessId || !clientUser) return;

    commit('ADD_BUSINESSASSIGNMENT', { businessId, clientUser });
  },
  ADD_DISMISSEDVISIT: ({ commit }, visitId) => {
    if (!visitId) return;

    commit('ADD_DISMISSEDVISIT', visitId);
  },
  POP_DISMISSEDVISITS: ({ commit }) => {
    commit('POP_DISMISSEDVISITS');
  },
  CLEAN_DISMISSEDVISITS: ({ commit }) => {
    commit('CLEAN_DISMISSEDVISITS');
  },
  SET_LOADING: ({ commit }, isLoading) => {
    commit('SET_LOADING', isLoading || false);
  },
  SET_SNACKBAR: ({ commit }, snackbar) => {
    if (!snackbar.message) return;

    commit('SET_SNACKBAR', snackbar);
  },
  API_ERROR: ({ commit }, error) => {
    commit('API_ERROR', error);
  },
};

export default function getClientStore(_Vue) {
  _Vue.use(Vuex);

  const store = new Vuex.Store({
    state,
    mutations,
    actions,
  });

  store.replaceState(ipcRenderer.sendSync('vuex-connect'));
  // save the original dispatch function so we can still apply mutations
  store._dispatch = store.dispatch;

  // override dispatch to broadcast a message to the main store
  store.dispatch = (type, ...payload) => {
    // from vuejs/vuex
    if (typeof type === 'object' && type.type && arguments.length === 1) {
      payload = [type.payload];
      type = type.type;
    }

    ipcRenderer.send('vuex-mutation', { type, payload });
  };

  // listen for mutations made to the main store and apply them
  ipcRenderer.on('vuex-apply-mutation', (event, { type, payload }) => {
    store._dispatch(type, payload);
  });

  return store;
}
