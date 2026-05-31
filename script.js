const sliders = [...document.querySelectorAll('[data-slider]')];
const totalValue = document.getElementById('totalValue');

const duoMap = {
  'marcelly-raquel': {
    label: 'Raquel & Marcelly',
    normal: './assets/duplas/marcelly-raquel.png',
    crown: './assets/duplas/marcelly-raquel-coroa.png'
  },
  'michele-debora': {
    label: 'Michele & Debora',
    normal: './assets/duplas/michele-debora.png',
    crown: './assets/duplas/michele-debora-coroa.png'
  },
  'yasmin-laylla': {
    label: 'Laylla & Yasmin',
    normal: './assets/duplas/yasmin-laylla.png',
    crown: './assets/duplas/yasmin-laylla-coroa.png'
  },
  'alicia-ana': {
    label: 'Ana & Alicia',
    normal: './assets/duplas/alicia-ana.png',
    crown: './assets/duplas/alicia-ana-coroa.png'
  }
};

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value) || 0);
}

function readSliderValues() {
  return sliders
    .map((slider) => ({
      id: slider.dataset.slider,
      value: Number(slider.value) || 0
    }))
    .filter((item) => duoMap[item.id]);
}

function setPlaces(data) {
  const ordered = [...data].sort((a, b) => b.value - a.value);

  ordered.forEach((item, index) => {
    const duo = document.querySelector(`[data-duo="${item.id}"]`);
    const control = document.querySelector(`[data-control="${item.id}"]`);

    if (duo) {
      duo.classList.remove('place-1', 'place-2', 'place-3', 'place-4');
      duo.classList.add(`place-${index + 1}`);
    }

    if (control) {
      control.classList.remove('control-place-1', 'control-place-2', 'control-place-3', 'control-place-4');
      control.classList.add(`control-place-${index + 1}`);
    }
  });
}

function renderPodium() {
  const data = readSliderValues();
  if (!data.length) return;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const highestValue = Math.max(...data.map((item) => item.value), 0);
  const winners = highestValue > 0 ? data.filter((item) => item.value === highestValue) : [];
  const hasTie = winners.length > 1;

  setPlaces(data);

  if (totalValue) {
    totalValue.textContent = formatMoney(total);
  }

  data.forEach((item) => {
    const duo = document.querySelector(`[data-duo="${item.id}"]`);
    const valueTag = document.querySelector(`[data-value-for="${item.id}"]`);

    if (valueTag) {
      valueTag.textContent = formatMoney(item.value);
    }

    if (!duo) return;

    const image = duo.querySelector('.duo-image');
    const nameTag = duo.querySelector('.duo-name');
    const share = total > 0 ? item.value / total : 0.25;
    const visualScale = total > 0 ? 0.86 + share * 0.62 : 1;

    if (image) {
      image.style.transform = `scale(${visualScale})`;
      image.src = item.value > 0 && item.value === highestValue && !hasTie ? duoMap[item.id].crown : duoMap[item.id].normal;
      image.alt = duoMap[item.id].label;
    }

    if (nameTag) {
      nameTag.textContent = duoMap[item.id].label;
    }

    duo.classList.toggle('winner-glow', item.value > 0 && item.value === highestValue);
  });
}

sliders.forEach((slider) => {
  slider.value = '0';
  slider.addEventListener('input', renderPodium);
  slider.addEventListener('change', renderPodium);
});

renderPodium();
