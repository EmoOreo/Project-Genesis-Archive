const stateKey = 'pgArchiveSave_v020';
const defaultState = { knowledge: 80, unlocked: [], upgrades: {}, filter: 'all', activeHabitat: 'northern_reach_tundra', unlockedHabitats: ['northern_reach_tundra'], lastDiscovery: null, lastSaved: Date.now() };
let state = JSON.parse(localStorage.getItem(stateKey) || 'null') || structuredClone(defaultState);
let species = [];
let upgrades = [];
let habitats = [];

const $ = sel => document.querySelector(sel);
const save = () => { state.lastSaved = Date.now(); localStorage.setItem(stateKey, JSON.stringify(state)); };
const perSecond = () => upgrades.reduce((sum,u) => sum + (state.upgrades[u.id] || 0) * (u.knowledgePerSecond || 0), 0);
const scanBonus = () => upgrades.reduce((sum,u) => sum + (state.upgrades[u.id] || 0) * (u.scanBonus || 0), 0);
const upgradeCost = u => Math.floor(u.baseCost * Math.pow(1.55, state.upgrades[u.id] || 0));
const habitatById = id => habitats.find(h => h.id === id);
const speciesInHabitat = id => species.filter(s => s.habitat === id);
const lockedInHabitat = id => speciesInHabitat(id).filter(s => !state.unlocked.includes(s.id));
const completionPct = () => species.length ? Math.round((state.unlocked.length / species.length) * 100) : 0;

async function loadData() {
  try {
    const [speciesRes, upgradesRes, habitatsRes] = await Promise.all([
      fetch('data/species.json'), fetch('data/upgrades.json'), fetch('data/habitats.json')
    ]);
    species = await speciesRes.json();
    upgrades = await upgradesRes.json();
    habitats = await habitatsRes.json();
  } catch (err) {
    document.body.innerHTML = '<main class="shell"><section class="panel" style="padding:24px"><h1>Data load failed</h1><p>This prototype needs to be opened from a local/static web server or GitHub Pages so JSON files can load.</p></section></main>';
    throw err;
  }
}

function weightedPick(list) {
  const weights = { Common: 8, Uncommon: 5, Rare: 3, Epic: 1.3, Legendary: 0.7 };
  const total = list.reduce((sum, s) => sum + (weights[s.rarity] || 1), 0);
  let roll = Math.random() * total;
  for (const s of list) { roll -= weights[s.rarity] || 1; if (roll <= 0) return s; }
  return list[0];
}

function render() {
  $('#knowledge').textContent = Math.floor(state.knowledge).toLocaleString();
  $('#perSecond').textContent = perSecond().toLocaleString();
  $('#registered').textContent = `${state.unlocked.length} / ${species.length}`;
  $('#completion').textContent = `${completionPct()}%`;
  renderHabitatSelect();
  renderVista();
  renderDiscovery();
  renderArchive();
  renderUpgrades();
  renderProgress();
}

function renderHabitatSelect() {
  $('#habitatSelect').innerHTML = habitats.map(h => {
    const locked = !state.unlockedHabitats.includes(h.id);
    return `<option value="${h.id}" ${h.id === state.activeHabitat ? 'selected' : ''}>${locked ? 'LOCKED // ' : ''}${h.name}</option>`;
  }).join('');
}

function renderVista() {
  const h = habitatById(state.activeHabitat) || habitats[0];
  const isUnlocked = state.unlockedHabitats.includes(h.id);
  $('#habitatImage').src = h.image;
  $('#habitatName').textContent = h.name;
  $('#habitatCode').textContent = isUnlocked ? 'SANCTUARY NODE ONLINE' : `LOCKED // ${h.unlockCost} KNOWLEDGE`;
  $('#habitatDesc').textContent = h.description;
  $('#scanBtn').disabled = !isUnlocked;
  $('#registerBtn').disabled = !isUnlocked;
  $('#unlockHabitatBtn').style.display = isUnlocked ? 'none' : 'block';
  $('#unlockHabitatBtn').textContent = `Unlock Habitat (${h.unlockCost.toLocaleString()} Knowledge)`;
}

