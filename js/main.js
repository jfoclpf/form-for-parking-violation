var DEBUG = false;
console.log("DEBUG: ", DEBUG);

var WAS_INIT;
var MAIN_MESSAGE;
var EMAIL_TO;
var EMAIL_SUBJECT;
var ImageUriArray = [];
var Platform;

$(document).ready(function() {
    console.log("$(document).ready started");
    WAS_INIT = false;
    document.addEventListener("deviceready", onDeviceReady, false);

});

function onDeviceReady() {
    console.log("onDeviceReady() started");
    
    document.addEventListener("online", onOnline, false);
    document.addEventListener("resume", onResume, false);    
    
    init();
}

//if by any strange reason onDeviceReady doesn't trigger, load init() anyway
setTimeout(function () {
    if (!WAS_INIT){
        init();
    }
}, 3000);


//when the page loads
function init() {
    
    console.log("init() started");
    WAS_INIT = true;
    
    //information stored in variable window.localStorage
    loadsPersonalInfo();

    //populates HTML select according to the information on penalties.js file
    populatesPenalties();

    //initializes date and time with current date and time
    var date = new Date();
    $("#date").datepicker('setDate', date);
    var currentTime = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2);
    $("#time").val(currentTime);
    
    $("input").each(function (){
        if (!DEBUG && $(this).val() == ""){
            $(this).css("border-color","red");        
        }
    });
    
    loadMapsApi();
}

//##############################################################################################################
//##############################################################################################################

function onOnline () {
    loadMapsApi();
}

function onResume () {
    loadMapsApi();
}


//when user clicks "generate_email"
$("#generate_message").click(function(){
  
    if (!DEBUG) {
        //campos vazios
        var to_break=false;
        var error_string = "";
        var count = 0;
        $(".mandatory").each(function(){
            var val = $(this).val();
            if (val==null || val == undefined || val == "" || (val).length == 0 ||  (val).replace(/^\s+|\s+$/g, "").length == 0){                
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
            return;
        }
    }
  
    //detects inf the name is correctly filled in
    var Name = $("#name").val();
    if (!isFullNameOK(Name) && !DEBUG){
        
        $.jAlert({
            'title': "Erro no nome!",
            'theme': 'red',
            'content': "Insira o nome completo."
        });
        return;
    }
    var ShortName = Name.split(' ')[0] + " " +  Name.split(' ')[(Name.split(' ')).length-1];
    
    if (!isPostalCodeOK() && !DEBUG){                
        
        $.jAlert({
            'title': "Erro no Código Postal!",
            'theme': 'red',
            'content': "Insira o Código Postal no formato XXXX-XXX"
        });
        return;
    }
  
    //detects if the car plate is correctly filled in
    if ((!isCarPlateOK()) && (!DEBUG)) {
        $.jAlert({
            'title': "Erro na matrícula!",
            'theme': 'red',
            'content': "Preencha a matrícula em maiúsculas no formato XX-XX-XX"
        });         
        return;
    }
  
  //from here the inputs are correctly written
  
  MAIN_MESSAGE = getMainMessage(ShortName);
  $("#message").html(MAIN_MESSAGE);
  $("#second_stage").show();
  
  //scrolls to the generated message
  $('html, body').animate({
      scrollTop: $("#message").offset().top
  }, 1000);
});

//buttons "Add Image"
$("#addImg_1, #addImg_2, #addImg_3, #addImg_4").click(function(){
    
    //get id, for example #remImg_2
    var id = $(this).attr('id');
    console.log('photo id: ' + id);
    //gets the number of the element, by obtaining the last character of the id
    var num = id[id.length-1];    
    
    $.jAlert({
        'title': "Método de obtenção da foto:",
        'theme': 'dark_blue',
        'btns': [ 
                    {
                        'text': 'Câmara',
                        'theme': 'green',
                        'class': 'jButtonAlert',
                        'onClick': (function(){getPhoto(num, "camera")})
                    }, 
                    {
                        'text': 'Biblioteca de fotos',
                        'theme': 'green',
                        'class': 'jButtonAlert',
                        'onClick': (function(){getPhoto(num, "library")})
                    } 
                ]
    });    

});

//buttons "Remove Image"
$("#remImg_1, #remImg_2, #remImg_3, #remImg_4").click(function(){
    
    //get id, for example #remImg_2
    var id = $(this).attr('id');
    //gets the number of the element, by obtaining the last character of the id
    var num = id[id.length-1];
    
    removeImage("myImg_" + num, num);
    $(this).hide();
    
    $("#addImg_" +  num).text("Adicionar imagem");    
});



//botão de gerar email
$("#send_email_btn").click(function(){

    EMAIL_SUBJECT = "Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada";

    //removes empty values from array, concatenating valid indexes, ex: [1, null, 2, null] will be [1, 2]
    var photosArr = cleanArray(ImageUriArray);   
    
    if(photosArr.length == 0){   
        $.jAlert({
            'title': "Erro nas fotos!",
            'theme': 'red',
            'content': "Adicione pelo menos uma foto do veículo em causa"
        });
        return;
    }
    
    cordova.plugins.email.open({
        to:          EMAIL_TO, // email addresses for TO field
        attachments: photosArr, // file paths or base64 data streams
        subject:    EMAIL_SUBJECT, // subject of the email
        body:       MAIN_MESSAGE, // email body (for HTML, set isHtml to true)
        isHtml:    true // indicats if the body is HTML or plain text
    });  
    
});

