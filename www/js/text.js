/* eslint camelcase: off */

/* global app, $, DEBUG */

app.text = (function (thisModule) {
  // main message
  function getMainMessage () {
    // Authority
    var authority, authorityName, key

    // app.localization.AUTHORITIES is an array of possible authorities applicable for that area
    for (key in app.localization.AUTHORITIES) {
      if (!Object.prototype.hasOwnProperty.call(app.localization.AUTHORITIES, key)) continue

      if ($('#authority').val() === key) {
        authority = app.localization.AUTHORITIES[key].authority
        /* authorityShort = app.localization.AUTHORITIES[key].authorityShort */
        authorityName = app.localization.AUTHORITIES[key].nome
        app.main.emailTo = app.localization.AUTHORITIES[key].contacto
      }
    }

    // Penalties
    var penaltyDescription
    var penaltyLawArticle
    var penalties = app.penalties.getPenalties()

    for (key in penalties) {
      if (!Object.prototype.hasOwnProperty.call(penalties, key)) continue

      var obj = penalties[key]
      if ($('#penalties').val() === key) {
        penaltyDescription = obj.description
        penaltyLawArticle = obj.law_article
      }
    }

    var carPlateStr = app.functions.getCarPlate()

    // texto para marca e modelo
    var is_carmake = ($('#carmake').val().replace(/^\s+|\s+$/g, '').length !== 0)
    var is_model = ($('#carmodel').val().replace(/^\s+|\s+$/g, '').length !== 0)
    var carmake_model_txt
    if (is_carmake && is_model) {
      carmake_model_txt = 'de marca e modelo <b>' + $('#carmake').val() +
        ' ' + $('#carmodel').val() + '</b>, '
    } else if (is_carmake) {
      carmake_model_txt = 'de marca <b>' + $('#carmake').val() + '</b>, '
    } else if (is_model) {
      carmake_model_txt = 'de modelo <b>' + $('#carmodel').val() + '</b>, '
    } else {
      carmake_model_txt = ''
    }

    var msg = getRandomGreetings() + // get initial random greeting
      ' ' + 'da' + ' ' + authority + ', ' + authorityName + ';'

    var msg1 = 'Eu, <b>' + $('#name').val() + '</b>,' +
      ' com o <b>' + $('#id_type').val() + '</b> com o número <b>' + $('#id_number').val() + '</b> ' +
      'e com residência em <b>' + $('#address').val() +
      ', ' + $('#postal_code').val() + ', ' + $('#address_city').val() +
      '</b>, venho por este meio,' + ' ' +
      'ao abrigo do n.º 5 do artigo 170.º do Código da Estrada, ' +
      'fazer a seguinte denúncia de contra-ordenação para que a ' +
      authority + ' ' + 'levante o auto respetivo e multe o infra-mencionado responsável.'

    var msg2 = 'No passado dia <b>' +
      $.datepicker.formatDate("dd' de 'MM' de 'yy", $('#date').datepicker('getDate')) + '</b>' +
      ($('#time').val() ? ' pelas <b>' + $('#time').val() + '</b>' : '') + // optional
      ', ' + 'na <b>' + $('#street').val() + ', ' + $('#locality').val() + '</b>, ' +
      ($('#street_number').val() ? 'aproximadamente junto à porta com o <b>número ' +
      $('#street_number').val() + '</b>, ' : '') + // optional
      'a viatura com matrícula <b>' + carPlateStr + '</b> ' + carmake_model_txt +
      'encontrava-se estacionada' + ' ' + penaltyDescription +
      ', em violação ' + penaltyLawArticle + '.'

    var msg3 = 'Pode-se comprovar esta situação através' +
      ' ' + ((app.main.imagesUriCleanArray.length === 1) ? 'da fotografia anexa' : 'das fotografias anexas') +
      ' ' + 'à presente mensagem eletrónica. ' +
      'Juro pela minha honra que a informação supra citada é verídica.' +
      ' ' + 'Recordo ainda, que ao abrigo do referido n.º 5 do artigo 170.º do Código da Estrada,' +
      ' ' + 'a autoridade que tiver notícia por denúncia de contraordenação, levanta auto,' +
      ' ' + 'não carecendo de presenciar tal contraordenação rodoviária, ' +
      'situação a que se aplica o n.º 1 do mesmo artigo.' + '</b></b>' +
      ' ' + 'Refiro ainda que me encontro plenamente disponível para participar na qualidade de testemunha' +
      ' ' + 'no processo que vier a ser instaurado com referência à presente missiva.'

    var message = msg + '<br><br>' + msg1 + '<br><br>' + msg2 + '<br><br>' + msg3

    return message
  }

  // returns true if all the fields and inputs are filled in and ready to write the message
  function isMessageReady () {
    if (DEBUG) {
      return true
    }

    var to_break = false
    var error_string = ''
    var count = 0

    // loops through mandatory fields
    $('.mandatory').each(function () {
      var val = $(this).val()
      if (val == null || val === undefined || val === '' || (val).length === 0 || (val).replace(/^\s+|\s+$/g, '').length === 0) {
        console.log('Error on #' + $(this).attr('id'))
        error_string += '- ' + $(this).attr('name') + '<br>'
        count++
        to_break = true
      }
    })

    console.log('#generate_message goes', to_break)
    if (to_break) {
      if (count === 1) {
        $.jAlert({
          title: 'Erro!',
          theme: 'red',
          content: 'Preencha o seguinte campo obrigatório:<br>' + error_string
        })
      } else {
        $.jAlert({
          title: 'Erro!',
          theme: 'red',
          content: 'Preencha os seguintes campos obrigatórios:<br>' + error_string
        })
      }
      return false
    }

    // detects if the name is correctly filled in
    var Name = $('#name').val()
    if (!app.functions.isFullNameOK(Name) && !DEBUG) {
      $.jAlert({
        title: 'Erro no nome!',
        theme: 'red',
        content: 'Insira o nome completo.'
      })
      return false
    }

    if (!app.functions.isPostalCodeOK() && !DEBUG) {
      $.jAlert({
        title: 'Erro no Código Postal!',
        theme: 'red',
        content: 'Insira o Código Postal no formato XXXX-XXX'
      })
      return false
    }

    // detects if the Portuguese car plate is correctly filled
    if (!$('#free_plate').is(':checked') && !app.functions.isCarPlateOK() && !DEBUG) {
      $.jAlert({
        title: 'Erro na matrícula!',
        theme: 'red',
        content: 'A matrícula que introduziu não é válida'
      })
      return false
    }

    // from here the inputs are correctly written

    // removes empty values from array, concatenating valid indexes, ex: [1, null, 2, null] will be [1, 2]
    app.main.imagesUriCleanArray = app.functions.cleanArray(app.main.imagesUriArray)

    if (app.main.imagesUriCleanArray.length === 0) {
      $.jAlert({
        title: 'Erro nas fotos!',
        theme: 'red',
        content: 'Adicione pelo menos uma foto do veículo em causa'
      })
      return false
    }

    return true
  }

  function getExtraAuthenticationHTMLText () {
    var text = 'Refira-se ainda que esta mensagem tem anexo o meu certificado digital emitido pela Agência para a Modernização Administrativa, <b>o que é equivalente, de acordo com a Lei, à minha presenção nas instalações de V. Exas</b>.<br><br>' +
    'Tenho pleno conhecimento de que a Autoridade Nacional de Segurança Rodoviária (ANSR) consigna que os agentes de autoridade, mediante denúncia de um cidadão, deverão levantar auto de contraordenação, tornando-se necessário recolher os elementos ' +
    'probatórios que sustentem formalmente os documentos de denúncia, conforme o n.º 3 do artigo 170.º do Código Estrada (CE). Contudo, de acordo com o n. 1) do artigo 169.º-A do Código da Estrada, introuzido pelo Decreto-Lei n.º 102-B/2020, ' +
    'os atos processuais podem ser praticados em suporte informático com aposição de assinatura digital qualificada, nomeadamente através do Cartão de Cidadão e da Chave Móvel Digital, o que se verifica no presente caso. ' +
    'O n. 2 do mesmo artigo 169.º-A do Código da Estrada refere que os atos processuais e documentos assinados nos termos do número anterior substituem e dispensam para quaisquer efeitos a assinatura autografa no processo em suporte de papel. ' +
    'Logo, considerando as instruções emanadas pela ANSR, o artigo 169.º-A do Código da Estrada introuzido pelo Decreto-Lei n.º 102-B/2020, e o facto de esta mensagem estar assinada com recurso à Chave Móvel Digital, ' +
    'deverá V. Exa. proceder ao levantamento de auto de contraordenação, de acordo com o artigo 170.º do Código da Estrada, sem a necessidade de que eu me dirija presencialmente às instalações policiais as quais eu endereço esta denúncia.'

    return text
  }

  // called by historic module
  function getReminderMessage (occurrence) {
    var text = `${getRandomGreetings()} da ${occurrence.autoridade}<br><br>` +
      `No seguimento da denúncia já enviada anteriormente a V. Exas. a propósito da violação do Código da Estrada perpetrada pelo condutor do veículo ${occurrence.carro_marca} ${occurrence.carro_modelo} com a matrícula ${occurrence.carro_matricula}, ` +
      `na ${occurrence.data_local} n. ${occurrence.data_num_porta}, ${occurrence.data_concelho}, no dia ${(new Date(occurrence.data_data)).toLocaleDateString('pt-PT')} às ${occurrence.data_hora.slice(0, 5)}, ` +
      `veículo esse que se encontrava ${app.penalties.getDescription(occurrence.base_legal)} em violação ${app.penalties.getLawArticle(occurrence.base_legal)}, ` +
      `vinha por este meio inquirir V. Exas. sobre o estado do processo respetivo, considerando que já decorreram ${Math.round(((new Date()) - new Date(occurrence.data_data)) / (1000 * 60 * 60 * 24))} dias desde a data da ocorrência.<br><br>` +
      `Fico a aguardar resposta de V. Exas.<br><br>${getRegards()}`

    return text
  }

  function getRandomGreetings () {
    var greetingsInitial = [
      'Excelentíssimos senhores',
      'Excelentíssimos agentes',
      'Prezados senhores',
      'Prezados agentes',
      'Caros senhores',
      'Ex.mos Senhores',
      'Ex.mos Senhores Agentes'
    ]

    return greetingsInitial[Math.floor(Math.random() * greetingsInitial.length)]
  }

  // best regards
  // Andrey
  function getRegards () {
    // gets a random regard
    var regards = [
      'Agradecendo antecipadamente a atenção de V. Ex.as, apresento os meus melhores cumprimentos',
      'Com os melhores cumprimentos',
      'Com os meus melhores cumprimentos',
      'Melhores cumprimentos',
      'Apresentando os meus melhores cumprimentos',
      'Atenciosamente',
      'Atentamente',
      'Respeitosamente'
    ]

    var regard = regards[Math.floor(Math.random() * regards.length)]

    // full name
    var Name = $('#name').val()
    // gets first and last name
    var ShortName = Name.split(' ')[0] + ' ' + Name.split(' ')[(Name.split(' ')).length - 1]

    var msgEnd = regard + ',<br>' + ShortName

    return msgEnd
  }

  /* === Public methods to be returned === */
  thisModule.getMainMessage = getMainMessage
  thisModule.getReminderMessage = getReminderMessage
  thisModule.isMessageReady = isMessageReady
  thisModule.getRegards = getRegards
  thisModule.getExtraAuthenticationHTMLText = getExtraAuthenticationHTMLText

  return thisModule
})(app.text || {})
