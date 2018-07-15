const {app, BrowserWindow, Menu} = require('electron');
let mainWindow;
const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]
  }
];

function createWindow() {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if(mainWindow === null) createWindow();
});
