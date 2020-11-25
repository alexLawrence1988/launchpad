//= =============================================================
// Electron imports
//= =============================================================
import { app, ipcMain, shell, BrowserWindow } from 'electron';
import settings from 'electron-settings';
import Vue from 'vue';
import Vuex from 'vuex';
import { autoUpdater } from 'electron-updater';
import { state, mutations, actions } from './src/store';
import { browserWindows, closeAllWindows } from './browserWindows';
import initUser from './src/services/initUser';

// last visitId set when app minimized
let lastVisitIdOnMinimize;
// Reference to the current timeout running
let timeoutPollNewVisits;

//-------------------------------------------------------------------
// Auto update listeners
//-------------------------------------------------------------------
setInterval(autoUpdater.checkForUpdates, (60 * 1000) * 180);
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on('update-downloaded', (info) => {
  browserWindows.UPDATE.open();
});

ipcMain.on('install-update', (event) => {
  autoUpdater.install();
});


//= =============================================================
// Shared store
//= =============================================================
Vue.use(Vuex);

// in order to share a single store between different windows we set up a 'main' store
const activeWindows = []; // stores references to open windows
const store = new Vuex.Store({
  state,
  mutations,
  actions,
});

// whenever a new window is created, we trigger event 'vuex-connect' which returns the main stores state
// this is copied into the new store using store.replaceState()
ipcMain.on('vuex-connect', (event) => {
  const window = event.sender;
  activeWindows[window.id] = window;
  event.returnValue = store.state;
});

// whenever a mutation occurs on any child store, the 'vuex-mutation' event is sent
// we use this to apply the same mutation to the main store
ipcMain.on('vuex-mutation', (event, { type, payload }) => {
  store.dispatch(type, ...payload);
});

// suscribing to mutations on the main store allows us to propagate changes to all active windows through the
// vuex-apply-mutation event, which is sent to all children
store.subscribe((mutation) => {
  Object.keys(activeWindows).forEach((id) => {
    if (activeWindows[id] && !activeWindows[id].isDestroyed()) {
      activeWindows[id].send('vuex-apply-mutation', mutation);
    } else {
      activeWindows[id] = null;
      delete activeWindows[id];
    }
  });
});

//= =============================================================
// Functions
//= =============================================================
async function initialise() {
  // initialise persisted settings
  store.dispatch('SET_DISMISSEDVISITS');
  store.dispatch('SET_USER', settings.get('user'));
  setIntervalNow(store.dispatch, 3600000, 'CLEAN_DISMISSEDVISITS');

  // initialise the user
  await initUser.loadUserSettings(store);
  initUser.pollValidateUser(browserWindows);

  // begin polling client data
  setIntervalNow(initUser.getVisits, 60000, store);
  setIntervalNow(initUser.getTriggerReports, 70000, store);
  setIntervalNow(initUser.getCategories, 70000, store);
  setIntervalNow(initUser.getClientUsers, 70000, store);

  // register these windows for speed of opening
  browserWindows.MINIMIZED.register();
  browserWindows.UPDATE.register();
  autoUpdater.checkForUpdates();
}

function setIntervalNow(fnction, interval, ...params) {
  fnction(...params);
  setInterval(fnction, interval, ...params);
}

// Prevent multiple instances of the app from being opened
if (!app.requestSingleInstanceLock()) {
  // NOTE: Subscribe to event 'second-instance' to catch this in the original instance
  app.quit();
}

//= =============================================================
// App Event listeners
//= =============================================================
app.on('ready', async () => {
  const authorised = settings.get('authorised', false);

  if (authorised) {
    initialise();
    browserWindows.BLOCKS.open();
  } else {
    browserWindows.LOGIN.open();
  }
});

app.on('window-all-closed', () => {
  setTimeout(() => {
    if (!BrowserWindow.getAllWindows().length) {
      app.quit();
    }
  }, 1000);
});

//= =============================================================
// IPC Event listeners
//= =============================================================
ipcMain.on('quit', () => {
  app.quit();
});

ipcMain.on('init-user', () => {
  initialise();
});

ipcMain.on('logout', () => {
  closeAllWindows();
});

ipcMain.on('open-window', (e, windowName) => {
  if (!browserWindows[windowName]) {
    console.log(`[open-window] Invalid target ${windowName}`);
    return;
  }

  browserWindows[windowName].open();
});

