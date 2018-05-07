//main message
function getMainMessage(){
    
    //Authority
    var authority, authorityShort, authorityName;
    for (var key in AUTHORITIES){
        if(!AUTHORITIES.hasOwnProperty(key)) continue;
                             
        if ($("#authority").val() == key){
            authority = AUTHORITIES[key].authority;
            authorityShort = AUTHORITIES[key].authorityShort;
            authorityName = AUTHORITIES[key].nome;
            EMAIL_TO = AUTHORITIES[key].contacto;
        }
    }
    
    //Penalties
    var penaltyDescription;
    var penaltyLawArticle;
    for (var key in PENALTIES){
        if(!PENALTIES.hasOwnProperty(key)) continue;

        var obj = PENALTIES[key];                             
        if ($("#penalties").val() == obj.select){
            penaltyDescription = obj.description;
            penaltyLawArticle = obj.law_article; 
        }
    }
    
    var CarPlateStr = getCarPlate();
    
    //texto para marca e modelo
    var is_carmake = ($("#carmake").val().replace(/^\s+|\s+$/g, "").length != 0);
    var is_model = ($("#model").val().replace(/^\s+|\s+$/g, "").length != 0);
    var carmake_model_txt;
    if (is_carmake && is_model){
        carmake_model_txt = "de marca e modelo <b>" + $("#carmake").val() + " " + $("#model").val() + "</b>, ";
    }
    else if (is_carmake){
        carmake_model_txt = "de marca <b>" + $("#carmake").val() + "</b>, ";
    }
    else if (is_model){
        carmake_model_txt = "de modelo <b>" + $("#model").val() + "</b>, ";
    }
    else{
        carmake_model_txt = "";
    }    
    
    //get initial random greeting
    var greetingsInitial = [
                             "Excelentíssimos senhores",
                             "Excelentíssimos agentes",
                             "Prezados senhores",
                             "Prezados agentes",
                             "Caros senhores",
                             "Ex.mos Senhores",
                             "Ex.mos Senhores Agentes",                    
                            ];    
    var msg = greetingsInitial[Math.floor(Math.random()*greetingsInitial.length)] + 
              " " + "da" + " " + authority + ", " + authorityName + ";"

    var msg1 = "Eu, <b>" + $("#name").val() + "</b>, com o <b>" + $("#id_type").val() + "</b> com o número <b>" + $("#id_number").val() + "</b> " +
        "e com residência em <b>" + $("#address").val() + ", " + $("#postal_code").val() + ", " + $("#address_city").val() + 
        "</b>, venho por este meio," + " " +
        "ao abrigo do n.º 5 do artigo 170.º do Código da Estrada, fazer a seguinte denúncia de contra-ordenação para que a " +
        authority + " " + "levante o auto respetivo e multe o infra-mencionado responsável.";

    var msg2 = "No passado dia <b>" + $.datepicker.formatDate("dd' de 'MM' de 'yy", $( "#date" ).datepicker('getDate') ) + "</b>" +
        ( $("#time").val() ? " pelas <b>" + $("#time").val() + "</b>" : "") + //optional
        ", " +
        "na <b>" + $("#street").val() + ", " +  $("#locality").val() + "</b>, " +
        ( $("#street_number").val() ? "aproximadamente junto à porta com o <b>número " + $("#street_number").val() + "</b>, " : "") + //optional
        "a viatura com matrícula <b>" + CarPlateStr + "</b> " + carmake_model_txt +
        "encontrava-se estacionada" + " " + penaltyDescription + ", em violação " + penaltyLawArticle +".";

    var msg3 = "Pode-se comprovar esta situação através" + " " + ((IMGS_URI_CLEAN_ARRAY.length == 1) ? "da fotografia anexa" : "das fotografias anexas") + 
               " " + "à presente mensagem eletrónica. Juro pela minha honra que a informação supra citada é verídica." + " " +
               "Recordo ainda, que ao abrigo do referido n.º 5 do artigo 170.º do Código da Estrada," + " " + 
               "a autoridade que tiver notícia por denúncia de contraordenação, levanta auto," + " " + 
               "não carecendo de presenciar tal contraordenação rodoviária, situação a que se aplica o n.º 1 do mesmo artigo.";

    //gets a random greeting
    var greetingsEnd = [
                         "Agradecendo antecipadamente a atenção de V. Ex.as, apresento os meus melhores cumprimentos",
                         "Com os melhores cumprimentos",
                         "Com os meus melhores cumprimentos",
                         "Melhores cumprimentos",
                         "Apresentando os meus melhores cumprimentos",
                         "Atenciosamente",
                         "Atentamente",
                         "Respeitosamente"
                       ];
    var Name = $("#name").val();
    //gets first and last name
    var ShortName = Name.split(' ')[0] + " " +  Name.split(' ')[(Name.split(' ')).length-1];
    var msg4 = greetingsEnd[Math.floor(Math.random()*greetingsEnd.length)] + ",<br>" + ShortName;

    var msg5 = getImagesToMessage();

    message = msg + "<br><br>" + msg1 + "<br><br>" + msg2 + "<br><br>" + msg3 + "<br><br>" + msg4 + "<br>";

    return message;
}

//returns true if all the fields and inputs are filled in and ready to write the message
function isMessageReady(){
    
    if (!DEBUG) {
        
        var to_break = false;
        var error_string = "";
        var count = 0;
        
        //loops through mandatory fields
        $(".mandatory").each(function(){
            var val = $(this).val();
            if (val==null || val == undefined || val == "" || (val).length == 0 ||  (val).replace(/^\s+|\s+$/g, "").length == 0)
            {                
                console.log('Error on #' + $(this).attr('id'));
                error_string += "- " + $(this).attr('name') + "<br>";
                count++;
                to_break = true;
            }
        });
        
        console.log("#generate_message goes", to_break);
        if(to_break){            
            if(count==1){
                $.jAlert({
                            'title': "Erro!",
                            'theme': 'red',
                            'content': "Preencha o seguinte campo obrigatório:<br>" + error_string
                         });                                 
            }
            else{
                $.jAlert({
                            'title': "Erro!",
                            'theme': 'red',
                            'content': "Preencha os seguintes campos obrigatórios:<br>" + error_string
                         });            
            }           
            return false;
        }
    }
  
    //detects if the name is correctly filled in
    var Name = $("#name").val();
    if (!isFullNameOK(Name) && !DEBUG){
        
        $.jAlert({
            'title': "Erro no nome!",
            'theme': 'red',
            'content': "Insira o nome completo."
        });
        return false;
    }
    
    
    if (!isPostalCodeOK() && !DEBUG){                
        
        $.jAlert({
            'title': "Erro no Código Postal!",
            'theme': 'red',
            'content': "Insira o Código Postal no formato XXXX-XXX"
        });
        return false;
    }
  
    //detects if the car plate is correctly filled in
    if ((!isCarPlateOK()) && (!DEBUG)) {
        $.jAlert({
            'title': "Erro na matrícula!",
            'theme': 'red',
            'content': "Preencha a matrícula em maiúsculas no formato XX-XX-XX"
        });         
        return false;
    }
  
    //from here the inputs are correctly written

    //check photos
    //removes empty values from array, concatenating valid indexes, ex: [1, null, 2, null] will be [1, 2]
    IMGS_URI_CLEAN_ARRAY = cleanArray(IMGS_URI_ARRAY);       
    if(IMGS_URI_CLEAN_ARRAY.length == 0){   
        $.jAlert({
            'title': "Erro nas fotos!",
            'theme': 'red',
            'content': "Adicione pelo menos uma foto do veículo em causa"
        });
        return false;
    }    
    
    return true;
}