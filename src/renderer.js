function updateClock() {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  try {
    document.getElementById('clock').innerHTML = time;
  } catch(e) {}
}

updateClock();
setInterval(() => {
  updateClock();
}, 500);


const readdir = require('./readdir-recursive.js');
const {ipcRenderer} = require('electron');
const fs = require('fs');
const _path = require('path');
let currentWorkingDirectory;
let currentOpenPath;
let currentOpenEditor;

function _escape(string) {
  return string.replace('<', '%lt%').replace('>', '%gt%');
}
function getPathFromElement(element) {
  const content = element.innerHTML;
  const path = /<span class="_meta">(.+)<\/span>/.exec(content)[1].replace('%lt%', '<').replace('%gt%', '>');

  return _path.join(currentWorkingDirectory, path);
}
function render() {
  const files = readdir(currentWorkingDirectory);
  files.forEach((file) => {
    try {
      if(!/[\\\/]/g.test(file)) {
        document.getElementById('tvl-tree-view').innerHTML += `<li class="tv-fi"><span class="_meta">${_escape(file)}</span><i class="far fa-file"></i> ${file}</li>`;
      } else {
        let levels = file.split(/[\\\/]/g);
        levels.splice(0, 0, 'tree-view');
        console.log(levels);

        for(let i in levels) {
          if(i == levels.length - 1) {
            document.getElementById(`tvl-${levels[i - 1]}`).innerHTML += `<li class="tv-fi"><span class="_meta">${_escape(file)}</span><i class="far fa-file"></i> ${levels[i]}</li>`;
          } else {
            if(!document.getElementById('tvl-' + levels[i])) {
              document.getElementById('tvl-' + levels[i - 1]).innerHTML += `<li class="tv-f-open"><span class="tv-f"><i class="far fa-folder-open"></i><i class="far fa-folder"></i> ${levels[i]}</span><ul id="${"tvl-" + levels[i]}" class="tree-view"></ul></li>`;
            }
          }
        }
      }
    } catch(e) {
      console.error(e);
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
      document.getElementById('editor').innerHTML = `<textarea id="mainEditor"></textarea>`;

      const path = getPathFromElement(fileElement);
      currentOpenPath = path;
      document.getElementById('mainEditor').innerHTML = fs.readFileSync(path);
    });
  }
};

ipcRenderer.on('cwdUpdate', (event, data) => {
  currentWorkingDirectory = data.cwd;
  render();
});

ipcRenderer.on('saveFile', (event, data) => {
  const content = document.getElementById('mainEditor').value;

  console.log(content);

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
