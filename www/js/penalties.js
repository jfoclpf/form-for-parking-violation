/* eslint camelcase: off */
/* eslint no-unused-vars: off */
/* eslint no-useless-escape: off */
/* eslint prefer-promise-reject-errors: off */
/* eslint no-undef: off */
/* eslint eqeqeq: off */

app.penalties = (function (thisModule) {
  // campos "description" e "law_article" devem ser condicentes gramaticalmente com a mensagem que será gerada
  // exemplo: "a viatura encontrava-se estacionada" + description + ", em violação" + law_article

  var penalties = {
    passeios: {
      select: 'Passeio ou zona pedonal',
      description: 'sobre uma zona exclusivamente pedonal',
      law_article: 'da alínea f) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    na_passadeira: {
      select: 'Na passadeira',
      description: 'numa passadeira, ou seja, numa zona legalmente sinalizada para travessia de peões',
      law_article: 'da alínea d) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    passadeiras5m: {
      select: 'Menos de 5 m. antes de passadeira',
      description: 'a menos de 5 metros antes de uma zona legalmente sinalizada para travessia de peões',
      law_article: 'da alínea d) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    ciclovia: {
      select: 'Sobre ciclovia',
      description: 'sobre uma pista para velocípedes',
      law_article: 'da alínea f) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    travessia_ciclovia: {
      select: 'Menos de 5 m. antes de travessia de ciclovia',
      description: 'a menos de 5 metros antes da travessia de uma pista para velocípedes',
      law_article: 'da alínea d) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    antes_semaforo: {
      select: 'Menos de 20 m. antes de semáforo, se o veículo os encobrir',
      description: 'a menos de 20 metros antes de semáforos, sendo que no presente caso o veículo os encobria',
      law_article: 'da alínea e) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    rotunda: {
      select: 'Placa central de rotunda',
      description: 'sobre uma placa central de rortunda',
      law_article: 'da alínea f) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    deficiente: {
      select: 'Lugar de pessoa com deficiência',
      description: 'num lugar reservado a pessoa com deficiência',
      law_article: 'da alínea q) do n.º 1 do art.º 145.º do Código da Estrada, sendo por conseguinte uma contraordenação grave'
    },
    eletrico: {
      select: 'Lugar de veículo elétrico',
      description: 'num lugar reservado a um veículo automóvel elétrico',
      law_article: 'da alínea g) do n.º 2 do artigo 164.º do Código da Estrada'
    },
    residentes_apenas: {
      select: 'Estacionamento indevido em zona de residentes',
      description: 'num lugar em zona de residentes sem que tenha o correspondente título que a habilita a tal',
      law_article: 'da alínea f) do n.º 1 do artigo 50.º do Código da Estrada'
    },
    abandonado: {
      select: 'Veículo estacionado na rua há mais de um mês',
      description: 'em local da via pública há pelo menos 30 dias ininterruptos',
      law_article: 'da alínea a) do n.º 1 do artigo 163.º do Código da Estrada'
    },
    praca_taxis: {
      select: 'Veículo estacionado em praça de táxis',
      description: 'em local devidamente sinalizado e afeto à paragem de veículos para operações de tomada e largada de passageiros',
      law_article: 'da alínea f) do n.º 1 do artigo 50.º, e alínea h) do n.º 2 do artigo 164.º com referência à alínea c) do artigo 163.º do Código da Estrada'
    },
    cargas_descargas: {
      select: 'Veículo estacionado em local de cargas e descargas',
      description: 'em local devidamente sinalizado e afeto à paragem de veículos para operações de carga e descarga',
      law_article: 'da alínea h) do n.º 2 do artigo 164.º, com referência à alínea c) do artigo 163.º do Código da Estrada'
    },
    paragem_tp: {
      select: 'Veículo estacionado em paragem de transportes públicos',
      description: 'em local de paragem de veículos de transporte coletivo de passageiros',
      law_article: 'da alínea b) do n.º 2 do artigo 164.º, com referência à alínea c) do artigo 163.º do Código da Estrada'
    },
    segunda_fila: {
      select: 'Veículo estacionado em segunda fila',
      description: 'na faixa de rodagem, em segunda fila',
      law_article: 'da alínea j) do n.º 2 do artigo 164.º, com referência à alínea c) do artigo 163.º do Código da Estrada'
    },
    garagem: {
      select: 'Veículo estacionado em zona de acesso a garagem ou propriedade',
      description: 'em local destinado ao acesso de veículos ou peões a propriedades, garagens ou locais de estacionamento',
      law_article: 'da alínea f) do n.º 2 do artigo 164.º, com referência à alínea c) do artigo 163.º do Código da Estrada'
    },
    faixa_bus: {
      select: 'Veículo estacionado em "faixa BUS"',
      description: 'em via ou corredor de circulação reservados a transportes públicos',
      law_article: 'da alínea a) do n.º 2 do artigo 164.º, com referência à alínea c) do artigo 163.º do Código da Estrada'
    },
    meio_estrada: {
      select: 'Veículo estacionado no meio da estrada',
      description: 'na faixa de rodagem, sem ser junto da berma ou passeio',
      law_article: 'da alínea e) do n.º 2 do artigo 164.º, com referência à alínea c) do artigo 163.º do Código da Estrada'
    },
    visbilidade_insuficiente: {
      select: 'Pontes, túneis, passagens de nível, passagens inferiores ou superiores e em todos os lugares de visibilidade insuficiente',
      description: 'junto a pontes, túneis, passagens de nível, passagens inferiores ou superiores e em todos os lugares de visibilidade insuficiente',
      law_article: 'da alínea 1) do artigo 49.º do Código da Estrada'
    }
  }

  function getPenalties () {
    return penalties
  }

  function populatesPenalties () {
    var keys = []
    for (var key in penalties) {
      if (penalties.hasOwnProperty(key)) {
        keys.push(key)
      }
    }

    $('#penalties').append('<option></option>')
    for (var i = 0; i < keys.length; i++) {
      key = keys[i]
      $('#penalties').append('<option>' + penalties[key].select + '</option>')
    }
  }

  /* === Public methods to be returned === */
  thisModule.getPenalties = getPenalties
  thisModule.populatesPenalties = populatesPenalties

  return thisModule
})(app.penalties || {})
