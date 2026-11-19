'use strict';

/* ------------------------------------------------------------------
   Rep Roster — fixed four-day plan. Everything is stored on this
   device only (localStorage). No accounts, no server.
   ------------------------------------------------------------------ */

// ---------- The sessions (fixed on purpose) ----------

const KNEE_TUCKS = {
  name: 'Seated knee tucks',
  sets: '4 × 15',
  note: 'Sets 1–2: both knees to chest. Sets 3–4: alternate one leg at a time.',
  log: { id: 'knee-tucks', type: 'reps' }
};

const SESSIONS = {
  lower: {
    title: 'Lower day',
    subtitle: 'Glutes & legs',
    blocks: [
      { id: 'warmup', label: 'Warm-up', items: [
        { name: 'Dynamic hip opener & mobility routine' }
      ]},
      { id: 'b1', label: 'Block 1', items: [
        { name: 'Hip thrusts', sets: '4 × 10', log: { id: 'hip-thrust', type: 'weight' } }
      ]},
      { id: 'b2', label: 'Block 2', items: [
        { name: 'Romanian deadlifts', sets: '3 × 10', log: { id: 'romanian-deadlift', type: 'weight' } }
      ]},
      { id: 'b3', label: 'Block 3', choices: [
        { key: 'bss', label: 'Split squats', items: [
          { name: 'Bulgarian split squats', sets: '3 × 12', log: { id: 'bulgarian-split-squat', type: 'weight' } }
        ]},
        { key: 'stepup', label: 'Step-ups', items: [
          { name: 'Cable step-ups', sets: '3 × 12', log: { id: 'cable-step-up', type: 'weight' } }
        ]}
      ]},
      { id: 'b4', label: 'Block 4', choices: [
        { key: 'kickback', label: 'Kickbacks', items: [
          { name: 'Cable kickbacks', sets: '3 × 15', log: { id: 'cable-kickback', type: 'weight' } }
        ]},
        { key: 'abduction', label: 'Abduction', items: [
          { name: 'Hip abduction machine', sets: '3 × 15', log: { id: 'hip-abduction', type: 'weight' } }
        ]}
      ]},
      { id: 'core', label: 'Core', items: [KNEE_TUCKS] },
      { id: 'cardio', label: 'Cardio', items: [
        { name: 'Treadmill walk', sets: '10–15 min', note: 'Flat or incline.' }
      ]},
      { id: 'cooldown', label: 'Cool-down', items: [
        { name: 'Static lower-body & glute stretch' }
      ]}
    ]
  },

  upper: {
    title: 'Upper day',
    subtitle: 'Back & arms',
    blocks: [
      { id: 'warmup', label: 'Warm-up', items: [
        { name: 'Band warm-up for arms & back' },
        { name: 'Assisted pull-ups', sets: '2 × 10', note: 'Wide grip and close grip.' }
      ]},
      { id: 'b1', label: 'Block 1', items: [
        { name: 'Wide-grip lat pulldowns', sets: '4 × 10', log: { id: 'lat-pulldown', type: 'weight' } }
      ]},
      { id: 'b2', label: 'Block 2', items: [
        { name: 'Seated cable rows', sets: '3 × 12', log: { id: 'seated-cable-row', type: 'weight' } }
      ]},
      { id: 'b3', label: 'Block 3', items: [
        { name: 'Straight-arm pulldowns', sets: '3 × 12', log: { id: 'straight-arm-pulldown', type: 'weight' } }
      ]},
      { id: 'b4', label: 'Block 4', items: [
        { name: 'Face pulls', sets: '3 × 15', log: { id: 'face-pull', type: 'weight' } }
      ]},
      { id: 'b5', label: 'Block 5', items: [
        { name: 'Lateral raises', sets: '3 × 10', log: { id: 'lateral-raise', type: 'weight' } }
      ]},
      { id: 'b6', label: 'Block 6 · Superset', note: 'Do these back to back.', items: [
        { name: 'Dumbbell bicep curls', sets: '2–3 × 12–15', log: { id: 'dumbbell-curl', type: 'weight' } },
        { name: 'Cable tricep extensions', sets: '2–3 × 12–15', log: { id: 'cable-tricep-extension', type: 'weight' } }
      ]},
      { id: 'core', label: 'Core', items: [KNEE_TUCKS] },
      { id: 'cardio', label: 'Cardio', items: [
        { name: 'Incline walk or stair stepper', sets: '20 min' }
      ]},
      { id: 'cooldown', label: 'Cool-down', items: [
        { name: 'Static upper-body stretch' }
      ]}
    ]
  },

  rest: {
    title: 'Rest day',
    subtitle: 'Recover & move',
    mode: {
      label: 'Today’s rest day',
      options: [
        { key: 'A', label: 'Mobility only' },
        { key: 'B', label: '+ Core & cardio' }
      ]
    },
    blocks: [
      { id: 'mobility', label: 'Mobility', items: [
        { name: 'Stretching and hip mobility routine' }
      ]},
      { id: 'core', label: 'Optional core', when: 'B', items: [KNEE_TUCKS] },
      { id: 'cardio', label: 'Optional cardio', when: 'B', items: [
        { name: 'Incline walk or stair stepper', sets: '20 min' }
      ]}
    ]
  }
};

