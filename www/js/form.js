//date field
$.datepicker.setDefaults({
    dateFormat: 'dd-mm-yy',
    dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" ],
    monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ],
    monthNames: [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ]
});
$("#date").datepicker();

//populates personal in fields information if available in storage
function loadsPersonalInfo(){
  
  $('.personal_info').each(function(){    
      var id = $(this).attr('id');
      var value = window.localStorage.getItem(id);
      if(value){
        $(this).val(value);
      }
  });
}

$("#personal_data_hideShowBtn").click(function() {
    $("#personal_data").collapse("toggle");
});

//removes leading and trailing spaces on every text field "on focus out"
$( ":text" ).each(function( index ) {
    $( this ).focusout(function() {
      var text = $(this).val();
      text = $.trim(text);
      text = text.replace(/\s\s+/g, ' '); //removes consecutive spaces in-between        
      $(this).val(text);
    });
});


//save to storage for later usage on every select
$('select.personal_info').each(function(){
    $( this ).on('change', function() {
        var id = $(this).attr('id');
        console.log(id);
        var value = $(this).val();
        window.localStorage.setItem(id, value);
    });
});

//save to storage for later usage on every "focus out" of text input fields
$('input.personal_info').each(function(){
    $( this ).focusout(function() {      
        var id = $(this).attr('id');
        console.log(id);
        var value = $(this).val();
        value = $.trim(value);
        value = value.replace(/\s\s+/g, ' '); //removes consecutive spaces in-between
        window.localStorage.setItem(id, value);
    });
});


function populatesPenalties(){
  
    var keys = [];
    for (var key in PENALTIES) {
        if (PENALTIES.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    $("#penalties").append("<option></option>");
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        $("#penalties").append("<option>" + PENALTIES[key].select + "</option>");
    }
}


//as the user writes the carplate, detects if the name is ok
$("#plate").on('input', function() {
    if (!isCarPlateOK($(this).val()) && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }
});

$('#id_number').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#address').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#address_city').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#carmake').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#model').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#locality').on('input',  function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");        
    }  
});
$('#locality').focusout(function(){    
    getAuthoritiesFromAddress();
});
$('#street').on('input',  function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#street_number').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});