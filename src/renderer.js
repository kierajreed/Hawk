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


const fs = require('fs');
const {ipcRenderer} = require('electron');
let currentWorkingDirectory = null;

function render() {
  fs.readdir(currentWorkingDirectory, (err, files) => {
    files.forEach((file) => {
      try {
        document.getElementById('tree-view').innerHTML += `<li>${file}</li>`;
      } catch(e) {}
    });
  });
};

ipcRenderer.on('cwdUpdate', (event, data) => {
  currentWorkingDirectory = data.cwd;
  render();
});