// ---------- Storage (this device only) ----------

const KEY_DAY = 'repRoster.day.v1';   // today's ticks + toggles, reset each day
const KEY_LOGS = 'repRoster.logs.v1'; // weight/reps history, kept forever
const HISTORY_SHOWN = 3;

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    toast('Couldn’t save on this device.');
    return false;
  }
}

// Today's state. If the stored date isn't today, start fresh:
// all Done boxes clear and every toggle goes back to its default.
function getDay() {
  let day = readJSON(KEY_DAY, null);
  if (!day || day.date !== todayStr()) {
    day = { date: todayStr(), done: {}, toggles: {} };
    writeJSON(KEY_DAY, day);
  }
  return day;
}

function setDone(sessionKey, blockId, value) {
  const day = getDay();
  const k = sessionKey + ':' + blockId;
  if (value) day.done[k] = true; else delete day.done[k];
  writeJSON(KEY_DAY, day);
}

function isDone(sessionKey, blockId) {
  return !!getDay().done[sessionKey + ':' + blockId];
}

function getToggle(toggleId, defaultKey) {
  return getDay().toggles[toggleId] || defaultKey;
}

function setToggle(toggleId, value) {
  const day = getDay();
  day.toggles[toggleId] = value;
  writeJSON(KEY_DAY, day);
}

function getLogs(exerciseId) {
  const all = readJSON(KEY_LOGS, {});
  return Array.isArray(all[exerciseId]) ? all[exerciseId] : [];
}

function addLog(exerciseId, entry) {
  const all = readJSON(KEY_LOGS, {});
  if (!Array.isArray(all[exerciseId])) all[exerciseId] = [];
  all[exerciseId].push(entry);
  return writeJSON(KEY_LOGS, all);
}

// ---------- Small DOM helper (no innerHTML, so nothing is ever parsed as code) ----------

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---------- Segmented toggle (used for swaps and the rest-day mode) ----------

function segmented(name, options, current, onChange) {
  return h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': name },
    options.map(opt => h('button', {
      type: 'button',
      role: 'radio',
      'aria-checked': String(opt.key === current),
      class: opt.key === current ? 'seg on' : 'seg',
      onclick: () => { if (opt.key !== current) onChange(opt.key); }
    }, opt.label))
  );
}

// ---------- Exercise item (+ optional logger) ----------

function renderItem(item, rerender) {
  const wrap = h('div', { class: 'item' },
    h('div', { class: 'item-head' },
      h('span', { class: 'item-name' }, item.name),
      item.sets ? h('span', { class: 'pill' }, item.sets) : null
    ),
    item.note ? h('p', { class: 'note' }, item.note) : null
  );

  if (!item.log) return wrap;

  const { id, type } = item.log;
  const history = getLogs(id).slice(-HISTORY_SHOWN).reverse();

  const histList = history.length
    ? h('ol', { class: 'history', 'aria-label': 'Last entries for ' + item.name },
        history.map(e => h('li', null,
          h('span', { class: 'h-date' }, formatDate(e.date)),
          h('span', { class: 'h-val' },
            type === 'weight' ? `${e.weight} lb × ${e.reps}` : `${e.reps} reps`)
        )))
    : h('p', { class: 'history-empty' }, 'No entries yet.');

  // Form, hidden until "Log this" is tapped
  const weightInput = type === 'weight'
    ? h('input', { type: 'number', inputmode: 'decimal', step: 'any', min: '0', placeholder: '0', 'aria-label': 'Weight in pounds', required: true })
    : null;
  const repsInput = h('input', { type: 'number', inputmode: 'numeric', step: '1', min: '1', placeholder: '0', 'aria-label': 'Reps', required: true });

  const form = h('form', { class: 'log-form', hidden: true, onsubmit: (ev) => {
      ev.preventDefault();
      const reps = Number(repsInput.value);
      const weight = weightInput ? Number(weightInput.value) : null;
      if (!Number.isFinite(reps) || reps <= 0 || !Number.isInteger(reps)) {
        toast('Enter reps as a whole number.'); repsInput.focus(); return;
      }
      if (weightInput && (!Number.isFinite(weight) || weight < 0 || weightInput.value === '')) {
        toast('Enter a weight in lb.'); weightInput.focus(); return;
      }
      const entry = { date: todayStr(), reps, at: Date.now() };
      if (weightInput) entry.weight = weight;
      if (addLog(id, entry)) {
        toast('Logged.');
        rerender();
      }
    }},
    weightInput ? h('label', { class: 'field' }, h('span', null, 'Weight (lb)'), weightInput) : null,
    h('label', { class: 'field' }, h('span', null, 'Reps'), repsInput),
    h('div', { class: 'form-actions' },
      h('button', { type: 'submit', class: 'btn primary' }, 'Save'),
      h('button', { type: 'button', class: 'btn', onclick: () => {
        form.hidden = true; logBtn.hidden = false;
      }}, 'Cancel')
    )
  );

  const logBtn = h('button', { type: 'button', class: 'btn log-btn', onclick: () => {
    form.hidden = false; logBtn.hidden = true;
    (weightInput || repsInput).focus();
  }}, 'Log this');

  wrap.append(h('div', { class: 'log' }, logBtn, form, histList));
  return wrap;
}

