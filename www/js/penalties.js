/* eslint camelcase: off */

/* global app, $ */

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
      law_article: 'da alínea f) do n.º 1 do art.º 50.º, com referência ainda à alínea q) do n.º 1 do art.º 145.º do Código da Estrada, sendo por conseguinte uma contraordenação grave'
    },
    eletrico: {
      select: 'Lugar de veículo elétrico',
      description: 'num lugar reservado a um veículo automóvel elétrico',
      law_article: 'da alínea f) do n.º 1 do art.º 50.º, com referência ainda à alínea g) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    motociclo: {
      select: 'Lugar para motociclos',
      description: 'num lugar reservado exclusivamente para motociclos',
      law_article: 'da alínea f) do n.º 1 do art.º 50.º, com referência ainda à alínea g) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    bicicletas: {
      select: 'Lugar para bicicletas',
      description: 'num lugar reservado exclusivamente para velocípedes',
      law_article: 'da alínea f) do n.º 1 do art.º 50.º, com referência ainda à alínea g) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    carro_partilhado: {
      select: 'Lugar para carros partilhados',
      description: 'num lugar reservado exclusivamente para carros partilhados',
      law_article: 'da alínea f) do n.º 1 do art.º 50.º, com referência ainda à alínea g) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    carro_especifico: {
      select: 'Lugar reservado a veículos específicos (ex: EDP, PT, Pároco, serviço de hotel, etc.)',
      description: 'num lugar reservado ao estacionamento exclusivo de determinados veículos',
      law_article: 'da alínea f) do n.º 1 do art.º 50.º, com referência ainda à alínea g) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    linha_amarela_ou_contínua: {
      select: 'Sobre linha amarela ou contínua na berma da estrada',
      description: 'sobre linha contínua junto ao limite da faixa de rodagem',
      law_article: 'do sinal M12 cujo significado está plasmado no n.º 1 do art.º 62.º do Regulamento de Sinalização do Trânsito'
    },
    residentes_apenas: {
      select: 'Estacionamento indevido em zona de residentes',
      description: 'num lugar em zona de residentes sem que tenha o correspondente título que a habilita a tal',
      law_article: 'da alínea f) do n.º 1 do art.º 50.º do Código da Estrada'
    },
    abandonado: {
      select: 'Na rua há mais de um mês',
      description: 'em local da via pública há pelo menos 30 dias ininterruptos',
      law_article: 'da alínea h) do n.º 1 do art.º 50.º, com referência à alínea a) do n.º 1 do art.º 163.º do Código da Estrada'
    },
    praca_taxis: {
      select: 'Em praça de táxis',
      description: 'em local devidamente sinalizado e afeto à paragem de veículos para operações de tomada e largada de passageiros',
      law_article: 'da alínea f) do n.º 1 do art.º 50.º, e alínea h) do n.º 2 do art.º 164.º com referência à alínea c) do artigo 163.º do Código da Estrada'
    },
    cargas_descargas: {
      select: 'Cargas e descargas',
      description: 'em local devidamente sinalizado e afeto à paragem de veículos para operações de carga e descarga',
      law_article: 'da alínea f) do n.º 1 do art.º 50.º, com referência ainda à alínea h) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    paragem_tp: {
      select: 'Em paragem de transportes públicos',
      description: 'em local de paragem de veículos de transporte coletivo de passageiros',
      law_article: 'da alínea c) do n.º 1 do art.º 49.º, com referência ainda à alínea b) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    segunda_fila: {
      select: 'Em segunda fila',
      description: 'na faixa de rodagem, em segunda fila',
      law_article: 'da alínea b) do n.º 1 do art.º 50.º, com referência ainda à alínea j) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    garagem: {
      select: 'Em zona de acesso a garagem ou propriedade',
      description: 'em local destinado ao acesso de veículos ou peões a propriedades, garagens ou locais de estacionamento',
      law_article: 'da alínea c) do n.º 1 do art.º 50.º, com referência ainda à alínea f) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    faixa_bus: {
      select: 'Na "faixa BUS"',
      description: 'em via ou corredor de circulação reservados a transportes públicos',
      law_article: 'da alínea g) do n.º 1 do art. 49.º, com referência à alínea a) do n.º 2 do art.º 164.º do Código da Estrada'
    },
    faixa_de_rodagem: {
      select: 'Na faixa de rodagem (nas localidades)',
      description: 'na faixa de rodagem a uma distância inferior a 3 metros entre a linha longitudinal e o veículo',
      law_article: 'da alínea g) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    visbilidade_insuficiente: {
      select: 'Pontes, túneis, passagens de nível, passagens inferiores ou superiores e em todos os lugares de visibilidade insuficiente',
      description: 'junto a uma ponte, túnel, passagem de nível, passagem inferior ou superior, ou num lugar de visibilidade insuficiente',
      law_article: 'da alínea a) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    cruzamento: {
      select: 'A menos de 5 m. de cruzamentos, entroncamentos ou rotundas (nas localidades)',
      description: 'a menos de 5 metros de um cruzamento, entroncamento ou rotunda',
      law_article: 'da alínea b) do n.º 1 do art.º 49.º do Código da Estrada'
    },
    publicidade: {
      select: 'Venda de artigos ou publicidade em zona de estacionamento',
      description: 'num parque ou zona de estacionamento, vendendo artigos ou fazendo publicidade',
      law_article: 'da alínea a) do n.º 1 do art.º 71.º do Código da Estrada'
    },
    pesados_estacionamento: {
      select: 'Transporte público pesado em zona de estacionamento',
      description: 'num parque ou zona de estacionamento, sendo um automóvel pesado utilizado em transporte público',
      law_article: 'da alínea b) do n.º 1 do art.º 71.º do Código da Estrada'
    },
    veiculo_inapropriado_em_parque: {
      select: 'Veículo inapropriado para estacionar em parque ou zona de estacionamento',
      description: 'num parque ou zona de estacionamento, sendo o veículo de categoria diferente daquela a que o parque, zona ou lugar de estacionamento está exclusivamente afeto',
      law_article: 'da alínea c) do n.º 1 do art.º 71.º do Código da Estrada'
    },
    tempo_excedido_em_parque: {
      select: 'Tempo excedido ou não pagamento de taxa, em parque ou zona de estacionamento',
      description: 'num parque ou zona de estacionamento, sendo que o veículo estacionou por tempo superior ao estabelecido ou sem o pagamento da respetiva taxa',
      law_article: 'da alínea d) do n.º 1 do art.º 71.º do Código da Estrada'
    },
    nao_encostado_direita_localidades: {
      select: 'Não encostou à direita ou não está paralelo ao sentido da marcha (nas localidades)',
      description: 'sem estar o mais próximo possível do respetivo limite direito, ou sem estar paralelo a este e no sentido da marcha',
      law_article: 'do n.º 4 do art.º 48.º do Código da Estrada'
    },
    falta_de_espaço: {
      select: 'Não deixou espaço suficiente para outros veículos',
      description: 'sem deixar os intervalos indispensáveis à saída de outros veículos',
      law_article: 'do n.º 5 do art.º 48.º do Código da Estrada'
    },
    faixa_rodagem_fora_localidades: {
      select: 'Na faixa de rodagem, sendo possível estacionar fora da faixa de rodagem (fora das localidades)',
      description: 'na faixa de rodagem, sendo possível estacionar fora da faixa de rodagem',
      law_article: 'do n.º 3 do art.º 48.º do Código da Estrada'
    },
    faixa_de_rodagem2: {
      select: 'Simplesmente na faixa de rodagem (fora das localidades)',
      description: 'na faixa de rodagem',
      law_article: 'da alínea b) do n.º 2 do art.º 49.º do Código da Estrada'
    },
    nao_encostado_direita_fora_localidades: {
      select: 'Não encostou à direita ou não está paralelo ao sentido da marcha (fora das localidades)',
      description: 'sem estar o mais próximo possível do respetivo limite direito, ou sem estar paralelo a este e no sentido da marcha',
      law_article: 'do n.º 3 do art.º 48.º do Código da Estrada'
    },
    cruzamento2: {
      select: 'A menos de 50 m. de cruzamentos, entroncamentos, rotundas, curvas ou lombas (fora das localidades)',
      description: 'a menos de 50 metros de um cruzamento, entroncamento, rotunda, curva ou lomba de visibilidade reduzida',
      law_article: 'da alínea a) do n.º 2 do art.º 49.º do Código da Estrada'
    }
  }

  function getPenalties () {
    return penalties
  }

  function populatesPenalties () {
    var keys = []
    for (var key in penalties) {
      if (Object.prototype.hasOwnProperty.call(penalties, key)) {
        keys.push(key)
      }
    }

    $('#penalties').append('<option></option>')
    for (var i = 0; i < keys.length; i++) {
      key = keys[i]
      $('#penalties').append(`<option value="${key}">${penalties[key].select}</option>`)
    }
  }

  function getSelectedPenaltyCode () {
    return $('#penalties').val()
  }

  function getShortDescription (code) {
    for (const key in penalties) {
      if (key === code) {
        return penalties[key].select
      }
    }
  }

  function getDescription (code) {
    for (const key in penalties) {
      if (key === code) {
        return penalties[key].description
      }
    }
  }

  function getLawArticle (code) {
    for (const key in penalties) {
      if (key === code) {
        return penalties[key].law_article
      }
    }
  }

  /* === Public methods to be returned === */
  thisModule.getPenalties = getPenalties
  thisModule.populatesPenalties = populatesPenalties
  thisModule.getSelectedPenaltyCode = getSelectedPenaltyCode
  thisModule.getShortDescription = getShortDescription
  thisModule.getDescription = getDescription
  thisModule.getLawArticle = getLawArticle

  return thisModule
})(app.penalties || {})
