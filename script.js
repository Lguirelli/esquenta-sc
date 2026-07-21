const REFRESH_INTERVAL = 5000;
const SCALE_AVERAGE_SHARE = 0.20;
const SCALE_SENSITIVITY = 1.08;
const SCALE_MIN = 0.84;
const SCALE_MAX = 1.22;

const participantMap = {
  alicia: { label: 'Alicia', baseScale: 1 },
  marcelly: { label: 'Marcelly', baseScale: 1 },
  michele: { label: 'Michele', baseScale: 1 },
  pamela: { label: 'Pamela', baseScale: 1 },
  yasmin: { label: 'Yasmin', baseScale: 1 }
};

const participantOrder = ['alicia', 'marcelly', 'michele', 'pamela', 'yasmin'];
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
      return { ...item, share: 0, scale: 1 };
    }

    const share = Math.max(item.value, 0) / total;
    const rawScale = 1 + ((share - SCALE_AVERAGE_SHARE) * SCALE_SENSITIVITY);
    const scale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, rawScale));

    return {
      ...item,
      share,
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
    states[leaderIds[0]] = 'leader';
  }

  lastIds.forEach((id) => {
    states[id] = 'last';
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
  const name = card.querySelector('.participant-name');
  const stage = card.querySelector('.participant-stage');
  const photo = card.querySelector('.participant-photo');

  card.dataset.state = state;
  card.style.setProperty('--rank-scale', String(scale || 1));
  card.style.setProperty('--base-scale', String(config.baseScale || 1));
  card.classList.toggle('is-leader', state === 'leader');
  card.classList.toggle('is-last', state === 'last');

  if (name) {
    name.textContent = config.label;
  }

  if (photo) {
    photo.alt = `${config.label}`;
  }

  if (stage) {
    stage.setAttribute('aria-label', `${config.label} - ${state}`);
  }
}

function applyRanking(parsedData) {
  const scaledData = getScales(parsedData);
  const states = resolveStates(parsedData);
  const snapshot = buildSnapshot(scaledData, states);

  if (snapshot === lastSnapshot) return;
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
      estado: states[id] || 'neutral',
      participacao: (((scaledData.find((entry) => entry.id === id)?.share || 0) * 100).toFixed(2) + '%')
    }))
  );
}

function refreshRanking() {
  applyRanking(readEmbeddedScores());
}

refreshRanking();
setInterval(refreshRanking, REFRESH_INTERVAL);
window.addEventListener('focus', refreshRanking);