function renderDiscovery() {
  const box = $('#discoveryPanel');
  if (!state.lastDiscovery) { box.classList.add('hidden'); box.innerHTML = ''; return; }
  const s = species.find(x => x.id === state.lastDiscovery);
  if (!s) return;
  box.classList.remove('hidden');
  box.innerHTML = `<div class="mini-card"><img src="${s.image}" alt="${s.name} portrait"><div><p class="eyebrow">LATEST REGISTRATION</p><h3>${s.name}</h3><p>${s.era} // ${s.rarity} // ${s.status}</p></div></div>`;
}

function renderArchive() {
  const wrap = $('#archive');
  const visible = species.filter(s => state.filter === 'all' || s.status === state.filter || s.lineage === state.filter || s.rarity === state.filter || s.traits.includes(state.filter));
  wrap.innerHTML = visible.map(s => {
    const unlocked = state.unlocked.includes(s.id);
    return `<article class="species-card ${unlocked ? 'unlocked' : 'locked'}">
      <div class="portrait-wrap"><img src="${s.image}" alt="${unlocked ? s.name : 'Locked species'} portrait"></div>
      <div class="species-glyph">${unlocked ? s.glyph : '?'}</div>
      <h3>${unlocked ? s.name : 'Unregistered Species'}</h3>
      <p class="meta">${unlocked ? `${s.clade} // ${s.era}` : `Requires ${s.cost.toLocaleString()} Knowledge`}</p>
      <p class="desc">${unlocked ? s.archive_note : 'Archive record sealed until verified by expedition scan and registration.'}</p>
      <div class="tags">${(unlocked ? [s.status, s.rarity, s.lineage, ...s.traits.slice(0,2)] : ['LOCKED']).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </article>`;
  }).join('');
}

function renderUpgrades() {
  $('#upgrades').innerHTML = upgrades.map(u => {
    const count = state.upgrades[u.id] || 0;
    const cost = upgradeCost(u);
    return `<div class="upgrade">
      <h3>${u.name} <small>x${count}</small></h3>
      <p>${u.description}</p>
      <button data-upgrade="${u.id}" ${state.knowledge < cost ? 'disabled' : ''}>Buy // ${cost.toLocaleString()}</button>
    </div>`;
  }).join('');
}

function renderProgress() {
  $('#progressSummary').textContent = `${state.unlocked.length} of ${species.length} registered`;
  $('#habitatProgress').innerHTML = habitats.map(h => {
    const all = speciesInHabitat(h.id).length;
    const got = speciesInHabitat(h.id).filter(s => state.unlocked.includes(s.id)).length;
    const pct = all ? Math.round((got / all) * 100) : 0;
    const locked = !state.unlockedHabitats.includes(h.id);
    return `<div class="progress-row ${locked ? 'locked-node' : ''}"><span>${h.name}</span><strong>${got}/${all}</strong><div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }).join('');
}

function registerDiscovery() {
  const h = habitatById(state.activeHabitat);
  const pool = lockedInHabitat(h.id).filter(s => state.knowledge >= s.cost);
  if (!pool.length) return;
  const target = weightedPick(pool);
  state.knowledge -= target.cost;
  state.unlocked.push(target.id);
  state.lastDiscovery = target.id;
  render(); save();
}

function wireEvents() {
  $('#habitatSelect').addEventListener('change', e => { state.activeHabitat = e.target.value; render(); save(); });
  $('#scanBtn').addEventListener('click', () => {
    const h = habitatById(state.activeHabitat);
    if (!state.unlockedHabitats.includes(h.id)) return;
    state.knowledge += h.knowledgePerScan + scanBonus() + Math.floor(state.unlocked.length * 1.5);
    render(); save();
  });
  $('#registerBtn').addEventListener('click', registerDiscovery);
  $('#unlockHabitatBtn').addEventListener('click', () => {
    const h = habitatById(state.activeHabitat);
    if (state.knowledge >= h.unlockCost && !state.unlockedHabitats.includes(h.id)) {
      state.knowledge -= h.unlockCost;
      state.unlockedHabitats.push(h.id);
      render(); save();
    }
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
