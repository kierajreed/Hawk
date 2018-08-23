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
let currentWorkingDirectory;

function render() {
  const files = readdir(currentWorkingDirectory);

  files.forEach((file) => {
    try {
      if(!/[\\\/]/g.test(file)) {
        document.getElementById('tvl-tree-view').innerHTML += `<li>${file}</li>`;
      } else {
        let levels = file.split(/[\\\/]/g);
        levels.splice(0, 0, 'tree-view');
        console.log(levels);

        for(let i in levels) {
          if(i == levels.length - 1) {
            document.getElementById(`tvl-${levels[i - 1]}`).innerHTML += `<li>${levels[i]}`;
          } else {
            if(!document.getElementById('tvl-' + levels[i])) {
              document.getElementById('tvl-' + levels[i - 1]).innerHTML += `<li>${levels[i]}<ul id="${"tvl-" + levels[i]}" class="tree-view"></ul></li>`;
            }
          }
        }
      }
    } catch(e) {
      console.error(e);
    }
  });
};

ipcRenderer.on('cwdUpdate', (event, data) => {
  currentWorkingDirectory = data.cwd;
  render();
});
