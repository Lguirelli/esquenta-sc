const REFRESH_INTERVAL = 5000;
const SCALE_MIN = 0.78;
const SCALE_MAX = 1.14;

const participantMap = {
  michele: {
    label: 'Michele',
    states: {
      neutral: './assets/participantes/michele/neutra.png',
      crown: './assets/participantes/michele/coroa.png',
      sad: './assets/participantes/michele/triste.png'
    }
  },
  marcelly: {
    label: 'Marcelly',
    states: {
      neutral: './assets/participantes/marcelly/neutra.png',
      crown: './assets/participantes/marcelly/coroa.png',
      sad: './assets/participantes/marcelly/triste.png'
    }
  },
  pamela: {
    label: 'Pamela',
    states: {
      neutral: './assets/participantes/pamela/neutra.png',
      crown: './assets/participantes/pamela/coroa.png',
      sad: './assets/participantes/pamela/triste.png'
    }
  },
  yasmin: {
    label: 'Yasmin',
    states: {
      neutral: './assets/participantes/yasmin/neutra.png',
      crown: './assets/participantes/yasmin/coroa.png',
      sad: './assets/participantes/yasmin/triste.png'
    }
  }
};

const participantOrder = Object.keys(participantMap);
let refreshCounter = 0;

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function parseNumber(value) {
  const raw = String(value || '')
    .replace(/R\$/gi, '')
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseValuesTxt(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'));

  const valueMap = new Map();

  lines.forEach((line) => {
    const match = line.match(/^([^:=\-]+?)\s*[:=-]\s*(.+)$/);
    if (!match) return;

    const [, rawName, rawValue] = match;
    valueMap.set(normalizeName(rawName), parseNumber(rawValue));
  });

  return participantOrder.map((id) => ({
    id,
    value: valueMap.get(normalizeName(participantMap[id].label)) || 0
  }));
}

function getScales(data) {
  const values = data.map((item) => item.value);
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  const spread = maxValue - minValue;

  return data.map((item) => {
    if (maxValue <= 0 || spread <= 0) {
      return { ...item, scale: 1 };
    }

    const ratio = (item.value - minValue) / spread;
    const scale = SCALE_MIN + ratio * (SCALE_MAX - SCALE_MIN);

    return {
      ...item,
      scale: Number(scale.toFixed(3))
    };
  });
}

function resolveStates(data) {
  const states = Object.fromEntries(participantOrder.map((id) => [id, 'neutral']));

  if (!data.length) {
    return states;
  }

  const values = data.map((item) => item.value);
  const hasAnyPositive = values.some((value) => value > 0);

  if (!hasAnyPositive) {
    return states;
  }

  const highestValue = Math.max(...values);
  const lowestValue = Math.min(...values);
  const allSame = values.every((value) => value === values[0]);

  const leaderIds = data
    .filter((item) => item.value === highestValue)
    .map((item) => item.id);

  const lastIds = allSame
    ? []
    : data.filter((item) => item.value === lowestValue).map((item) => item.id);

  if (leaderIds.length === 1) {
    states[leaderIds[0]] = 'crown';
  }

  lastIds.forEach((id) => {
    states[id] = 'sad';
  });

  return states;
}

function updateCard(card, config, state, scale, refreshToken) {
  const image = card.querySelector('.participant-image');
  const name = card.querySelector('.participant-name');

  card.dataset.state = state;
  card.style.setProperty('--participant-scale', String(scale || 1));
  card.classList.toggle('is-leader', state === 'crown');
  card.classList.toggle('is-last', state === 'sad');
  card.classList.remove('is-lead-tie');
  card.classList.remove('is-last-tie');

  if (image) {
    const nextSrc = `${config.states[state]}?v=${encodeURIComponent(refreshToken)}`;
    image.removeAttribute('src');
    image.setAttribute('src', nextSrc);
    image.setAttribute('alt', `${config.label} - ${state}`);
    image.dataset.renderedState = state;
  }

  if (name) {
    name.textContent = config.label;
  }
}

function applyRanking(parsedData) {
  refreshCounter += 1;
  const scaledData = getScales(parsedData);
  const states = resolveStates(parsedData);
  const refreshToken = `rank-${refreshCounter}-${Date.now()}`;

  participantOrder.forEach((id) => {
    const card = document.querySelector(`[data-participant="${id}"]`);
    if (!card) return;

    const config = participantMap[id];
    const item = scaledData.find((entry) => entry.id === id) || { id, value: 0, scale: 1 };
    const state = states[id] || 'neutral';

    updateCard(card, config, state, item.scale, refreshToken);
  });

  console.table(
    participantOrder.map((id) => ({
      participante: participantMap[id].label,
      valor: parsedData.find((entry) => entry.id === id)?.value || 0,
      estado: states[id] || 'neutral'
    }))
  );
}

async function loadValues() {
  try {
    const response = await fetch(`./valores.txt?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Falha ao carregar valores.txt: ${response.status}`);
    }

    const text = await response.text();
    const parsedData = parseValuesTxt(text);
    applyRanking(parsedData);
  } catch (error) {
    console.error(error);
  }
}

loadValues();
setInterval(loadValues, REFRESH_INTERVAL);
window.addEventListener('focus', loadValues);
