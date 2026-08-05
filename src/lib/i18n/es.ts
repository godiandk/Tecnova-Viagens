import type { Dicionario } from '@/lib/i18n/idiomas';

/**
 * Español.
 *
 * Misma regla que los diccionarios de TECNOVA Digital: la clave es la frase en
 * portugués tal como aparece en pantalla, el valor es la traducción. Lo que
 * falte se queda en portugués — nunca inventamos una traducción.
 */
export const ES: Dicionario = {
  // ---------- veredicto ----------
  'Pode comprar tranquilo': 'Puedes comprar tranquilo',
  'Dá para comprar, mas se programe': 'Se puede comprar, pero organízate',
  'Cuidado com essa': 'Cuidado con esta',
  'Melhor não comprar essa': 'Mejor no comprar esta',
  'Mesmo com mais de um bilhete, as folgas aqui são grandes.':
    'Aun con más de un billete, aquí los márgenes son amplios.',
  'É uma passagem só, com tempo de sobra para tudo. Difícil dar errado.':
    'Es un solo billete, con tiempo de sobra para todo. Difícil que salga mal.',
  'Nada grave, só detalhes para conferir antes de fechar.':
    'Nada grave, solo detalles que revisar antes de cerrar.',
  'Um imprevisto comum já derruba a viagem.':
    'Un contratiempo común basta para arruinar el viaje.',
  'São bilhetes separados e sem folga: se atrasar, o prejuízo é todo seu.':
    'Son billetes separados y sin margen: si algo se retrasa, la pérdida es toda tuya.',
  'A chance de dar errado é alta e você fica no prejuízo.':
    'La probabilidad de que salga mal es alta y tú te quedas con la pérdida.',

  // ---------- controles ----------
  'Explicação técnica': 'Explicación técnica',
  'Ocultar explicação técnica': 'Ocultar explicación técnica',

  // ---------- palabras sueltas dentro de frases ----------
  internacional: 'internacional',
  doméstica: 'nacional',

  // ---------- billetes separados ----------
  'Viagem vendida em {quantidade} bilhetes separados':
    'Viaje vendido en {quantidade} billetes separados',
  'Cada bilhete é um contrato independente. Se o primeiro voo atrasar e você perder o seguinte, nenhuma companhia é obrigada a reacomodar você: o segundo bilhete vira no-show e você recompra do bolso. A bagagem também não segue direto — precisa ser retirada e despachada de novo.':
    'Cada billete es un contrato independiente. Si el primer vuelo se retrasa y pierdes el siguiente, ninguna aerolínea está obligada a reubicarte: el segundo billete queda como no-show y compras otro de tu bolsillo. El equipaje tampoco sigue de largo — hay que recogerlo y facturarlo de nuevo.',
  'São {quantidade} passagens diferentes, não uma passagem só. Se o primeiro avião atrasar e você perder o próximo, a empresa NÃO te coloca em outro voo. Você vai ter que comprar outra passagem com o seu dinheiro. E a sua mala não vai sozinha: você precisa pegar ela na esteira e despachar de novo.':
    'Son {quantidade} billetes distintos, no un solo viaje. Si el primer avión se retrasa y pierdes el siguiente, la empresa NO te pone en otro vuelo. Tendrás que comprar otro billete con tu dinero. Y tu maleta no viaja sola: tienes que recogerla de la cinta y facturarla otra vez.',

  'Margem curta demais entre bilhetes': 'Margen demasiado corto entre billetes',
  'A troca em {aeroporto} tem {espera} de espera, {falta} a menos que o mínimo de {minimo}. Entre bilhetes separados você refaz check-in, despacha bagagem e passa pela segurança outra vez — e ninguém segura o segundo voo por sua causa.':
    'El cambio en {aeroporto} da {espera}, es decir {falta} menos que el mínimo de {minimo}. Entre billetes separados vuelves a facturar, dejas el equipaje otra vez y pasas de nuevo por seguridad — y nadie retiene el segundo vuelo por ti.',
  'Você tem {espera} para descer do avião, pegar a mala, fazer um novo check-in, despachar de novo e passar pela segurança outra vez. É pouco tempo. Se der errado, ninguém segura o segundo avião esperando por você.':
    'Tienes {espera} para bajar del avión, recoger la maleta, facturar de nuevo, dejar el equipaje otra vez y volver a pasar por seguridad. Es poco tiempo. Si sale mal, nadie retiene el segundo avión esperándote.',

  // ---------- conexiones ----------
  'Conexão troca de aeroporto: {chegada} → {partida}':
    'La conexión cambia de aeropuerto: {chegada} → {partida}',
  'Você desembarca em um aeroporto e embarca em outro, por conta própria, com a bagagem. Trânsito da cidade não é problema da companhia: se atrasar, o prejuízo é seu.':
    'Aterrizas en un aeropuerto y sales desde otro, por tu cuenta y con el equipaje. El tráfico de la ciudad no es problema de la aerolínea: si llegas tarde, la pérdida es tuya.',
  'Você desce no aeroporto {chegada} e precisa ir até o aeroporto {partida}, que é outro lugar da cidade. Você vai de carro ou ônibus, pagando do seu bolso, carregando as malas. Se pegar trânsito e você perder o voo, o prejuízo é seu.':
    'Bajas en el aeropuerto {chegada} y tienes que ir hasta el aeropuerto {partida}, que está en otra parte de la ciudad. Vas en coche o autobús, pagando de tu bolsillo y cargando las maletas. Si pillas tráfico y pierdes el vuelo, la pérdida es tuya.',

  'Conexão de {espera} em {aeroporto}': 'Conexión de {espera} en {aeroporto}',
  'São {falta} a menos que o mínimo de {minimo} para uma conexão {tipo} aqui. Qualquer atraso pequeno na primeira perna já derruba a segunda.':
    'Son {falta} menos que el mínimo de {minimo} para una conexión {tipo} aquí. Cualquier retraso pequeño en el primer tramo ya tumba el segundo.',
  'Você tem só {espera} para trocar de avião em {aeroporto}. Isso é pouco demais. Se o primeiro voo atrasar um pouquinho, você perde o segundo.':
    'Solo tienes {espera} para cambiar de avión en {aeroporto}. Es demasiado poco. Si el primer vuelo se retrasa un poquito, pierdes el segundo.',

  'Conexão justa de {espera} em {aeroporto}': 'Conexión justa de {espera} en {aeroporto}',
  'Passa do mínimo de {minimo}, mas sem folga. Funciona se tudo sair no horário — e é a companhia que reacomoda se não sair.':
    'Supera el mínimo de {minimo}, pero sin margen. Funciona si todo sale a su hora — y es la aerolínea la que te reubica si no sale.',
  'Você tem {espera} para trocar de avião em {aeroporto}. Dá, mas é apertado. A boa notícia: como é tudo uma passagem só, se você perder por causa de atraso, a empresa é obrigada a te colocar em outro voo sem cobrar nada.':
    'Tienes {espera} para cambiar de avión en {aeroporto}. Se puede, pero es justo. La buena noticia: como es todo un solo billete, si lo pierdes por un retraso, la empresa está obligada a ponerte en otro vuelo sin cobrarte nada.',

  'Espera de {espera} em {aeroporto}': 'Espera de {espera} en {aeroporto}',
  'Parada longa o bastante para exigir hotel ou uma noite no aeroporto. Conte esse custo e esse desgaste antes de comparar só o preço.':
    'Una parada lo bastante larga como para exigir hotel o una noche en el aeropuerto. Cuenta ese coste y ese desgaste antes de comparar solo el precio.',
  'Você vai ficar {espera} parado em {aeroporto} esperando o próximo avião. É tempo de precisar de um hotel ou dormir no aeroporto. Isso cansa e custa dinheiro.':
    'Vas a pasar {espera} parado en {aeroporto} esperando el próximo avión. Es tiempo suficiente para necesitar un hotel o dormir en el aeropuerto. Eso cansa y cuesta dinero.',
  'Conexão folgada: seguro contra atrasos, mas cansativo.':
    'Conexión holgada: segura frente a retrasos, pero cansada.',
  'Você vai esperar {espera} em {aeroporto} até o próximo avião. É bastante tempo parado, mas pelo menos você não corre risco de perder o voo.':
    'Vas a esperar {espera} en {aeroporto} hasta el próximo avión. Es bastante tiempo parado, pero al menos no corres riesgo de perder el vuelo.',

  'Conexão embarca às {hora} em {aeroporto}': 'La conexión embarca a las {hora} en {aeroporto}',
  'Sendo um dos últimos voos do dia, perder essa conexão normalmente significa dormir na cidade e seguir só no dia seguinte.':
    'Al ser uno de los últimos vuelos del día, perder esta conexión suele significar dormir en la ciudad y seguir solo al día siguiente.',
  'O segundo avião sai às {hora}, já de noite. Costuma ser um dos últimos voos do dia. Se você perder, provavelmente vai ter que dormir nessa cidade e viajar só no dia seguinte.':
    'El segundo avión sale a las {hora}, ya de noche. Suele ser uno de los últimos vuelos del día. Si lo pierdes, seguramente tendrás que dormir en esa ciudad y viajar solo al día siguiente.',

  // ---------- visado de tránsito ----------
  '{detalhe} Confirme na fonte oficial: {fonte}':
    '{detalhe} Confírmalo en la fuente oficial: {fonte}',

  // ---------- escalas ----------
  '1 parada no caminho': '1 escala en el camino',
  '{quantidade} paradas no caminho': '{quantidade} escalas en el camino',
  'Cada troca de avião é uma chance a mais de algo dar errado: atraso, bagagem extraviada, portão trocado. Voo direto é sempre o mais seguro.':
    'Cada cambio de avión es una oportunidad más de que algo salga mal: retraso, equipaje extraviado, puerta cambiada. El vuelo directo siempre es el más seguro.',
  'Esta viagem não é direta: você troca de avião 1 vez. Cada troca é uma chance a mais de atrasar ou da mala se perder. Voo direto é sempre o mais tranquilo.':
    'Este viaje no es directo: cambias de avión 1 vez. Cada cambio es una oportunidad más de retraso o de perder la maleta. El vuelo directo siempre es el más tranquilo.',
  'Esta viagem não é direta: você troca de avião {quantidade} vezes. Cada troca é uma chance a mais de atrasar ou da mala se perder. Voo direto é sempre o mais tranquilo.':
    'Este viaje no es directo: cambias de avión {quantidade} veces. Cada cambio es una oportunidad más de retraso o de perder la maleta. El vuelo directo siempre es el más tranquilo.',

  // ---------- horarios ----------
  'Chegada às {hora}': 'Llega a las {hora}',
  'Transporte público costuma não operar nesse horário e a corrida por aplicativo sai mais cara. Some isso ao preço da passagem.':
    'El transporte público no suele operar a esa hora y el viaje por aplicación sale más caro. Súmalo al precio del billete.',
  'Seu avião chega às {hora} da madrugada. Nesse horário quase não tem ônibus nem metrô, e o carro de aplicativo fica bem mais caro. Pense em como você vai do aeroporto até onde vai ficar.':
    'Tu avión llega a las {hora} de la madrugada. A esa hora casi no hay autobuses ni metro, y el coche por aplicación sale bastante más caro. Piensa cómo irás del aeropuerto hasta donde te alojas.',

  'Embarque às {hora}': 'Embarque a las {hora}',
  'Você precisa estar no aeroporto de madrugada, o que geralmente significa sair de casa na noite anterior ou pagar transporte caro.':
    'Tienes que estar en el aeropuerto de madrugada, lo que normalmente significa salir de casa la noche anterior o pagar un transporte caro.',
  'Seu avião sai às {hora} da madrugada. Você precisa chegar no aeroporto antes disso, de madrugada. Muita gente acaba tendo que sair de casa na noite anterior ou pagar caro no transporte.':
    'Tu avión sale a las {hora} de la madrugada. Tienes que llegar al aeropuerto antes de esa hora, de noche. Mucha gente acaba saliendo de casa la noche anterior o pagando caro el transporte.',

  // ---------- condiciones de la tarifa ----------
  'Tarifa sem direito a remarcação': 'Tarifa sin derecho a cambios',
  'Mudar data é impossível ou custa quase uma passagem nova. Se sua data não está 100% fechada, a tarifa mais barata pode sair mais cara.':
    'Cambiar la fecha es imposible o cuesta casi un billete nuevo. Si tu fecha no está totalmente cerrada, la tarifa más barata puede salir más cara.',
  'Se você precisar mudar a data da viagem, não dá — ou vai custar quase o preço de uma passagem nova. Só compre esta se a sua data já estiver certa.':
    'Si necesitas cambiar la fecha del viaje, no se puede — o costará casi el precio de un billete nuevo. Compra esta solo si tu fecha ya es segura.',

  'Tarifa não reembolsável': 'Tarifa no reembolsable',
  'Desistindo da viagem, você não recebe o valor de volta (só taxas, em alguns casos).':
    'Si cancelas el viaje, no recuperas el importe (solo las tasas, en algunos casos).',
  'Se você desistir da viagem, o dinheiro não volta. Você perde o valor que pagou.':
    'Si desistes del viaje, el dinero no vuelve. Pierdes lo que pagaste.',

  'Bagagem despachada não inclusa': 'Equipaje facturado no incluido',
  'O preço anunciado cobre só a bagagem de mão. Se você vai despachar, o custo real é maior — já embutimos uma estimativa no total abaixo.':
    'El precio anunciado cubre solo el equipaje de mano. Si vas a facturar, el coste real es mayor — ya incluimos una estimación en el total de abajo.',
  'O preço que aparece é só com a mala pequena, aquela que vai com você dentro do avião. A mala grande, que vai no bagageiro, você paga separado. Veja quanto custa logo abaixo.':
    'El precio que aparece es solo con la maleta pequeña, la que va contigo dentro del avión. La maleta grande, la que va en la bodega, la pagas aparte. Mira cuánto cuesta justo abajo.',

  // ---------- aerolínea ----------
  '{companhia} tem histórico de pontualidade abaixo da média':
    '{companhia} tiene un historial de puntualidad por debajo de la media',
  'Cerca de {pontuais}% dos voos partem no horário. Com conexão apertada, isso pesa mais do que o desconto na passagem.':
    'Cerca del {pontuais}% de los vuelos salen a su hora. Con una conexión justa, eso pesa más que el descuento del billete.',
  'A {companhia} atrasa mais que as outras: cerca de {atrasados} de cada 100 voos não saem na hora. Se a sua conexão for apertada, isso aumenta a chance de você perder o voo seguinte.':
    '{companhia} se retrasa más que las demás: cerca de {atrasados} de cada 100 vuelos no salen a su hora. Si tu conexión es justa, eso aumenta la probabilidad de que pierdas el vuelo siguiente.',

  // ---------- precio ----------
  'Preço muito abaixo dos demais': 'Precio muy por debajo del resto',
  'Bem mais barato que a mediana desta busca. Costuma haver um motivo: bagagem à parte, horário ruim, conexão longa ou tarifa sem nenhuma flexibilidade. Leia as condições antes de fechar.':
    'Bastante más barato que la mediana de esta búsqueda. Suele haber un motivo: equipaje aparte, mal horario, conexión larga o tarifa sin ninguna flexibilidad. Lee las condiciones antes de cerrar.',
  'Esta passagem está bem mais barata que todas as outras desta busca. Quando isso acontece, quase sempre tem um porquê escondido: mala cobrada à parte, horário ruim, espera enorme ou regra que não deixa mudar nada. Leia com atenção antes de comprar.':
    'Este billete está bastante más barato que todos los demás de esta búsqueda. Cuando eso pasa, casi siempre hay un motivo escondido: maleta cobrada aparte, mal horario, espera enorme o una regla que no te deja cambiar nada. Léelo con atención antes de comprar.',
  'Tem um ponto a observar: {problema}.': 'Hay un punto que observar: {problema}.',
  'Um imprevisto comum já derruba a viagem: {problema}.':
    'Un contratiempo común basta para arruinar el viaje: {problema}.',
};