// ---------- Block card ----------

function renderBlock(sessionKey, block) {
  const card = h('section', { class: 'block' });

  const rerender = () => card.replaceWith(renderBlock(sessionKey, block));

  const done = isDone(sessionKey, block.id);
  if (done) card.classList.add('done');

  const checkbox = h('input', { type: 'checkbox', checked: done, onchange: (ev) => {
    setDone(sessionKey, block.id, ev.target.checked);
    card.classList.toggle('done', ev.target.checked);
  }});

  card.append(h('header', { class: 'block-head' },
    h('h2', { class: 'block-label' }, block.label),
    h('label', { class: 'done-box' }, checkbox, h('span', null, 'Done'))
  ));

  if (block.note) card.append(h('p', { class: 'note' }, block.note));

  let items = block.items;
  if (block.choices) {
    const toggleId = sessionKey + ':' + block.id;
    const current = getToggle(toggleId, block.choices[0].key);
    const choice = block.choices.find(c => c.key === current) || block.choices[0];
    card.append(segmented(block.label + ' exercise', block.choices, choice.key, (key) => {
      setToggle(toggleId, key);
      rerender();
    }));
    items = choice.items;
  }

  items.forEach(item => card.append(renderItem(item, rerender)));
  return card;
}

// ---------- Views ----------

function renderHome() {
  const btn = (key, cls) => h('a', { class: 'day-btn ' + cls, href: '#' + key },
    h('span', { class: 'day-title' }, SESSIONS[key].title.replace(' day', '')),
    h('span', { class: 'day-sub' }, SESSIONS[key].subtitle)
  );
  return h('main', { class: 'home' },
    h('header', { class: 'home-head' },
      h('h1', null, 'Rep Roster'),
      h('p', { class: 'today' }, new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))
    ),
    h('p', { class: 'prompt' }, 'What’s today?'),
    h('nav', { class: 'day-buttons' },
      btn('lower', 'lower'),
      btn('upper', 'upper'),
      btn('rest', 'rest')
    )
  );
}

function renderSession(key) {
  const s = SESSIONS[key];
  const main = h('main', { class: 'session ' + key },
    h('header', { class: 'session-head' },
      h('a', { class: 'back', href: '#', 'aria-label': 'Back to day picker' }, '‹ Days'),
      h('h1', null, s.title)
    )
  );

  let mode = null;
  if (s.mode) {
    const toggleId = key + ':mode';
    mode = getToggle(toggleId, s.mode.options[0].key);
    main.append(h('div', { class: 'mode' },
      h('p', { class: 'mode-label' }, s.mode.label),
      segmented(s.mode.label, s.mode.options, mode, (val) => {
        setToggle(toggleId, val);
        render();
      })
    ));
  }

  s.blocks
    .filter(b => !b.when || b.when === mode)
    .forEach(b => main.append(renderBlock(key, b)));

  return main;
}

let renderedDate = null;

function render() {
  const key = location.hash.slice(1);
  const view = SESSIONS[key] ? renderSession(key) : renderHome();
  document.getElementById('app').replaceChildren(view);
  renderedDate = todayStr();
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

// If the app was left open past midnight, reset when it comes back.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && renderedDate !== todayStr()) render();
});

render();

// ---------- Offline + keep data ----------

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}
