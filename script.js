const REFRESH_INTERVAL = 5000;
const IMAGE_VERSION = 'ranking-assets-v4';
const SCALE_MIN = 0.78;
const SCALE_MAX = 1.14;

const participantMap = {
  michele: {
    label: 'Michele',
    fileKey: 'michele',
    states: {
      neutral: './assets/participantes/michele/neutra.png',
      crown: './assets/participantes/michele/coroa.png',
      sad: './assets/participantes/michele/triste.png'
    }
  },
  marcelly: {
    label: 'Marcelly',
    fileKey: 'marcelly',
    states: {
      neutral: './assets/participantes/marcelly/neutra.png',
      crown: './assets/participantes/marcelly/coroa.png',
      sad: './assets/participantes/marcelly/triste.png'
    }
  },
  pamela: {
    label: 'Pamela',
    fileKey: 'pamela',
    states: {
      neutral: './assets/participantes/pamela/neutra.png',
      crown: './assets/participantes/pamela/coroa.png',
      sad: './assets/participantes/pamela/triste.png'
    }
  },
  yasmin: {
    label: 'Yasmin',
    fileKey: 'yasmin',
    states: {
      neutral: './assets/participantes/yasmin/neutra.png',
      crown: './assets/participantes/yasmin/coroa.png',
      sad: './assets/participantes/yasmin/triste.png'
    }
  }
};

const participantOrder = Object.keys(participantMap);

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
    if (maxValue <= 0) {
      return { ...item, scale: 1 };
    }

    if (spread <= 0) {
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

function applyRanking(data) {
  const enriched = getScales(data);
  const values = enriched.map((item) => item.value);
  const highestValue = Math.max(...values, 0);
  const lowestValue = Math.min(...values, 0);

  const hasAnyValue = highestValue > 0;
  const allSame = highestValue === lowestValue;

  const leaderIds = hasAnyValue ? enriched
    .filter((item) => item.value === highestValue)
    .map((item) => item.id) : [];

  const lastIds = hasAnyValue && !allSame ? enriched
    .filter((item) => item.value === lowestValue)
    .map((item) => item.id) : [];

  const hasLeadTie = leaderIds.length > 1;

  enriched.forEach((item) => {
    const card = document.querySelector(`[data-participant="${item.id}"]`);
    if (!card) return;

    const image = card.querySelector('.participant-image');
    const name = card.querySelector('.participant-name');
    const sticker = card.querySelector('.participant-sticker');
    const config = participantMap[item.id];

    const isLeader = leaderIds.includes(item.id);
    const isLast = lastIds.includes(item.id);

    let state = 'neutral';

    if (isLeader && !hasLeadTie) {
      state = 'crown';
    } else if (isLast) {
      state = 'sad';
    }

    card.dataset.state = state;
    card.style.setProperty('--participant-scale', String(item.scale || 1));
    card.classList.toggle('is-leader', state === 'crown');
    card.classList.toggle('is-last', state === 'sad');
    card.classList.toggle('is-lead-tie', isLeader && hasLeadTie);
    card.classList.toggle('is-last-tie', false);

    if (image) {
      const nextSrc = `${config.states[state]}?v=${IMAGE_VERSION}&state=${state}`;

      image.removeAttribute('src');
      image.src = nextSrc;
      image.alt = `${config.label} - ${state}`;
      image.dataset.currentState = state;
    }

    if (sticker) {
      sticker.setAttribute('data-state', state);
    }

    if (name) {
      name.textContent = config.label;
    }
  });
}
async function loadValues() {
  try {
    const response = await fetch(`./valores.txt?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Falha ao carregar valores.txt: ${response.status}`);
    }

    const text = await response.text();
    const data = parseValuesTxt(text);
    applyRanking(data);
  } catch (error) {
    console.error(error);
  }
}

loadValues();
setInterval(loadValues, REFRESH_INTERVAL);
window.addEventListener('focus', loadValues);
