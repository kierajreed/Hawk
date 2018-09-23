const electron = require('electron');
const {app, dialog, ipcMain, BrowserWindow, Menu, globalShortcut} = electron;
let currentWorkingDirectory;
const fs = require('fs');
const _path = require('path');
const os = require('os');
const cson = require('cson');
const SETTINGS_FILE_PATH = _path.join(os.homedir(), '/.hawk/settings.cson');
let settings;
let mainWindow;
const open = (__path) => {
  if(!__path) return;
  const path = __path[0];

  if(fs.lstatSync(path).isDirectory()) {
    currentWorkingDirectory = path;
  } else {
    currentWorkingDirectory = _path.dirname(path);

    mainWindow.webContents.send('openFileEditor', {path: path});
  }

  mainWindow.webContents.send('cwdUpdate', {cwd: currentWorkingDirectory});
};
const options = {
  minWidth: 600,
  minHeight: 450,
  width: 800,
  height: 600,
  backgroundColor: '#303040'
};
const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          open(dialog.showOpenDialog({properties: ['openFile']}));
        }
      },
      {
        label: 'Open Folder',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: () => {
          open(dialog.showOpenDialog({properties: ['openDirectory']}));
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow.webContents.send('saveFile', {});
        }
      },
      {
        label: 'Save As',
        accelerator: 'CmdOrCtrl+Shift+S'
      },
      {
        type: 'separator'
      },
      {
        label: 'Settings',
        click: () => {
          mainWindow.webContents.send('openFileEditor', {path: SETTINGS_FILE_PATH});
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z'
      },
      {
        label: 'Redo',
        accelerator: 'CmdOrCtrl+Y'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: 'F11'
      },
      {
        label: 'Toggle Tree View',
        accelerator: 'Alt+1',
        click: () => {
          mainWindow.webContents.send('tvToggle', {});
        }
      },
      {
        label: 'Toggle Terminal',
        accelerator: 'Alt+2'
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Documentation'
      },
      {
        label: 'Frequently Asked Questions'
      },
      {
        type: 'separator'
      },
      {
        label: 'Welcome Guide'
      }
    ]
  }
];

function createWindow() {
  mainWindow = new BrowserWindow(options);

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.toggleDevTools();
}
function registerAccelerators() {
  globalShortcut.register('CmdOrCtrl+O', () => {
    open(dialog.showOpenDialog({properties: ['openFile']}));
  });
  globalShortcut.register('CmdOrCtrl+Shift+O', () => {
    open(dialog.showOpenDialog({properties: ['openDirectory']}));
  });
  globalShortcut.register('CmdOrCtrl+S', () => {
    mainWindow.webContents.send('saveFile', {});
  });
  globalShortcut.register('Alt+1', () => {
    mainWindow.webContents.send('tvToggle', {});
  });
}
function generateAndReadSettingsFile() {
  if(!fs.existsSync(SETTINGS_FILE_PATH)) {
    console.log('making settings');
    require('mkpath').sync(_path.dirname(SETTINGS_FILE_PATH));
    fs.writeFileSync(SETTINGS_FILE_PATH, require('./default-settings.js').DEFAULT_SETTINGS);
  }

  settings = cson.load(SETTINGS_FILE_PATH);
}

// eslint-disable-next-line no-unused-vars
ipcMain.on('settingsRequest', (event, data) => {
  mainWindow.webContents.send('settingsUpdate', {settings: settings});
});

app.on('ready', () => {
  createWindow();
  registerAccelerators();
  generateAndReadSettingsFile();
});
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if(mainWindow === null) createWindow();
});
