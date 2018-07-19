function updateClock() {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  document.getElementById('clock').innerHTML = time;
}

updateClock();
setInterval(() => {
  updateClock();
}, 500);
