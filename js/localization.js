//  LOCALIZATION/GPS/Contacts

var MAPS_API_Loaded = false;
function loadMapsApi () {

    var API_KEY;
    API_KEY = 'AIzaSyDF1EPBBAGNzmqof3zRLxhAXCZsBdYxrW4'; //KEY for Android

    if(navigator.connection.type === Connection.NONE || MAPS_API_Loaded){
        return;
    }
    $.getScript('https://maps.googleapis.com/maps/api/js?key='+API_KEY+'&sensor=true&callback=onMapsApiLoaded');
    
    //this flag should be here otherwise the script might be loaded several times, and Google refuses it
    MAPS_API_Loaded = true; 
}

function onMapsApiLoaded () {
    
    //get from GPS Address information
    GetGeolocation();
};

//botão get address by GPS (Atualizar)
$("#getCurrentAddresBtn").click(function(){
    GetGeolocation();
});

/*Geo location functions*/
function GetGeolocation() {
    
    //detect if has Internet AND if the GoogleMaps API is loaded
    var networkState = navigator.connection.type;
    if (networkState !== Connection.NONE && MAPS_API_Loaded) {
    
        GPSLoadingOnFields(true); //truns on loading icon on the fields 
        var options = { timeout: 30000, enableHighAccuracy: true };
        navigator.geolocation.getCurrentPosition(GetPosition, PositionError, options);
    }
    else{
        PositionError();
    }
}
 
function GetPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    console.log("latitude, longitude: ", latitude, longitude);
    getAuthoritiesFromGMap(latitude, longitude);   // Pass the latitude and longitude to get address.
}
 
function PositionError() {
    $.jAlert({
        'title': "Erro na obtenção do local da ocorrência!",
        'theme': 'red',
        'content': "Confirme se tem o GPS ligado e autorizado, e se tem acesso à Internet. Caso contrário pode introduzir manualmente o Concelho, Local (rua, travessa, etc.) e número de porta da ocorrência."
    });
    GPSLoadingOnFields(false);
}

/*Get address by coordinates*/
var AUTHORITIES = []; //array of possible authorities applicable for that area
function getAuthoritiesFromGMap(latitude, longitude){        
    
    var reverseGeocoder = new google.maps.Geocoder();
    var currentPosition = new google.maps.LatLng(latitude, longitude);
    reverseGeocoder.geocode({'latLng': currentPosition}, function(results, status) {
 
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                                                               
                var address_components = results[0].address_components;
                getAuthoritiesFromAddress(address_components);
                
            }
            else {
                PositionError();
            }
        } 
        else {
            PositionError();
        }
    });
}

