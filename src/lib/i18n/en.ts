import type { Dicionario } from '@/lib/i18n/idiomas';

/**
 * English.
 *
 * Same rule as the TECNOVA Digital dictionaries: the key is the Portuguese
 * sentence exactly as it appears on screen, the value is the translation.
 * Anything missing stays in Portuguese — we never invent a translation.
 *
 * Markers like {espera} keep their names: the code fills them in after the
 * lookup, so word order can change freely between languages.
 */
export const EN: Dicionario = {
  // ---------- veredito ----------
  'Pode comprar tranquilo': 'Safe to book',
  'Dá para comprar, mas se programe': 'You can book it, but plan ahead',
  'Cuidado com essa': 'Be careful with this one',
  'Melhor não comprar essa': 'Better not to book this one',
  'Mesmo com mais de um bilhete, as folgas aqui são grandes.':
    'Even with more than one ticket, the buffers here are generous.',
  'É uma passagem só, com tempo de sobra para tudo. Difícil dar errado.':
    'It is a single ticket, with plenty of time for everything. Hard to go wrong.',
  'Nada grave, só detalhes para conferir antes de fechar.':
    'Nothing serious, just details to check before booking.',
  'Um imprevisto comum já derruba a viagem.':
    'One common hiccup is enough to break this trip.',
  'São bilhetes separados e sem folga: se atrasar, o prejuízo é todo seu.':
    'These are separate tickets with no buffer: if anything is late, the loss is entirely yours.',
  'A chance de dar errado é alta e você fica no prejuízo.':
    'The odds of something going wrong are high, and you carry the loss.',

  // ---------- controles ----------
  'Explicação técnica': 'Technical explanation',
  'Ocultar explicação técnica': 'Hide technical explanation',

  // ---------- palavras soltas usadas dentro de frases ----------
  internacional: 'international',
  doméstica: 'domestic',

  // ---------- bilhetes separados ----------
  'Viagem vendida em {quantidade} bilhetes separados':
    'Trip sold as {quantidade} separate tickets',
  'Cada bilhete é um contrato independente. Se o primeiro voo atrasar e você perder o seguinte, nenhuma companhia é obrigada a reacomodar você: o segundo bilhete vira no-show e você recompra do bolso. A bagagem também não segue direto — precisa ser retirada e despachada de novo.':
    'Each ticket is an independent contract. If the first flight is delayed and you miss the next one, no airline is required to rebook you: the second ticket becomes a no-show and you buy a new one out of pocket. Your bags do not through-check either — you must collect and re-check them.',
  'São {quantidade} passagens diferentes, não uma passagem só. Se o primeiro avião atrasar e você perder o próximo, a empresa NÃO te coloca em outro voo. Você vai ter que comprar outra passagem com o seu dinheiro. E a sua mala não vai sozinha: você precisa pegar ela na esteira e despachar de novo.':
    'These are {quantidade} different tickets, not one trip. If the first plane is late and you miss the next one, the airline will NOT put you on another flight. You will have to buy another ticket with your own money. And your bag does not travel on its own: you have to pick it up from the belt and check it in again.',

  'Margem curta demais entre bilhetes': 'Too little margin between tickets',
  'A troca em {aeroporto} tem {espera} de espera, {falta} a menos que o mínimo de {minimo}. Entre bilhetes separados você refaz check-in, despacha bagagem e passa pela segurança outra vez — e ninguém segura o segundo voo por sua causa.':
    'The change at {aeroporto} allows {espera}, which is {falta} short of the {minimo} minimum. Between separate tickets you check in again, drop your bags again and clear security again — and nobody holds the second flight for you.',
  'Você tem {espera} para descer do avião, pegar a mala, fazer um novo check-in, despachar de novo e passar pela segurança outra vez. É pouco tempo. Se der errado, ninguém segura o segundo avião esperando por você.':
    'You have {espera} to get off the plane, collect your bag, check in again, drop the bag again and clear security again. That is not much time. If it goes wrong, nobody holds the second plane waiting for you.',

  // ---------- conexões ----------
  'Conexão troca de aeroporto: {chegada} → {partida}':
    'Connection changes airports: {chegada} → {partida}',
  'Você desembarca em um aeroporto e embarca em outro, por conta própria, com a bagagem. Trânsito da cidade não é problema da companhia: se atrasar, o prejuízo é seu.':
    'You land at one airport and depart from another, on your own, carrying your luggage. City traffic is not the airline problem: if you are late, the loss is yours.',
  'Você desce no aeroporto {chegada} e precisa ir até o aeroporto {partida}, que é outro lugar da cidade. Você vai de carro ou ônibus, pagando do seu bolso, carregando as malas. Se pegar trânsito e você perder o voo, o prejuízo é seu.':
    'You land at {chegada} and have to travel to {partida}, which is somewhere else in the city. You go by car or bus, paying out of pocket, carrying your bags. If you hit traffic and miss the flight, the loss is yours.',

  'Conexão de {espera} em {aeroporto}': '{espera} connection at {aeroporto}',
  'São {falta} a menos que o mínimo de {minimo} para uma conexão {tipo} aqui. Qualquer atraso pequeno na primeira perna já derruba a segunda.':
    'That is {falta} short of the {minimo} minimum for a {tipo} connection here. Any small delay on the first leg already breaks the second.',
  'Você tem só {espera} para trocar de avião em {aeroporto}. Isso é pouco demais. Se o primeiro voo atrasar um pouquinho, você perde o segundo.':
    'You only have {espera} to change planes at {aeroporto}. That is far too little. If the first flight is even slightly late, you miss the second.',

  'Conexão justa de {espera} em {aeroporto}': 'Tight {espera} connection at {aeroporto}',
  'Passa do mínimo de {minimo}, mas sem folga. Funciona se tudo sair no horário — e é a companhia que reacomoda se não sair.':
    'It clears the {minimo} minimum, but with no slack. It works if everything runs on time — and the airline rebooks you if it does not.',
  'Você tem {espera} para trocar de avião em {aeroporto}. Dá, mas é apertado. A boa notícia: como é tudo uma passagem só, se você perder por causa de atraso, a empresa é obrigada a te colocar em outro voo sem cobrar nada.':
    'You have {espera} to change planes at {aeroporto}. It is doable, but tight. The good news: since it is all one ticket, if you miss it because of a delay, the airline must put you on another flight at no charge.',

  'Espera de {espera} em {aeroporto}': '{espera} layover at {aeroporto}',
  'Parada longa o bastante para exigir hotel ou uma noite no aeroporto. Conte esse custo e esse desgaste antes de comparar só o preço.':
    'A stop long enough to require a hotel or a night at the airport. Count that cost and that wear before comparing on price alone.',
  'Você vai ficar {espera} parado em {aeroporto} esperando o próximo avião. É tempo de precisar de um hotel ou dormir no aeroporto. Isso cansa e custa dinheiro.':
    'You will spend {espera} stuck at {aeroporto} waiting for the next plane. That is long enough to need a hotel or sleep at the airport. It is tiring and it costs money.',
  'Conexão folgada: seguro contra atrasos, mas cansativo.':
    'Generous connection: safe against delays, but tiring.',
  'Você vai esperar {espera} em {aeroporto} até o próximo avião. É bastante tempo parado, mas pelo menos você não corre risco de perder o voo.':
    'You will wait {espera} at {aeroporto} for the next plane. That is a lot of waiting, but at least you are in no danger of missing the flight.',

  'Conexão embarca às {hora} em {aeroporto}': 'Connection boards at {hora} in {aeroporto}',
  'Sendo um dos últimos voos do dia, perder essa conexão normalmente significa dormir na cidade e seguir só no dia seguinte.':
    'As one of the last flights of the day, missing this connection usually means sleeping in the city and continuing only the next day.',
  'O segundo avião sai às {hora}, já de noite. Costuma ser um dos últimos voos do dia. Se você perder, provavelmente vai ter que dormir nessa cidade e viajar só no dia seguinte.':
    'The second plane leaves at {hora}, at night. It is usually one of the last flights of the day. If you miss it, you will probably have to sleep in that city and travel only the next day.',

  // ---------- visto de trânsito ----------
  '{detalhe} Confirme na fonte oficial: {fonte}':
    '{detalhe} Confirm with the official source: {fonte}',

  // ---------- paradas ----------
  '1 parada no caminho': '1 stop along the way',
  '{quantidade} paradas no caminho': '{quantidade} stops along the way',
  'Cada troca de avião é uma chance a mais de algo dar errado: atraso, bagagem extraviada, portão trocado. Voo direto é sempre o mais seguro.':
    'Every plane change is one more chance for something to go wrong: a delay, lost luggage, a changed gate. A direct flight is always the safest.',
  'Esta viagem não é direta: você troca de avião 1 vez. Cada troca é uma chance a mais de atrasar ou da mala se perder. Voo direto é sempre o mais tranquilo.':
    'This trip is not direct: you change planes once. Every change is one more chance of a delay or a lost bag. A direct flight is always the calmest.',
  'Esta viagem não é direta: você troca de avião {quantidade} vezes. Cada troca é uma chance a mais de atrasar ou da mala se perder. Voo direto é sempre o mais tranquilo.':
    'This trip is not direct: you change planes {quantidade} times. Every change is one more chance of a delay or a lost bag. A direct flight is always the calmest.',

  // ---------- horários ----------
  'Chegada às {hora}': 'Arrives at {hora}',
  'Transporte público costuma não operar nesse horário e a corrida por aplicativo sai mais cara. Some isso ao preço da passagem.':
    'Public transport usually does not run at that hour and a ride-hailing trip costs more. Add that to the ticket price.',
  'Seu avião chega às {hora} da madrugada. Nesse horário quase não tem ônibus nem metrô, e o carro de aplicativo fica bem mais caro. Pense em como você vai do aeroporto até onde vai ficar.':
    'Your plane lands at {hora} in the early morning. At that hour there is barely any bus or metro service, and a ride-hailing car is much more expensive. Think about how you will get from the airport to where you are staying.',

  'Embarque às {hora}': 'Departs at {hora}',
  'Você precisa estar no aeroporto de madrugada, o que geralmente significa sair de casa na noite anterior ou pagar transporte caro.':
    'You need to be at the airport in the early hours, which usually means leaving home the night before or paying for expensive transport.',
  'Seu avião sai às {hora} da madrugada. Você precisa chegar no aeroporto antes disso, de madrugada. Muita gente acaba tendo que sair de casa na noite anterior ou pagar caro no transporte.':
    'Your plane leaves at {hora} in the early morning. You have to reach the airport before that, in the middle of the night. Many people end up leaving home the evening before or paying a lot for transport.',

  // ---------- condições da tarifa ----------
  'Tarifa sem direito a remarcação': 'Fare with no changes allowed',
  'Mudar data é impossível ou custa quase uma passagem nova. Se sua data não está 100% fechada, a tarifa mais barata pode sair mais cara.':
    'Changing the date is impossible or costs nearly a new ticket. If your date is not fully settled, the cheapest fare can end up costing more.',
  'Se você precisar mudar a data da viagem, não dá — ou vai custar quase o preço de uma passagem nova. Só compre esta se a sua data já estiver certa.':
    'If you need to change your travel date, you cannot — or it will cost almost the price of a new ticket. Only buy this one if your date is already certain.',

  'Tarifa não reembolsável': 'Non-refundable fare',
  'Desistindo da viagem, você não recebe o valor de volta (só taxas, em alguns casos).':
    'If you cancel the trip you do not get your money back (only taxes, in some cases).',
  'Se você desistir da viagem, o dinheiro não volta. Você perde o valor que pagou.':
    'If you give up on the trip, the money does not come back. You lose what you paid.',

  'Bagagem despachada não inclusa': 'Checked baggage not included',
  'O preço anunciado cobre só a bagagem de mão. Se você vai despachar, o custo real é maior — já embutimos uma estimativa no total abaixo.':
    'The advertised price only covers carry-on baggage. If you are going to check a bag, the real cost is higher — we already include an estimate in the total below.',
  'O preço que aparece é só com a mala pequena, aquela que vai com você dentro do avião. A mala grande, que vai no bagageiro, você paga separado. Veja quanto custa logo abaixo.':
    'The price you see only includes the small bag, the one that goes with you inside the plane. The big bag, the one that goes in the hold, you pay for separately. See how much it costs just below.',

  // ---------- companhia ----------
  '{companhia} tem histórico de pontualidade abaixo da média':
    '{companhia} has a below-average punctuality record',
  'Cerca de {pontuais}% dos voos partem no horário. Com conexão apertada, isso pesa mais do que o desconto na passagem.':
    'About {pontuais}% of flights leave on time. With a tight connection, that matters more than the discount on the ticket.',
  'A {companhia} atrasa mais que as outras: cerca de {atrasados} de cada 100 voos não saem na hora. Se a sua conexão for apertada, isso aumenta a chance de você perder o voo seguinte.':
    '{companhia} runs late more often than the others: about {atrasados} out of every 100 flights do not leave on time. If your connection is tight, that raises the odds of missing your next flight.',

  // ---------- preço ----------
  'Preço muito abaixo dos demais': 'Price far below the rest',
  'Bem mais barato que a mediana desta busca. Costuma haver um motivo: bagagem à parte, horário ruim, conexão longa ou tarifa sem nenhuma flexibilidade. Leia as condições antes de fechar.':
    'Much cheaper than the median of this search. There is usually a reason: baggage charged separately, an awkward time, a long connection, or a fare with no flexibility at all. Read the conditions before booking.',
  'Esta passagem está bem mais barata que todas as outras desta busca. Quando isso acontece, quase sempre tem um porquê escondido: mala cobrada à parte, horário ruim, espera enorme ou regra que não deixa mudar nada. Leia com atenção antes de comprar.':
    'This ticket is much cheaper than all the others in this search. When that happens there is almost always a hidden reason: baggage charged separately, an awkward time, a huge layover, or a rule that lets you change nothing. Read carefully before buying.',
  'Tem um ponto a observar: {problema}.': 'One thing to watch: {problema}.',
  'Um imprevisto comum já derruba a viagem: {problema}.':
    'One common hiccup is enough to break this trip: {problema}.',
};
