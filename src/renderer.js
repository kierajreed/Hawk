function updateClock() {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  document.getElementById('clock').innerHTML = time;
}

updateClock();
setInterval(() => {
  updateClock();
}, 500);


const readdir = require('./readdir-recursive.js');
const {ipcRenderer} = require('electron');
const fs = require('fs');
const _path = require('path');
const watchdir = require('node-watch');
const mkpath = require('mkpath');
let currentWorkingDirectory;
let currentOpenPath;
let settings;
let currentCreationType;

function _escape(string) {
  return string.replace('<', '%lt%').replace('>', '%gt%');
}
function getPathFromElement(element) {
  const content = element.innerHTML;
  const path = /<span class="_meta">(.+)<\/span>/.exec(content)[1].replace('%lt%', '<').replace('%gt%', '>');

  return _path.join(currentWorkingDirectory, path);
}
function renderFileTree() {
  document.getElementById('tvl-tree-view').innerHTML = '';

  const files = readdir(currentWorkingDirectory);
  files.forEach((file) => {
    if(!/[\\/]/g.test(file)) {
      document.getElementById('tvl-tree-view').innerHTML += `<li class="tv-fi"><span class="_meta">${_escape(file)}</span><i class="far fa-file"></i> ${file}</li>`;
    } else {
      let levels = file.split(/[\\/]/g);
      levels.splice(0, 0, 'tree-view');

      for(let i in levels) {
        if(i == levels.length - 1) {
          document.getElementById(`tvl-${levels[i - 1]}`).innerHTML += `<li class="tv-fi"><span class="_meta">${_escape(file)}</span><i class="far fa-file"></i> ${levels[i]}</li>`;
        } else {
          if(!document.getElementById('tvl-' + levels[i])) {
            document.getElementById('tvl-' + levels[i - 1]).innerHTML += `<li class="tv-f-open"><span class="tv-f"><i class="far fa-folder-open"></i><i class="far fa-folder"></i> ${levels[i]}</span><ul id="${'tvl-' + levels[i]}" class="tree-view"></ul></li>`;
          }
        }
      }
    }
  });

  const folderElements = document.getElementsByClassName('tv-f');
  for(let i = 0; i < folderElements.length; i++) {
    let folderElement = folderElements[i];

    folderElement.addEventListener('click', () => {
      folderElement.parentElement.classList.toggle('tv-f-open');
      folderElement.parentElement.classList.toggle('tv-f-closed');
    });
  }

  const fileElements = document.getElementsByClassName('tv-fi');
  for(let i = 0; i < fileElements.length; i++) {
    let fileElement = fileElements[i];

    fileElement.addEventListener('click', () => {
      document.getElementById('editor').innerHTML += '<textarea id="mainEditor"></textarea>';

      const path = getPathFromElement(fileElement);
      currentOpenPath = path;
      document.getElementById('mainEditor').innerHTML = fs.readFileSync(path);
    });
  }
}
function useSettings() {
  document.body.style.fontFamily = `${settings.font || ''}, ${require('./default-settings.js').DEFAULT_FONT}, monospace`;
}
function openEditor(path) {
  currentOpenPath = path;
  document.getElementById('editor').innerHTML = '<textarea id="mainEditor"></textarea>';
  document.getElementById('mainEditor').innerHTML = fs.readFileSync(path);
}
function createItem(type, path) {
  path = _path.join(currentWorkingDirectory, path);

  if(type.toLowerCase() === 'file') {
    mkpath.sync(_path.dirname(path));
    fs.writeFileSync(path, '');
    openEditor(path);
  } else if(type.toLowerCase() === folder) {
    mkpath.sync(path);
  } else {
    throw new ValueError('"type" is neither "file" nor "folder"!');
  }
}
function cleanUpCreationDialog() {
  let creationDialog = document.getElementById('creation-dialog');
  creationDialog.style.display = 'none';
  document.getElementById('creation-dialog-background').style.display = 'none';
  currentCreationType = null;
  creationDialog.innerHTML = creationDialog.innerHTML.replace(/(file|folder)/, '#TYPE#');
}


/* eslint-disable no-unused-vars */
ipcRenderer.on('cwdUpdate', (event, data) => {
  currentWorkingDirectory = data.cwd;
  renderFileTree();

  watchdir(data.cwd, { recursive: true }, (_event, name) => {
    renderFileTree();
  });
});
ipcRenderer.on('saveFile', (event, data) => {
  const content = document.getElementById('mainEditor').value;
  fs.writeFileSync(currentOpenPath, content);
});
ipcRenderer.on('tvToggle', (event, data) => {
  let lpc = document.getElementById('left-pane').classList;
  lpc.toggle('hidden');

  const has = lpc.contains('hidden');
  const width = has ? '100%' : '';
  const left = has ? '0' : '';

  document.getElementById('editor').style.width = width;
  document.getElementById('tab-container').style.width = width;
  document.getElementById('editor').style.left = left;
  document.getElementById('tab-container').style.left = left;
});
ipcRenderer.on('openFileEditor', (event, data) => {
  openEditor(data.path);
});
ipcRenderer.on('settingsUpdate', (event, data) => {
  settings = data.settings;

  useSettings();
});
ipcRenderer.on('showCreateDialog', (event, data) => {
  currentCreationType = data.type;
  let creationDialog = document.getElementById('creation-dialog');
  creationDialog.innerHTML = creationDialog.innerHTML.replace('#TYPE#', currentCreationType);
  creationDialog.style.display = 'flex';
  document.getElementById('creation-dialog-background').style.display = 'block';
  document.getElementById('creation-dialog-input').focus();
  document.getElementById('creation-dialog-input').addEventListener('keydown', (event) => {
    if(event.key == 'Enter') {
      event.preventDefault();
      createItem(currentCreationType, document.getElementById('creation-dialog-input').value);
      cleanUpCreationDialog();
    }
  });
});

document.addEventListener('DOMContentLoaded', (event) => {
  ipcRenderer.send('settingsRequest');
});
document.getElementById('creation-dialog-background').addEventListener('click', (event) => {
  cleanUpCreationDialog();
});
document.getElementById('left-pane').addEventListener('mousedown', (event) => {
  if(event.button === 2) {
    ipcRenderer.send('showTvContextMenu', event);
  }
});
/* eslint-enable no-unused-vars */
