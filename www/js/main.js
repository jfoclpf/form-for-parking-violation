var DEBUG = true;
console.log("DEBUG: ", DEBUG);

var WAS_INIT;
var MAIN_MESSAGE;
var EMAIL_TO;
var EMAIL_SUBJECT;
var IMGS_URI_ARRAY = [];
var IMGS_URI_CLEAN_ARRAY = [];
var Platform;
var VARS = {}; //global object used for debug

$(document).ready(function() {
    console.log("$(document).ready started");
    WAS_INIT = false;
    document.addEventListener("deviceready", onDeviceReady, false);    

    //hides Personal Data information section
    $("#personal_data").collapse("hide");
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

    updateDateAndTime();
        
    $("input").each(function (){
        if (!DEBUG && $(this).val() == ""){
            $(this).css("border-color","red");        
        }
    });
    
    $("#plate").css("border-color","");
    setPortuguesePlateInput();
    
    loadMapsApi();    
    loadAuthentication();
}

//##############################################################################################################
//##############################################################################################################

function onOnline () {
    loadMapsApi();    
}

function onResume () {
    loadMapsApi();    
}


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

//when user clicks "generate_email"
$("#generate_message").click(function(){
  
    if(!isMessageReady()){
        return;
    }  
  
    MAIN_MESSAGE = getMainMessage();
    $("#message").html(MAIN_MESSAGE);
    $("#second_stage").show();
  
    //scrolls to the generated message
    $('html, body').animate({
        scrollTop: $("#message").offset().top
    }, 1000);
});

//botão de gerar email
$("#send_email_btn").click(function(){
    
    var mensagem = 'A Autoridade Nacional de Segurança Rodoviária (ANSR), num parecer enviado às polícias a propósito desta APP, refere que as polícias devem de facto proceder à emissão efetiva da multa, perante as queixas dos cidadãos por esta via. Todavia, refere a ANSR, que os denunciantes deverão posteriormente dirigir-se às instalações da polícia respetiva, para se identificarem presencialmente.<br><br>Caso não se queira dirigir à polícia, terá de se autenticar fazendo uso da <b>Chave Móvel Digital</b> emitida pela Administração Pública. Caso não tenha uma, veja <a href="https://www.autenticacao.gov.pt/cmd-pedido-chave">aqui</a> como pedi-la.';
    
    $.jAlert({
        'title'  : "Deseja autenticar a sua mensagem com Chave Móvel Digital?",
        'content': mensagem,
        'theme'  : 'dark_blue',
        'btns': [ 
                    {
                        'text': 'Sim',
                        'theme': 'green',
                        'class': 'jButtonAlert',
                        'onClick': startAuthentication
                    }, 
                    {
                        'text': 'Não',
                        'theme': 'green',
                        'class': 'jButtonAlert',
                        'onClick': sendMailMessage
                    } 
                ]
    });  

});


function sendMailMessage(){

    if(isMessageReady()){
        
        MAIN_MESSAGE = getMainMessage();
        EMAIL_SUBJECT = "Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada";
               
        cordova.plugins.email.open({
            to:          EMAIL_TO,             // email addresses for TO field
            attachments: IMGS_URI_CLEAN_ARRAY, // file paths or base64 data streams
            subject:     EMAIL_SUBJECT,        // subject of the email
            body:        MAIN_MESSAGE,         // email body (for HTML, set isHtml to true)
            isHtml:      true                  // indicats if the body is HTML or plain text
        });
    }
}
