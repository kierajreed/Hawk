const electron = require('electron');
const {app, dialog, BrowserWindow, Menu} = electron;
let currentWorkingDirectory;
const fs = require('fs');
const _path = require('path');
let mainWindow;
const open = (path) => {
  console.log(path);
  if(!path) return;

  if(fs.lstatSync(path).isDirectory()) {
    currentWorkingDirectory = path;
  } else {
    currentWorkingDirectory = _path.dirname(path);
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
          open(dialog.showOpenDialog({properties: ['openFile']})[0]);
        }
      },
      {
        label: 'Open Folder',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: () => {
          open(dialog.showOpenDialog({properties: ['openDirectory']})[0]);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S'
      },
      {
        label: 'Save As',
        accelerator: 'CmdOrCtrl+Shift+S'
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
        accelerator: 'Alt+1'
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

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if(mainWindow === null) createWindow();
});