function getAuthoritiesFromAddress(address_components){
    
    AUTHORITIES = [];
    var geoNames = []; //array of possible names for the locale, for example ["Lisboa", "Odivelas"]     
    
    if(address_components != undefined){
    
        $("#street").val(getAddressComponents( address_components, "route")); //nome da rua/avenida/etc.
        $("#street_number").val(getAddressComponents( address_components, "street_number"));

        //get concelho/municipality according to Google Maps API
        var municipalityFromGmaps = getAddressComponents(address_components, "administrative_area_level_2");
        console.log("municipality from Goolge Maps is " + municipalityFromGmaps);        
        if (municipalityFromGmaps){
            geoNames.push(municipalityFromGmaps);
        }

        var localityFromGmaps = getAddressComponents(address_components, "locality");
        console.log("locality from Goolge Maps is " + localityFromGmaps);
        if (localityFromGmaps){
            geoNames.push(localityFromGmaps);                
        }
            
        var postalCodeFromGmaps = getAddressComponents(address_components,"postal_code");
        console.log("postal_code from Goolge Maps is " + postalCodeFromGmaps, typeof postalCodeFromGmaps);

        //from the Postal Code got from GPS/Google
        //tries to get locality using the offline Data Base (see file contacts.js)
        var dataFromDB = getDataFromPostalCode(postalCodeFromGmaps);
        
        var localityFromDB = dataFromDB.locality;
        console.log("locality from DB is " + localityFromDB);
        if(localityFromDB){
            geoNames.push(localityFromDB);
        }
        
        var municipalityFromDB = dataFromDB.municipality;
        console.log("municipality from DB is " + municipalityFromDB);
        if(municipalityFromDB){
            geoNames.push(municipalityFromDB);
        }
        
        if (localityFromGmaps){
            $("#locality").val(localityFromGmaps); 
        }
        else if (municipalityFromGmaps){
            $("#locality").val(municipalityFromGmaps);
        }        
        else if (localityFromDB){
            $("#locality").val(localityFromDB);
        }        
        
        //if Google Maps has futher information of local name
        var locality2 = getAddressComponents(address_components, "administrative_area_level_3");
        if (locality2 && locality2!=""){
            geoNames.push(locality2);
        }
    }
    else{
        geoNames.push($("#locality").val());
    }

    geoNames = cleanArray(geoNames); //removes empty strings
    console.log("geoNames :", geoNames);
    AUTHORITIES.push.apply(AUTHORITIES, getPMcontacts(geoNames));
    AUTHORITIES.push.apply(AUTHORITIES, getGNRcontacts(geoNames));
    AUTHORITIES.push.apply(AUTHORITIES, getPSPcontacts(geoNames));

    var PSPGeral = {
        authority: "Polícia",
        authorityShort: "Polícia de Segurança Pública",
        nome: "Geral",
        contacto: "contacto@psp.pt"
    };
    var GNRGeral = {
        authority: "Guarda Nacional Republicana",
        authorityShort: "GNR",
        nome: "Comando Geral",
        contacto: "gnr@gnr.pt"
    };    
    AUTHORITIES.push(PSPGeral);
    AUTHORITIES.push(GNRGeral);

    console.log("AUTHORITIES :", AUTHORITIES);
    populateAuthoritySelect(AUTHORITIES);

    GPSLoadingOnFields(false);

}


function populateAuthoritySelect(arrayAuthorities){        
    
    $('#authority').empty(); //empty select options
    $.each(arrayAuthorities, function (index, value) {
        $('#authority').append($('<option>', { 
            value: index,
            text : value.authorityShort + " - " + value.nome
        }));
    });
}



//gets "street_number", "route", "locality", "country", "postal_code", "administrative_area_level_2"(concelho)
function getAddressComponents(components, type) {    
    
    for (var key in components) {
        if (components.hasOwnProperty(key)) {            
            
            if (type == components[key].types[0]) {
                return components[key].long_name;
            }  
        }        
    }
}

//GPS/Google Postal Code -> Localities.postalCode -> Localities.municipality ->  Municipalities.code -> Municipalities.name -> PM_Contacts.nome
function getDataFromPostalCode( postalCode ){   

    var toReturn;
    
    //gets first 4 characters
    postalCode = postalCode.substring(0, 4);
    if (postalCode.length != 4){
        toReturn = {
            "locality": "", 
            "municipality": ""
        };
        return toReturn;
    }
    
    console.log('getDataFromPostalCode: ' + postalCode, typeof postalCode);
    
    var locality, municipality, municipality_code;
    
    for (var key in Localities) {
        if (Localities[key].postalCode == postalCode){
            locality = Localities[key].locality;
            municipality_code = Localities[key].municipality;
            break
        }
    }
    
    for (var key in Municipalities){
        if (Municipalities[key].code == municipality_code){
            municipality = Municipalities[key].name;
            break
        }    
    }
    
    toReturn = {
        "locality": $.trim(locality), 
        "municipality": $.trim(municipality)
    };
    return toReturn;
}

