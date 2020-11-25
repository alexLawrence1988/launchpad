import { app, BrowserWindow } from 'electron';

//= =============================================================
// Active windows
//= =============================================================
const AVAILABLE_WINDOWS = {
  LOGIN: null,
  BLOCKS: null,
  SETTINGS: null,
  DETAILS: null,
  MINIMIZED: null,
};

//= =============================================================
// Window default settings
//= =============================================================
const env = process.env.NODE_ENV;
const defaultRoute = env === 'local'
  ? 'http://localhost:8080'
  : `file://${__dirname}/dist/index.html`;

const WINDOW_SETTINGS = {
  LOGIN: {
    height: 350,
    width: 425,
    resizable: false,
    maximizable: false,
    title: 'Login',
    closable: true,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    },
    url: `${defaultRoute}#login`,
  },
  BLOCKS: {
    width: 349,
    height: 700,
    maxWidth: 350,
    minWidth: 350,
    title: 'Blocks',
    frame: false, // set to false for production
    transparent: true, // set to true for production
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
    url: defaultRoute,
  },
  SETTINGS: {
    height: 511,
    width: 380,
    title: 'Settings',
    frame: false,
    resizable: false,
    maximizable: false,
    transparent: true,
    closable: true,
    webPreferences: {
      nodeIntegration: true,
    },
    url: `${defaultRoute}#settings`,
  },
  MINIMIZED: {
    height: 204,
    width: 38,
    title: 'Minimized',
    frame: false,
    resizable: false,
    maximizable: false,
    transparent: true,
    closable: true,
    webPreferences: {
      nodeIntegration: true,
    },
    url: `${defaultRoute}#minimized`,
    show: false,
  },
  UPDATE: {
    height: 207,
    width: 300,
    title: 'Update',
    frame: false,
    resizable: false,
    maximizable: false,
    transparent: false,
    closable: true,
    webPreferences: {
      nodeIntegration: true,
    },
    url: `${defaultRoute}#update`,
    show: false,
  },
};

//= =============================================================
// Default Export
//= =============================================================
export const browserWindows = {
  LOGIN: getActions('LOGIN'),
  BLOCKS: getActions('BLOCKS'),
  SETTINGS: getActions('SETTINGS'),
  DETAILS: getActions('DETAILS'),
  MINIMIZED: getActions('MINIMIZED'),
  UPDATE: getActions('UPDATE'),
};

//= =============================================================
// Close all windows
//= =============================================================
export function closeAllWindows() {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (AVAILABLE_WINDOWS[window.getTitle().toUpperCase()]) {
      window.hide();
      return;
    }

    window.close();
  });
}

//= =============================================================
// Functions
//= =============================================================
function getActions(windowName) {
  return {
    open(x, y) {
      openWindow(windowName, x, y);
    },
    close() {
      closeWindow(windowName);
    },
    resize(width, height) {
      resizeWindow(windowName, width, height);
    },
    create(windowSettings) {
      // manually create windows with dynamic settings
      return createWindow(windowSettings);
    },
    hide() {
      hideWindow(windowName);
    },
    getWindowBounds() {
      return getWindowBounds(windowName);
    },
    register() {
      registerWindow(windowName);
    },
    isVisible() {
      return AVAILABLE_WINDOWS[windowName].isVisible();
    },
  };
}

function hideWindow(windowName) {
  if (AVAILABLE_WINDOWS[windowName]) {
    AVAILABLE_WINDOWS[windowName].hide();
  }
}

function getWindowBounds(windowName) {
  return AVAILABLE_WINDOWS[windowName].getBounds();
}

function openWindow(windowName, x, y) {
  let targetWindow = AVAILABLE_WINDOWS[windowName];
  if (!WINDOW_SETTINGS[windowName]) {
    return;
  }

  if (!targetWindow || targetWindow.isDestroyed()) {
    targetWindow = registerWindow(windowName);
  }

  // apply positioning
  if (x && y) {
    targetWindow.setPosition(x, y, true);
  }

  if (!targetWindow.isVisible()) {
    targetWindow.show();
  }

  if (env === 'test' || env === 'local') {
    // open dev tools to assist debugging
    targetWindow.webContents.openDevTools();
  }
}

function createWindow(windowSettings) {
  windowSettings.show = false;

  const window = new BrowserWindow(windowSettings);
  window.setAlwaysOnTop(true);
  window.setMenu(null);
  window.loadURL(windowSettings.url);

  window.once('ready-to-show', () => {
    window.show();
  });

  if (env === 'test' || env === 'local') {
    // open dev tools to assist debugging
    window.webContents.openDevTools();
  }

  return window;
}

function registerWindow(windowName) {
  if (AVAILABLE_WINDOWS[windowName] && !AVAILABLE_WINDOWS[windowName].isDestroyed()) {
    // window already exists
    return;
  }

  const windowSettings = WINDOW_SETTINGS[windowName];
  windowSettings.show = false;

  const window = new BrowserWindow(windowSettings);
  window.setAlwaysOnTop(true);
  window.setMenu(null);
  window.loadURL(windowSettings.url);

  if (windowName === 'BLOCKS' || windowName === 'MINIMIZED') {
    window.on('close', () => {
      app.quit();
    });
  }

  AVAILABLE_WINDOWS[windowName] = window;

  return window;
}

function closeWindow(windowName) {
  const targetWindow = AVAILABLE_WINDOWS[windowName];
  if (!targetWindow || targetWindow.isDestroyed()) {
    return;
  }

  targetWindow.close();
}

function resizeWindow(windowName, width, height) {
  const targetWindow = AVAILABLE_WINDOWS[windowName];
  if (!targetWindow || targetWindow.isDestroyed()) {
    return;
  }

  // due to a bug in electron we must call "setMinimumSize" before "setSize"
  // see: https://github.com/electron/electron/issues/15560
  targetWindow.setMinimumSize(width, height);
  targetWindow.setSize(width, height);
}
