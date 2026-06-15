const REFRESH_INTERVAL = 5000;
const SCALE_BASE = 1;
const SCALE_BOOST = 0.52;

// Equalização visual forçada para o estado inicial: como cada PNG tem recortes e proporções diferentes,
// cada participante recebe um baseScale compensatório para começar visualmente no mesmo tamanho.

const participantMap = {
  michele: {
    label: 'Michele',
    baseScale: 0.87,
    states: {
      neutral: './assets/participantes/michele/neutra.png',
      crown: './assets/participantes/michele/coroa.png',
      sad: './assets/participantes/michele/triste.png'
    }
  },
  marcelly: {
    label: 'Marcelly',
    baseScale: 1.00,
    states: {
      neutral: './assets/participantes/marcelly/neutra.png',
      crown: './assets/participantes/marcelly/coroa.png',
      sad: './assets/participantes/marcelly/triste.png'
    }
  },
  pamela: {
    label: 'Pamela',
    baseScale: 0.90,
    states: {
      neutral: './assets/participantes/pamela/neutra.png',
      crown: './assets/participantes/pamela/coroa.png',
      sad: './assets/participantes/pamela/triste.png'
    }
  },
  yasmin: {
    label: 'Yasmin',
    baseScale: 1.18,
    states: {
      neutral: './assets/participantes/yasmin/neutra.png',
      crown: './assets/participantes/yasmin/coroa.png',
      sad: './assets/participantes/yasmin/triste.png'
    }
  }
};

const participantOrder = Object.keys(participantMap);
let lastSnapshot = '';

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

function readEmbeddedScores() {
  return participantOrder.map((id) => {
    const node = document.querySelector(`[data-score-for="${id}"]`);
    return {
      id,
      value: node ? parseNumber(node.textContent) : 0
    };
  });
}

function getScales(data) {
  const total = data.reduce((acc, item) => acc + Math.max(item.value, 0), 0);

  return data.map((item) => {
    if (total <= 0) {
      return { ...item, scale: 1 };
    }

    const share = Math.max(item.value, 0) / total;
    const scale = SCALE_BASE + share * SCALE_BOOST;

    return {
      ...item,
      scale: Number(scale.toFixed(3))
    };
  });
}

function resolveStates(data) {
  const states = Object.fromEntries(participantOrder.map((id) => [id, 'neutral']));
  if (!data.length) return states;

  const values = data.map((item) => item.value);
  const hasAnyPositive = values.some((value) => value > 0);
  if (!hasAnyPositive) return states;

  const highestValue = Math.max(...values);
  const lowestValue = Math.min(...values);
  const allSame = values.every((value) => value === values[0]);

  const leaderIds = data.filter((item) => item.value === highestValue).map((item) => item.id);
  const lastIds = allSame ? [] : data.filter((item) => item.value === lowestValue).map((item) => item.id);

  if (leaderIds.length === 1) {
    states[leaderIds[0]] = 'crown';
  }

  lastIds.forEach((id) => {
    states[id] = 'sad';
  });

  return states;
}

function buildSnapshot(data, states) {
  return JSON.stringify(
    participantOrder.map((id) => {
      const item = data.find((entry) => entry.id === id) || { value: 0, scale: 1 };
      return { id, value: item.value, scale: item.scale, state: states[id] || 'neutral' };
    })
  );
}

function updateCard(card, config, state, scale) {
  const image = card.querySelector('.participant-image');
  const name = card.querySelector('.participant-name');

  card.dataset.state = state;
  card.style.setProperty('--rank-scale', String(scale || 1));
  card.style.setProperty('--base-scale', String(config.baseScale || 1));
  card.classList.toggle('is-leader', state === 'crown');
  card.classList.toggle('is-last', state === 'sad');

  if (image) {
    const desiredSrc = config.states[state];
    if (image.dataset.currentState !== state || image.dataset.currentSrc !== desiredSrc) {
      image.src = desiredSrc;
      image.dataset.currentState = state;
      image.dataset.currentSrc = desiredSrc;
    }
    image.alt = `${config.label} - ${state}`;
  }

  if (name) {
    name.textContent = config.label;
  }
}

function applyRanking(parsedData) {
  const scaledData = getScales(parsedData);
  const states = resolveStates(parsedData);
  const snapshot = buildSnapshot(scaledData, states);

  if (snapshot === lastSnapshot) {
    return;
  }

  lastSnapshot = snapshot;

  participantOrder.forEach((id) => {
    const card = document.querySelector(`[data-participant="${id}"]`);
    if (!card) return;

    const config = participantMap[id];
    const item = scaledData.find((entry) => entry.id === id) || { id, value: 0, scale: 1 };
    const state = states[id] || 'neutral';

    updateCard(card, config, state, item.scale);
  });

  console.table(
    participantOrder.map((id) => ({
      participante: participantMap[id].label,
      valor: parsedData.find((entry) => entry.id === id)?.value || 0,
      escala: scaledData.find((entry) => entry.id === id)?.scale || 1,
      estado: states[id] || 'neutral'
    }))
  );
}

function refreshRanking() {
  const parsedData = readEmbeddedScores();
  applyRanking(parsedData);
}

refreshRanking();
setInterval(refreshRanking, REFRESH_INTERVAL);
window.addEventListener('focus', refreshRanking);
