const REFRESH_INTERVAL = 5000;
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

  const leaders = highestValue > 0
    ? enriched.filter((item) => item.value === highestValue)
    : [];
  const lastOnes = enriched.filter((item) => item.value === lowestValue);

  const hasLeadTie = leaders.length > 1;
  const hasLastTie = lastOnes.length > 1;

  enriched.forEach((item) => {
    const card = document.querySelector(`[data-participant="${item.id}"]`);
    if (!card) return;

    const image = card.querySelector('.participant-image');
    const name = card.querySelector('.participant-name');
    const config = participantMap[item.id];

    const isLeader = highestValue > 0 && item.value === highestValue;
    const isLast = item.value === lowestValue;

    let state = 'neutral';

    if (isLeader && !hasLeadTie) {
      state = 'crown';
    } else if (isLast && !hasLastTie && enriched.length > 1) {
      state = 'sad';
    }

    card.style.setProperty('--participant-scale', String(item.scale || 1));
    card.classList.toggle('is-leader', isLeader);
    card.classList.toggle('is-last', isLast && !hasLastTie);
    card.classList.toggle('is-lead-tie', isLeader && hasLeadTie);
    card.classList.toggle('is-last-tie', isLast && hasLastTie);

    if (image) {
      image.src = config.states[state];
      image.alt = config.label;
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
