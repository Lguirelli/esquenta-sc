# Dia D Eurofarma — ranking individual com leitura por TXT

Projeto estático para exibir um ranking visual de positivação.

A tela final mostra apenas:

- imagem de cada participante
- nome fixo abaixo
- escala dinâmica conforme a positivação
- versão com coroa para a líder
- versão triste para a última colocada

Os valores não aparecem no `index.html`.
Eles são lidos apenas do arquivo `valores.txt`.

## Estrutura principal

```txt
index.html
style.css
script.js
valores.txt
assets/
  participantes/
    michele/
    marcelly/
    pamela/
    yasmin/
```

## Como atualizar os valores

Edite somente o arquivo `valores.txt`.

Exemplo:

```txt
Michele: 150
Marcelly: 80
Pamela: 45
Yasmin: 120
```

Também funciona com valores monetários:

```txt
Michele: R$ 150.000,00
Marcelly: R$ 80.000,00
Pamela: R$ 45.000,00
Yasmin: R$ 120.000,00
```

A página tenta reler o `valores.txt` automaticamente a cada 5 segundos.

## Regras visuais implementadas

- 1º lugar: imagem com coroa
- 2º e 3º lugares: imagem neutra
- último lugar: imagem triste
- empate na liderança: ninguém recebe coroa, apenas glow nas empatadas
- empate no último lugar: ninguém recebe imagem triste
- nomes são fixos e não escalam
- boxes são separados e a escala ocorre só dentro da área da imagem

## Troca de imagens

Cada participante possui 3 arquivos:

```txt
neutra.png
coroa.png
triste.png
```

Substitua pelos seus arquivos finais mantendo os mesmos nomes.

## Observação importante

Se abrir o `index.html` direto pelo sistema de arquivos, alguns navegadores podem bloquear a leitura do `valores.txt`.

O ideal é rodar em servidor estático ou dentro do portfolio, por exemplo:

```bash
python -m http.server 8000
```

Depois abra:

```txt
http://localhost:8000
```


## Fundo

O fundo agora é gerado por CSS no `style.css`.

Não é necessário usar `background-base.png` ou `background-full.png`.


## Ajustes recentes

- pasta antiga `assets/duplas` removida
- logos atualizadas em `assets/opella-logo.png` e `assets/grupofarma-logo.png`
- a participante em último lugar agora usa a versão `triste.png` sempre que houver menor valor, mesmo em empate no último lugar


## Correção aplicada

- logos corrigidas:
  - `assets/opella-logo.png` fica no topo
  - `assets/grupofarma-logo.png` fica no rodapé
- pasta antiga `assets/duplas` removida
- backgrounds antigos removidos, pois o fundo está em CSS
- placeholders `.svg` removidos
- lógica do último lugar corrigida para usar `triste.png`


## Ajuste visual e lógica

- fundo alterado para cor flat via CSS
- logo Opella aumentada para 1,5x
- logo GrupoFarma reduzida pela metade
- lógica do último lugar reforçada para usar `triste.png`
- adicionado cache buster nas imagens para evitar que o navegador mantenha a versão neutra antiga


## Ajustes aplicados

- removidos glow e drop shadow das imagens
- removidos boxes dos nomes e das imagens
- imagens das participantes reconstruídas como recortes com borda branca de 5px e textura de papel aplicada em multiply a 50%
- textura de papel aplicada também sobre o fundo verde
- lógica do estado triste reescrita para forçar o uso de `triste.png` para toda participante com menor valor
- limpeza de arquivos antigos não utilizados


## Ajuste de flicker e acabamento

- o flicker era causado porque o script removia e reatribuía o `src` de todas as imagens a cada ciclo de 5 segundos, mesmo sem mudança real
- agora o `src` só é alterado quando o estado da participante realmente muda
- o layout também só reaplica quando há mudança no snapshot de valores, escala ou estado
- as bordas brancas foram removidas das caricaturas
- a textura nas caricaturas está aplicada com multiply em 100% sobre os pixels visíveis
- o fundo foi alterado para off white com textura sutil

## Ajuste de blend

- removida a sobreposição/filtro de cor do logo da Opella
- caricaturas configuradas com `mix-blend-mode: multiply` no CSS

## Ajuste do logo

- adicionado drop shadow no logo da Opella para melhorar a separação do fundo

## Ajuste responsivo de escala

- a escala do ranking agora usa `--rank-scale` no JS
- o CSS adiciona `--screen-scale` para reduzir proporcionalmente em telas menores
- as imagens diminuem antes de quebrar o grid
- abaixo de 920px o layout quebra para 2 colunas
- abaixo de 560px o tamanho das imagens, logos e nomes é reduzido novamente
