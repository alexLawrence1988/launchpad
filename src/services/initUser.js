import settings from 'electron-settings';
import api from './api';

export default {
  pollValidateUser: (browserWindows, interval) => {
    interval = interval || 1800000;
    setInterval(validateUser, interval, browserWindows);
  },
  loadUserSettings: async (store) => {
    try {
      const userSettings = await api.getUserSettings();

      store.dispatch('UPDATE_SETTINGS', userSettings);
      store.dispatch('SET_TRIGGERREPORTCOLORS', userSettings.triggerReportColors);
    } catch (err) {
      store.dispatch('API_ERROR', err);
    }
  },
  getVisits: async (store) => {
    if (!settings.get('authorised')) return;

    try {
      await store.dispatch('SET_LOADING', true);
      const visits = await api.getVisits(store.state.settings.triggerReportFilters);
      store.dispatch('SET_VISITS', visits);
    } catch (err) {
      store.dispatch('API_ERROR', err);
    } finally {
      store.dispatch('SET_LOADING', false);
    }
  },
  getTriggerReports: async (store) => {
    if (!settings.get('authorised')) return;

    try {
      const triggerReports = await api.getTriggerReports();
      store.dispatch('SET_TRIGGERREPORTLIST', triggerReports);
    } catch (err) {
      store.dispatch('API_ERROR', err);
    }
  },
  getCategories: async (store) => {
    if (!settings.get('authorised')) return;

    try {
      const categories = await api.getCategories();
      categories.sort(sortByName);
      store.dispatch('SET_CATEGORYLIST', categories);
    } catch (err) {
      store.dispatch('API_ERROR', err);
    }
  },
  getClientUsers: async (store) => {
    if (!settings.get('authorised')) return;

    try {
      const clientUsers = await api.getClientUsers();
      clientUsers.sort(sortByName);
      store.dispatch('SET_CLIENTUSERLIST', clientUsers);
    } catch (err) {
      store.dispatch('API_ERROR', err);
    }
  },
};

//= ===============================================
// Validate user is still active
//= ===============================================
async function validateUser(browserWindows) {
  if (settings.get('authorised')) {
    // validate user
    const user = await api.validateUser();
    if (!user.valid) {
      /*
      NOTE - We cannot use api.Logout here as
      the ipcRenderer can only be used in the renderer process
      and this is not part of it. Hence we need to actively close
      and open
      */

      // open login screen first
      await browserWindows.LOGIN.open();

      // close all other screens
      for (const window in browserWindows) {
        if (window === 'LOGIN') {
          continue;
        }

        browserWindows[window].close();
      }

      settings.set('authorised', false);
      settings.set('token', null);

      // TODO: Need to send and event to the log in screeen to show a message
      // informing the client theyve been logged out
    }
  }
}

// TODO: Add sorting to services and remove this function
function sortByName(itemA, itemB) {
  const nameA = (itemA.name || '').toLowerCase();
  const nameB = (itemB.name || '').toLowerCase();
  if (nameA < nameB) return -1;
  return nameA > nameB;
}