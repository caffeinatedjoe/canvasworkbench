// Menu-only test page: centered, fixed radial menu.

const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menuToggle');
const addCircleSlice = document.getElementById('addCircle');
const addRectSlice = document.getElementById('addRect');
const addLineSlice = document.getElementById('addLine');
const addTextSlice = document.getElementById('addText');

function toggleMenuCollapsed() {
  menu.classList.toggle('is-collapsed');
}

function logAction(action) {
  // Quick instrumentation for UI/UX iteration.
  console.log(`[fixed-radial-menu] ${action}`);
}

// --- interactions ---

menuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMenuCollapsed();
  logAction('toggle-menu');
});

menu.addEventListener('mousedown', (e) => {
  // Prevent menu clicks from setting target.
  e.stopPropagation();
});

addCircleSlice.addEventListener('click', (e) => {
  e.stopPropagation();
  logAction('add-circle');
});

addRectSlice.addEventListener('click', (e) => {
  e.stopPropagation();
  logAction('add-rect');
});

addLineSlice.addEventListener('click', (e) => {
  e.stopPropagation();
  logAction('add-line');
});

addTextSlice.addEventListener('click', (e) => {
  e.stopPropagation();
  logAction('add-text');
});

logAction('ready');