//try to get PM contacts based on name of municipality
//geoNames is an array with possible names for the area
function getPMcontacts( geoNames ){
        
    var PMrelevantContacts = [];
    var municipalityName;
    var toAddBool;
    
    for (var key in PM_Contacts){
        municipalityName = PM_Contacts[key].nome;        
        
        toAddBool = false;
        for (key2 in geoNames){            
            toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName);      
        }
                
        if (toAddBool){
            var PMrelevantContact = {
                authority: "Polícia Municipal",
                authorityShort: "Polícia Municipal",
                nome: PM_Contacts[key].nome,
                contacto: PM_Contacts[key].contacto
            };                       
            PMrelevantContacts.push(PMrelevantContact);            
        }
    }
    
    return PMrelevantContacts;
}

//try to get GNR contacts based on name of municipality and locality
//geoNames is an array with possible names for the area
function getGNRcontacts( geoNames ){

    var GNRrelevantContacts = [];
    var GNRauthority;
    var toAddBool;
    
    for (var key in GNR_Contacts){
        municipalityName = GNR_Contacts[key].nome;
        
        toAddBool = false;
        for (key2 in geoNames){            
            toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName);      
        }
                
        if (toAddBool){
            var GNRrelevantContact = {
                authority: "Guarda Nacional Republicana",
                authorityShort: "GNR",
                nome: GNR_Contacts[key].nome,
                contacto: GNR_Contacts[key].contacto
            };   
            GNRrelevantContacts.push(GNRrelevantContact);
        }
    }
    
    return GNRrelevantContacts;
}

//try to get PSP contacts based on name of municipality and locality
//geoNames is an array with possible names for the area
function getPSPcontacts( geoNames ){

    var PSPrelevantContacts = [];
    var PSPauthority;
    var toAddBool;    
    
    for (var key in PSP_Contacts){
        municipalityName = PSP_Contacts[key].nome;
        
        toAddBool = false;
        for (key2 in geoNames){            
            toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName);      
        }
                
        if (toAddBool){
            var PSPrelevantContact = {
                authority: "Polícia de Segurança Pública",
                authorityShort: "PSP",
                nome: PSP_Contacts[key].nome,
                contacto: PSP_Contacts[key].contacto
            }; 
            PSPrelevantContacts.push(PSPrelevantContact);
        }
    }
    
    return PSPrelevantContacts;
}

//for example: "Porto District" overlap with "Porto"
//this function is used to try to find similarities between strings
//so that one can find the authority applicable for a specific area name
function doStringsOverlap(string1, string2){
    
    if (string1 == "" || string2 == "" ){
        return false;
    }
    
    string1 = $.trim(string1);
    string1 = string1.toLowerCase();
    string2 = $.trim(string2);
    string2 = string2.toLowerCase();
    
    //indexOf returns -1 when one string doesn't contain the other
    if(string1.indexOf(string2)!==-1 || string2.indexOf(string1) !==-1){
        return true;
    }
    else{
        return false;
    }
}


//removes the loading gif from input fields
function GPSLoadingOnFields (bool){
    
    if (bool){
        $("#locality").addClass("loading");
        $("#street").addClass("loading");
        $("#street_number").addClass("loading"); 
    }
    else{
        $("#street").removeClass("loading");
        $('#street').trigger('input');
        $("#street_number").removeClass("loading");
        $('#street_number').trigger('input');
        $("#locality").removeClass("loading");
        $('#locality').trigger('input');
    }
}

//converts latitude, longitude coordinates from Degrees Minutes Second (DMS) to Decimal Degrees (DD)
//the input string of the DMS is on the format "52/1,0/1,376693/10000"
function ConvertDMSStringInfoToDD(gpsString, direction) {
    
    var i, temp; 
    var values = [];
        
    var gpsArray = gpsString.split(",");
    
    for (i=0; i < gpsArray.length; i++){
        //if the value is presented in ratio, example "376693/10000"
        temp = gpsArray[i].split("/");        
        if (temp[1]){ 
            values[i] = parseFloat(temp[0])/parseFloat(temp[1]);             
        }
        else{
            values[i] = parseFloat(gpsArray[i]);
        }
    }
    
    var deg = values[0];
    var min = values[1];
    var sec = values[2];
    
    var dd = deg + min/60 + sec/(60*60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}
