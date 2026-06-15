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
