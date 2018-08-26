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
        document.getElementById('tvl-tree-view').innerHTML += `<li><i class="far fa-file"></i> ${file}</li>`;
      } else {
        let levels = file.split(/[\\\/]/g);
        levels.splice(0, 0, 'tree-view');
        console.log(levels);

        for(let i in levels) {
          if(i == levels.length - 1) {
            document.getElementById(`tvl-${levels[i - 1]}`).innerHTML += `<li><i class="far fa-file"></i> ${levels[i]}`;
          } else {
            if(!document.getElementById('tvl-' + levels[i])) {
              document.getElementById('tvl-' + levels[i - 1]).innerHTML += `<li class="tv-f tv-f-open"><i class="far fa-folder-open"></i> ${levels[i]}<ul id="${"tvl-" + levels[i]}" class="tree-view"></ul></li>`;
            }
          }
        }
      }
    } catch(e) {
      console.error(e);
    }
  });

  const elements = document.getElementsByClassName('tv-f');
  for(let i = 0; i < elements.length; i++) {
    let element = elements[i];

    element.addEventListener('click', () => {
      element.classList.toggle('tv-f-open');
      element.classList.toggle('tv-f-closed');
    });
  }
};

ipcRenderer.on('cwdUpdate', (event, data) => {
  currentWorkingDirectory = data.cwd;
  render();
});
