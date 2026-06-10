const stateKey = 'pgArchiveSave_v010';
const defaultState = { knowledge: 0, unlocked: [], upgrades: {}, filter: 'all', lastSaved: Date.now() };
let state = JSON.parse(localStorage.getItem(stateKey) || 'null') || structuredClone(defaultState);
let species = [];
let upgrades = [];

const $ = sel => document.querySelector(sel);
const save = () => { state.lastSaved = Date.now(); localStorage.setItem(stateKey, JSON.stringify(state)); };
const perSecond = () => upgrades.reduce((sum,u) => sum + (state.upgrades[u.id] || 0) * u.knowledgePerSecond, 0);
const nextLocked = () => species.find(s => !state.unlocked.includes(s.id));
const upgradeCost = u => Math.floor(u.baseCost * Math.pow(1.55, state.upgrades[u.id] || 0));

async function loadData() {
  try {
    const [speciesRes, upgradesRes] = await Promise.all([fetch('data/species.json'), fetch('data/upgrades.json')]);
    species = await speciesRes.json();
    upgrades = await upgradesRes.json();
  } catch (err) {
    document.body.innerHTML = '<main class="shell"><section class="panel" style="padding:24px"><h1>Data load failed</h1><p>This prototype needs to be opened from a local/static web server or GitHub Pages so JSON files can load.</p></section></main>';
    throw err;
  }
}

function render() {
  $('#knowledge').textContent = Math.floor(state.knowledge).toLocaleString();
  $('#perSecond').textContent = perSecond().toLocaleString();
  $('#registered').textContent = `${state.unlocked.length} / ${species.length}`;
  renderArchive();
  renderUpgrades();
}

function renderArchive() {
  const wrap = $('#archive');
  const visible = species.filter(s => state.filter === 'all' || s.status === state.filter || s.lineage === state.filter || s.traits.includes(state.filter));
  wrap.innerHTML = visible.map(s => {
    const unlocked = state.unlocked.includes(s.id);
    return `<article class="card ${unlocked ? 'unlocked' : 'locked'}">
      <div class="glyph">${unlocked ? s.glyph : '?'}</div>
      <h3>${unlocked ? s.name : 'Unregistered Species'}</h3>
      <p class="muted">${unlocked ? `${s.lineage} // ${s.era}` : `Registration requires ${s.cost} Knowledge`}</p>
      <p>${unlocked ? s.archive_note : 'Archive record sealed until verified by the expedition console.'}</p>
      <div class="tags">${(unlocked ? [s.status, s.rarity, ...s.traits] : ['LOCKED']).map(t => `<span>${t}</span>`).join('')}</div>
    </article>`;
  }).join('');
}

function renderUpgrades() {
  $('#upgrades').innerHTML = upgrades.map(u => {
    const count = state.upgrades[u.id] || 0;
    const cost = upgradeCost(u);
    return `<button class="upgrade" data-upgrade="${u.id}">
      <strong>${u.name} <small>x${count}</small></strong>
      <span>${u.description}</span>
      <em>${cost.toLocaleString()} Knowledge</em>
    </button>`;
  }).join('');
}

function wireEvents() {
  $('#scanBtn').addEventListener('click', () => { state.knowledge += 10 + Math.floor(state.unlocked.length * 2); render(); save(); });
  $('#registerBtn').addEventListener('click', () => {
    const target = nextLocked();
    if (!target) return;
    if (state.knowledge >= target.cost) { state.knowledge -= target.cost; state.unlocked.push(target.id); render(); save(); }
  });
  $('#upgrades').addEventListener('click', e => {
    const btn = e.target.closest('[data-upgrade]');
    if (!btn) return;
    const u = upgrades.find(x => x.id === btn.dataset.upgrade);
    const cost = upgradeCost(u);
    if (state.knowledge >= cost) { state.knowledge -= cost; state.upgrades[u.id] = (state.upgrades[u.id] || 0) + 1; render(); save(); }
  });
  document.querySelector('.filter-row').addEventListener('click', e => {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    state.filter = chip.dataset.filter;
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === state.filter));
    render(); save();
  });
  $('#saveBtn').addEventListener('click', save);
  $('#resetBtn').addEventListener('click', () => { localStorage.removeItem(stateKey); state = structuredClone(defaultState); render(); });
}

async function init() {
  await loadData();
  wireEvents();
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === state.filter));
  setInterval(() => { state.knowledge += perSecond(); render(); }, 1000);
  setInterval(save, 10000);
  render();
}
init();
