const rawInput = document.getElementById("inputValores").value.trim();

const duoMap = {
  "marcelly-raquel": {
    label: "Raquel & Marcelly",
    normal: "assets/duplas/marcelly-raquel.png",
    crown: "assets/duplas/marcelly-raquel-coroa.png"
  },

  "michele-debora": {
    label: "Michele & Debora",
    normal: "assets/duplas/michele-debora.png",
    crown: "assets/duplas/michele-debora-coroa.png"
  },

  "yasmin-laylla": {
    label: "Laylla & Yasmin",
    normal: "assets/duplas/yasmin-laylla.png",
    crown: "assets/duplas/yasmin-laylla-coroa.png"
  },

  "alicia-ana": {
    label: "Ana & Alicia",
    normal: "assets/duplas/alicia-ana.png",
    crown: "assets/duplas/alicia-ana-coroa.png"
  }
};

function normalizeName(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/\be\b/g, "-")
    .replace(/[•/&]/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

function parseMoney(valueText) {
  let value = valueText
    .replace(/[R$\s]/g, "")
    .trim();

  if (value.includes(".") && value.includes(",")) {
    value = value.replace(/\./g, "").replace(",", ".");
  } else if (value.includes(",")) {
    const parts = value.split(",");

    if (parts.length > 2) {
      const cents = parts.pop();
      value = parts.join("") + "." + cents;
    } else {
      value = value.replace(",", ".");
    }
  }

  return Number(value);
}

function readValues(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

    .map((line) => {
      const valueMatch = line.match(/R?\$?\s*[\d.,]+\s*$/i);

      if (!valueMatch) return null;

      const value = parseMoney(valueMatch[0]);

      const name = line
        .replace(valueMatch[0], "")
        .replace(/[-–—]+$/, "")
        .trim();

      const id = normalizeName(name);

      return {
        id,
        name,
        value
      };
    })

    .filter(Boolean)
    .filter((item) => duoMap[item.id]);
}

function renderPodium() {
  const data = readValues(rawInput);

  if (!data.length) return;

  const highestValue =
    Math.max(...data.map((item) => item.value)) || 1;

  const winners =
    data.filter((item) => item.value === highestValue);

  const hasTie =
    winners.length > 1;

  data.forEach((item) => {
    const duo = document.querySelector(`[data-duo="${item.id}"]`);

    if (!duo) return;

    const image =
      duo.querySelector(".duo-image");

    const nameTag =
      duo.querySelector(".duo-name");

    const rawScale =
      item.value / highestValue;

    const visualScale =
      0.75 + rawScale * 0.45;

    duo.style.transform =
      `scale(${visualScale})`;

    duo.classList.remove("winner-glow");

    if (item.value === highestValue) {
      duo.classList.add("winner-glow");

      image.src =
        hasTie
          ? duoMap[item.id].normal
          : duoMap[item.id].crown;
    } else {
      image.src =
        duoMap[item.id].normal;
    }

    image.alt =
      duoMap[item.id].label;

    nameTag.textContent =
      duoMap[item.id].label;
  });
}

renderPodium();
