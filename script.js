const rawInput = document.getElementById("inputValores").value.trim();

const duoMap = {
  "marcelly-raquel": {
    label: "Marcelly & Raquel",
    normal: "assets/duplas/marcelly-raquel.png",
    crown: "assets/duplas/marcelly-raquel-coroa.png"
  },

  "michele-debora": {
    label: "Michele & Debora",
    normal: "assets/duplas/michele-debora.png",
    crown: "assets/duplas/michele-debora-coroa.png"
  },

  "yasmin-laylla": {
    label: "Yasmin & Laylla",
    normal: "assets/duplas/yasmin-laylla.png",
    crown: "assets/duplas/yasmin-laylla-coroa.png"
  },

  "alicia-ana": {
    label: "Alicia & Ana",
    normal: "assets/duplas/alicia-ana.png",
    crown: "assets/duplas/alicia-ana-coroa.png"
  }
};

/* NORMALIZA NOMES */

function normalizeName(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[•/&]/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

/* LEITURA DOS VALORES */

function readValues(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

    .map((line) => {
      const valueMatch = line.match(/(\d+(?:[,.]\d+)?)\s*$/);

      if (!valueMatch) return null;

      const value = Number(
        valueMatch[1].replace(",", ".")
      );

      const name = line
        .replace(valueMatch[0], "")
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

/* RENDER */

function renderPodium() {

  const data = readValues(rawInput);

  if (!data.length) return;

  /* MAIOR VALOR */

  const highestValue =
    Math.max(...data.map((item) => item.value)) || 1;

  data.forEach((item) => {

    const duo = document.querySelector(
      `[data-duo="${item.id}"]`
    );

    if (!duo) return;

    const image =
      duo.querySelector(".duo-image");

    const nameTag =
      duo.querySelector(".duo-name");

    /* ESCALA */

    const rawScale =
      item.value / highestValue;

    const visualScale =
      0.75 + rawScale * 0.45;

    duo.style.transform =
      `scale(${visualScale})`;

    /* COROA */

    image.src =
      item.value === highestValue
        ? duoMap[item.id].crown
        : duoMap[item.id].normal;

    /* TEXTOS */

    image.alt = duoMap[item.id].label;

    nameTag.textContent =
      duoMap[item.id].label;
  });
}

/* INICIAR */

renderPodium();
