var DEBUG = false;
console.log("DEBUG: ", DEBUG);

var WAS_INIT;
var mainMessage;
var email_to;
var email_subject;


$(document).ready(function() {
    console.log("$(document).ready started");
    WAS_INIT = false;
    document.addEventListener("deviceready", onDeviceReady, false);
});

function onDeviceReady() {
    console.log("onDeviceReady() started");
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

    //populates HTML select according to the information on municipalities.js file
    populatesMunicipalities();
    //populates HTML select according to the information on penalties.js file
    populatesPenalties();

    //initializes date and time with current date and time
    var date = new Date();
    $("#date").datepicker('setDate', date);
    var currentTime = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2);
    $("#time").val(currentTime);

}

//##############################################################################################################
//##############################################################################################################

//when user clicks "generate_email"
$("#generate_email_btn").click(function(){

    if (!DEBUG) {
        //campos vazios
        var to_break=false;
        $(".mandatory").each(function(){
            if ($(this).val().replace(/^\s+|\s+$/g, "").length == 0){
                alert("Preencha todos os campos obrigatórios assinalados com *");
                to_break = true;
                return false;
            }
        });
        if(to_break){
            return;
        }
    }
  
    //detects inf the name is correctly filled in
    var Name = $("#name").val();
    if (!isFullNameOK(Name) && !DEBUG){
        alert("Insira o nome completo");
        return;
    }
    var ShortName = Name.split(' ')[0] + " " +  Name.split(' ')[(Name.split(' ')).length-1];
    
    if (!isPostalCodeOK() && !DEBUG){
        alert("Insira o Código Postal no formato XXXX-XXX");
        return;
    }
  
    //detects if the car plate is correctly filled in
    if ((!isCarPlateOK()) && (!DEBUG)) {
        alert("Preencha a matrícula em maiúsculas no formato XX-XX-XX");
        return;
    }
  
    //from here the inputs are correctly written
    
  //PREAMBLE
  var preamble = "Para enviar email para ";
  for (var key in MUNICIPALITIES){
    if(!MUNICIPALITIES.hasOwnProperty(key)) continue;
    
    var obj = MUNICIPALITIES[key];                             
    if ($("#municipality").val() == obj.name){
      preamble += '<a href="mailto:' + obj.email + '">' + obj.email + '</a>';
      email_to = obj.email;        
    }
  } 
  preamble += " clique no seguinte botão:"

  mainMessage = getMainMessage(ShortName);
  
  $("#preamble").html(preamble);
  $("#message").html(mainMessage);
  $("#second_stage").show();
  
  //scrolls to the generated message
  $('html, body').animate({
      scrollTop: $("#message").offset().top
  }, 1000);
});

//botão de gerar email
$("#send_email_btn").click(function(){
    
  alert("Abrir-se-á de seguida o seu cliente de mail, bastando depois anexar a foto!\n\n\n" +
        "Caso o cliente de mail não se abra:\n" + 
        "1)Copie a mensagem gerada,\n" +
        "2)Crie um novo email,\n" + 
        "3)Cole a mensagem no corpo do email,\n" + 
        "4)Envie para " + email_to);

  email_subject = "Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada";
    
  email_subject = encodeURIComponent(email_subject);  
  clean_msg = encodeURIComponent(clean_message(mainMessage));  
  
  window.open('mailto:'+encodeURIComponent(email_to)+'?subject='+email_subject+'&body='+clean_msg);  
});