ipcMain.on('close-window', (e, windowName) => {
  if (!browserWindows[windowName]) {
    console.log(`[close-window] Invalid target ${windowName}`);
    return;
  }

  browserWindows[windowName].close();
});

ipcMain.on('resize-window', (e, windowName, width, height) => {
  if (!browserWindows[windowName]) {
    console.log(`[resize-window] Invalid target ${windowName}`);
    return;
  }

  if (isNaN(width) || isNaN(height)) {
    console.log(`[resize-window] Invalid width (${width}) or height (${height})`);
    return;
  }

  browserWindows[windowName].resize(Number(width), Number(height));
});

ipcMain.on('refresh-feed', () => {
  initUser.getVisits(store);
});

//= = ===================================================================
// Hide a window rather than destroying it
//= = ===================================================================
ipcMain.on('hide-window', (event, windowName) => {
  browserWindows[windowName].hide();
});

//= = ===================================================================
// Open Visit details
//= = ===================================================================
ipcMain.on('open-visit-detail', (e, visitId) => {
  console.log(`opening detail for visit: ${visitId}`);
  // we want a new window per detail so can't really
  // use the browserWindows properly
  const env = process.env.NODE_ENV;

  // window route
  const defaultRoute = env === 'local'
    ? 'http://localhost:8080'
    : `file://${__dirname}/dist/index.html`;


  // window settings
  const windowSettings = {
    height: 800,
    width: 1400,
    title: 'Details',
    transparent: true,
    closable: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
    },
    url: `${defaultRoute}#detail/${visitId}`,
  };

  const details = browserWindows.DETAILS.create(windowSettings);

  // Don't want details to always be on top
  details.setAlwaysOnTop(false);

  // open links externally
  details.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // destroy the window once it's closed to
  // free up the processor thread
  details.on('close', (event) => {
    details.destroy();
  });

  details.show();
});

//= = ===================================================================
// Check for new visits when minimized
//= = ===================================================================
function pollNewVisits() {
  if (browserWindows.MINIMIZED.isVisible()) {
    if (state.blocks.length && state.blocks[0].visitId !== lastVisitIdOnMinimize) {
      maximize();
    } else {
      // keep checking for new visits (check cpu usage)
      timeoutPollNewVisits = setTimeout(pollNewVisits, 30000);
    }
  }
}

//= = ===================================================================
// Maximize Fn (for manual and auto timeout)
//= = ===================================================================
function maximize() {
  // grab the current bounds of the window
  const blocksBounds = browserWindows.BLOCKS.getWindowBounds();
  const minimizedBounds = browserWindows.MINIMIZED.getWindowBounds();

  // adjust x,y accordingly
  const x = (minimizedBounds.x + minimizedBounds.width) - blocksBounds.width;
  const { y } = minimizedBounds;

  // show blocks, hide widget
  browserWindows.BLOCKS.open(x, y);
  browserWindows.MINIMIZED.hide();
}

//= = ===================================================================
// Minimize and set delay to maximize
//= = ===================================================================

ipcMain.on('minimized-visit-id', (event, visitId) => {
  lastVisitIdOnMinimize = visitId;
});

ipcMain.on('minimize', (event, delay) => {
  // grab the current bounds of the window
  const blocksBounds = browserWindows.BLOCKS.getWindowBounds();
  const minimizedBounds = browserWindows.MINIMIZED.getWindowBounds();

  // adjust x,y accordingly
  const x = (blocksBounds.x + blocksBounds.width) - minimizedBounds.width;
  const { y } = blocksBounds;

  // show widget, hide blocks
  browserWindows.BLOCKS.hide();
  browserWindows.MINIMIZED.open(x, y);

  //Clear current timeout before reset time with delay
  if (timeoutPollNewVisits) {
    clearTimeout(timeoutPollNewVisits);
  }
  timeoutPollNewVisits = setTimeout(pollNewVisits, delay);
});

//= = ===================================================================
// Maximize (manually)
//= = ===================================================================
ipcMain.on('maximize', () => {
  maximize();
});

//= =============================================================
// Unhandled errors - probably should do some auditing on this
//= =============================================================
process.on('uncaughtException', (error) => {
  console.log(error);
});