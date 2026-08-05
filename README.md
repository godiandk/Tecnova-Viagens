# Tecnova Viagens

Busca de passagens aéreas que compara **preço e risco lado a lado**.

A maioria dos buscadores ordena por preço e deixa o risco nas letras miúdas. Só que os truques que
deixam uma passagem barata — bilhetes separados, conexão de 40 minutos, troca de aeroporto, voo de
madrugada — são exatamente os que fazem a viagem dar errado. Aqui cada opção recebe uma **nota de
segurança de 0 a 100**, uma lista explícita do que pode dar errado e um **custo real estimado**. Um
controle deslizante define para que lado a lista pende: do mais barato possível ao mais seguro.

> Uma ferramenta de análise, não uma agência: o projeto não vende passagens nem emite bilhetes.

---

## Como rodar

```bash
npm install
npm run dev          # http://localhost:3000
```

Funciona sem nenhuma configuração: por padrão usa o provedor **simulado**, que gera ofertas
plausíveis e determinísticas. Os preços não são reais e a interface avisa isso em destaque.

Para dados reais, copie `.env.example` para `.env.local` e preencha as credenciais de um provedor
real — veja **[Onde conseguir dados reais](#onde-conseguir-dados-reais)**.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o site em modo de desenvolvimento |
| `npm run build` / `npm start` | Build e execução em produção |
| `npm test` | Roda a suíte de testes (Vitest) |
| `npm run tipos` | Checagem de tipos sem emitir arquivos |
| `npm run lint` | ESLint |
| `npm run verificar` | Tipos + lint + testes, na ordem |

---

## A ideia central: risco tem preço

O projeto parte de uma observação simples — **o desconto de uma passagem arriscada é, na média, o
preço de um problema futuro**. Duas ideias implementam isso.

### 1. Nota de segurança (0 a 100)

Todo itinerário começa com 100 pontos e perde pontos por cada problema encontrado. Cada desconto
aparece na interface com o motivo e quantos pontos custou — nada de nota opaca.

O que o motor procura (`src/lib/seguranca.ts`):

| Problema | Por que importa |
| --- | --- |
| **Bilhetes separados** | Cada bilhete é um contrato independente. Perdeu o segundo voo por atraso do primeiro? Ninguém é obrigado a reacomodar você — o bilhete vira no-show e você recompra do bolso. |
| **Conexão abaixo do mínimo** | Comparamos o tempo disponível com o mínimo real daquele tipo de conexão: 45 min doméstica, 90 min internacional, 180 min entre bilhetes separados, 300 min quando troca de aeroporto. |
| **Troca de aeroporto** | Chegar em GRU e embarcar em CGH é atravessar a cidade por conta própria, com a bagagem. Trânsito não é problema da companhia. |
| **Visto de trânsito** | Conectar nos EUA exige visto americano mesmo sem sair do aeroporto. Sem ele, o embarque é negado ainda no Brasil. |
| **Conexão noturna** | Perder o último voo do dia significa dormir na cidade e seguir no dia seguinte. |
| **Madrugada** | Chegar às 3h significa sem transporte público e corrida cara. |
| **Tarifa travada** | Sem remarcação nem reembolso, mudar de ideia custa quase uma passagem nova. |
| **Pontualidade da companhia** | Companhia que atrasa mais come a margem da conexão antes de você sair do lugar. |
| **Preço bom demais** | Muito abaixo da mediana da busca costuma ter um motivo escondido nas condições. |

Penalidades de conexão **escalam com o tamanho do buraco**: 40 minutos onde o mínimo é 45 é
apertado; 45 onde o mínimo é 180 é ficção. Uma penalidade fixa trataria as duas igual.

### 2. Custo real estimado

O preço anunciado é só uma parte da conta. O total soma:

```
passagem + bagagem + traslado + pernoite + (probabilidade de falha × prejuízo se falhar)
```

O último termo é o que torna a comparação honesta. A probabilidade de falha vem do risco de
cancelamento das companhias combinado com a chance de perder cada conexão — que cresce
exponencialmente conforme a margem sobre o mínimo encolhe. O prejuízo depende de haver proteção:
com bilhete único a companhia reacomoda; com bilhetes separados você recompra a perna em cima da
hora.

É por isso que uma passagem de R$ 1.275 pode aparecer abaixo de uma de R$ 1.924 na lista: somando
bagagem em dois bilhetes e o risco de autoconexão, ela custa mais.

### 3. A balança preço × segurança

O ranking combina dois eixos com um peso ajustável (`0` = só preço, `1` = só segurança):

```
pontuação = (1 − peso) × notaDePreço + peso × (segurança / 100)
```

`notaDePreço` é a **razão em relação ao menor desembolso** do conjunto, não uma normalização
min-max. A diferença é decisiva: com min-max, um conjunto onde os preços variam 5% espalha essa
variação por toda a escala e faz uma economia irrelevante pesar tanto quanto uma enorme. Pela
razão, custar 18% a mais vale sempre 0,85 — independente de como os outros resultados estão
distribuídos.

O componente de risco fica **fora** do eixo de preço de propósito: ele já é contabilizado no eixo
de segurança, e somá-lo nos dois puniria o mesmo problema duas vezes.

Mexer no controle **reordena no navegador**, sobre os itinerários já carregados — não gasta uma
nova consulta ao provedor a cada arrastada.

---

## Arquitetura

```
src/
├── app/
│   ├── page.tsx                 Página inicial
│   ├── layout.tsx               Metadados e tema
│   └── api/
│       ├── busca/route.ts       POST — busca completa
│       ├── aeroportos/route.ts  GET  — autocomplete
│       └── saude/route.ts       GET  — sonda de saúde
├── components/                  Interface (React)
└── lib/
    ├── tipos.ts                 Modelo de domínio
    ├── config.ts                Constantes de calibração
    ├── seguranca.ts             Motor de risco e custo real
    ├── ranking.ts               Combinação preço × segurança
    ├── busca.ts                 Orquestra provedores + ranking
    ├── validacao.ts             Validação de entrada
    ├── tempo.ts                 Horários locais sem armadilha de fuso
    ├── dados/                   Aeroportos, companhias, geografia, vistos
    └── provedores/              Fontes de oferta (simulado, Amadeus)
testes/                          Vitest
```

Três decisões que valem explicação:

**Provedores são intercambiáveis.** O motor de risco não sabe de onde vêm os itinerários. Trocar de
fonte é implementar `ProvedorBusca` (`src/lib/provedores/tipos.ts`). Se o provedor real falhar no
meio de uma busca, a aplicação cai para o simulado e **avisa em destaque** — preço simulado exibido
como se fosse real seria pior do que não responder.

**Horários são hora de parede, não instantes.** `2026-09-12T08:30` significa 08:30 no relógio
daquele aeroporto. `src/lib/tempo.ts` nunca usa `new Date(...)` diretamente para comparar, porque o
resultado mudaria conforme o fuso do servidor. Os cálculos que importam (tempo de conexão) são
sempre entre dois instantes do mesmo aeroporto, então a comparação é válida.

**As premissas ficam todas em um arquivo.** `src/lib/config.ts` reúne tempos mínimos de conexão,
custos estimados e penalidades. São premissas de negócio, não verdades — ajuste sem mexer na lógica.

---

## API

### `POST /api/busca`

```jsonc
{
  "origem": "GRU",              // obrigatório, IATA
  "destino": "LIS",             // obrigatório, IATA
  "ida": "2026-09-19",          // obrigatório, AAAA-MM-DD
  "volta": "2026-10-03",        // opcional
  "passageiros": { "adultos": 1, "criancas": 0, "bebes": 0 },
  "pesoSeguranca": 0.45,        // 0 = só preço, 1 = só segurança
  "exigirBagagemDespachada": false,
  "permitirBilhetesSeparados": true,
  "maxParadas": 2,
  "nacionalidade": "BR"         // usado para checar visto de trânsito
}
```

Devolve um `trecho` por sentido, cada um com resultados ordenados, análise de risco, custo real e
selos (`melhor-escolha`, `mais-barato`, `mais-seguro`, `mais-rapido`). Erros de validação vêm com
status 400 e **todos** os problemas de uma vez, não um por vez.

Limitado a 30 buscas por minuto por IP. O limitador é **em memória**: com várias instâncias
(serverless, múltiplos contêineres) ele não funciona — troque por Redis antes de expor
publicamente.

### `GET /api/aeroportos?q=termo` · `GET /api/saude`

Autocomplete do catálogo e sonda de saúde (informa qual provedor está ativo).

---

## Limites conhecidos

Coisas que o projeto **não** faz, e que você deve saber antes de confiar nele:

- **Os dados de companhias são estimativas de referência**, não estatísticas oficiais. Para uso
  sério, substitua `src/lib/dados/companhias.ts` por dados da ANAC ou de um provedor operacional.
- **A tabela de vistos de trânsito é um aviso, não consultoria.** Regras mudam sem anúncio e
  dependem de vistos que você já tenha. Cada alerta traz o link da fonte oficial — confirme lá.
- **Os fusos horários ignoram horário de verão.** A precisão basta para dimensionar conexões, mas
  não use como fonte de horário oficial.
- **Não há emissão nem redirecionamento para compra.** A análise termina na comparação.
- **O provedor Amadeus só devolve bilhetes únicos**, então itinerários vindos dele nunca disparam o
  alerta de bilhetes separados. Isso é fiel à realidade: quem vende autoconexão são agregadores que
  montam bilhetes avulsos.
- **O cadastro gratuito da Amadeus não existe mais** desde 17 de julho de 2026. O adaptador
  continua no código para quem tiver acesso comercial; para os demais, veja as alternativas acima.

## Publicar no ar

O site tem duas formas de rodar, e a escolha depende de você querer preços reais ou não.

### GitHub Pages — grátis, sem servidor

O motor de risco é TypeScript puro, então roda inteiro no navegador. `npm run site` empacota React,
motor e catálogo de aeroportos num único HTML autocontido em `site/`, e o workflow
`.github/workflows/publicar-site.yml` publica isso no Pages a cada push no branch padrão.

Para ligar, uma vez só: **Settings → Pages → Source: GitHub Actions**. O endereço fica
`https://<usuario>.github.io/<repositorio>/`.

Domínio próprio (o GitHub não vende domínio — compre no registrador, `.com.br` é no Registro.br):

1. **Settings → Secrets and variables → Actions → Variables**, crie `DOMINIO` com o endereço
   (ex.: `tecnovaviagens.com.br`). O build grava o `CNAME` que o Pages exige.
2. No painel DNS do registrador, aponte o domínio para o GitHub — `ALIAS`/`ANAME` na raiz, ou um
   `CNAME` para `<usuario>.github.io` no `www`.
3. **Settings → Pages → Custom domain**, informe o mesmo endereço e marque *Enforce HTTPS*.

**Limite:** o Pages serve arquivo estático. A versão publicada lá usa o provedor **simulado**, e a
página diz isso em destaque. Não dá para ligar a Amadeus aqui: a credencial iria no JavaScript, à
vista de qualquer visitante, e sua cota seria usada por terceiros.

### Vercel — grátis, com servidor

Para tarifas reais, é preciso um servidor que guarde a credencial. Suba o repositório na Vercel,
configure as credenciais do provedor nas variáveis de ambiente do projeto e a rota `/api/busca`
passa a consultar a fonte real sozinha. Domínio próprio também é suportado.

## Onde conseguir dados reais

O adaptador incluído é o da Amadeus, mas **o programa Self-Service dela foi desativado em 17 de
julho de 2026**: developers.amadeus.com passou a oferecer apenas as Enterprise APIs, liberadas
mediante pedido comercial. O código continua servindo para quem tiver esse acesso — as Enterprise
APIs usam os mesmos endpoints —, e é inútil para quem não tiver.

Trocar de fonte custa pouco de propósito: o motor de risco não sabe de onde vêm os itinerários, e
um provedor novo é uma implementação de `ProvedorBusca` (`src/lib/provedores/tipos.ts`).

| Alternativa | Cadastro | O que entrega |
| --- | --- | --- |
| **Travelpayouts** | automático | Preços reais e comissão sobre as compras feitas pelos links |
| **Duffel** | automático, com modo de teste | Preços reais e emissão de bilhete de verdade |
| **Kiwi.com Tequila** | por aplicação | Preços reais e link de compra |

Confirme na fonte antes de investir tempo: a Amadeus mostrou que esses programas mudam sem aviso.

## Linguagem simples

Cada alerta carrega dois textos: `detalhe`, técnico, e `simples`, escrito em segunda pessoa com
frases curtas e consequências concretas ("você tem só 27 minutos para trocar de avião; se o primeiro
voo atrasar um pouquinho, você perde o segundo"). A interface principal mostra o `simples`; o
técnico fica atrás de um clique.

Além disso, cada opção abre com um **veredito de uma frase** — "Pode comprar tranquilo", "Cuidado com
essa", "Melhor não comprar essa" — porque uma nota de 0 a 100 não diz a ninguém o que fazer. A página
traz ainda um guia de três passos e um glossário dos termos que aparecem.

## Painel de revenda (área interna)

Em `/painel` (ou `#painel` na versão de página única) há uma calculadora de repasse. Ela parte do
**custo real** da passagem — não do preço anunciado — e desconta a taxa do meio de pagamento, que é
o que separa a margem nominal da que sobra de verdade: 15% de margem com 4,99% de maquininha viram
8,1% no bolso. Também resolve o caminho inverso: qual margem cobrar para sobrar um lucro alvo.

As cotações salvas ficam no `localStorage` do navegador — são dados comerciais do operador e não há
motivo para trafegarem. A consequência é que a lista é por dispositivo.

> Revender passagem no Brasil exige estar regularizado como agência ou operar sob uma consolidadora
> credenciada. Bilhete aéreo é nominal e intransferível: comprar no varejo e repassar não funciona.
> O painel calcula margens; a regularização é por sua conta.

## Testes

106 testes cobrindo o motor de risco, o ranking, a validação, a aritmética de horários, o provedor
simulado e o cálculo de repasse — incluindo regressões para os dois casos que a normalização de
preço errava.

```bash
npm test
```
