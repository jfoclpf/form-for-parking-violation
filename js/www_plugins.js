//variables to be set by the URL in a browser in the www version
//in the APP version these variables shall be set to FALSE
var www_debug, images_support, map_reverse_location, enable_user_cookie;

if (!APP_BOOL) { //www version
    www_debug = /debug=(\d+)/.exec(window.location.href);
    DEBUG = DEBUG || www_debug;    
    console.log("www_debug: ", debug);
    
    images_support = /images_support=(\d+)/.exec(window.location.href);
    console.log("images_support: ", images_support);
    
    map_reverse_location = /map_reverse_location=(\d+)/.exec(window.location.href);
    console.log("map_reverse_location: ", map_reverse_location);
    
    enable_user_cookie = /user_cookie=(\d+)/.exec(window.location.href);
    console.log("enable_user_cookie: ", enable_user_cookie);
}
else{ //APP version
    images_support = false;
    map_reverse_location = false;
    enable_user_cookie = false;
}
//####################

// Location
function getLocation() {  
    
  if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(fillFormAddress);
      $('#map_holder').click(function(e) {
        var offset = $(this).offset();
        newLong = geoL.coords.longitude + (e.pageX - offset.left - $(this).width() / 2) / 100000;
        newLat = geoL.coords.latitude - (e.pageY - offset.top - $(this).height() / 2) / 100000;
        geoL = { coords : { latitude : newLat,longitude : newLong }};      
        updateMapLocation(geoL);
      });  
  } 
  else {
      if (DEBUG){
          alert("Geolocation não é suportada por este browser.");
      }
      map_reverse_location = false; 
    }
}

function fillFormAddress(position)
{  
  geoL = { coords : { longitude : position.coords.longitude, latitude : position.coords.latitude }};
  
  updateMapLocation(position);
  
  $("#location_holder").show()  
}

var geoL = { coords : { longitude : 0, latitude : 0 }};

function updateMapLocation(position) {

  var latlon = position.coords.latitude + "," + position.coords.longitude;  
  img_url = "https://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=17&size=600x300&sensor=false&markers=color:red%7Clabel:!%7C"+latlon;  

  $("#longitude").val(position.coords.longitude);
  $("#latitude").val(position.coords.latitude);
  $("#map_holder").html("<img style='width: 100%' src='"+img_url+"'>");  

  $.ajax({
        type: "GET",
        url: "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&zoom=18&addressdetails=1",
        cache: false,
        dataType: "json",
        success: function(data) {
            
          // if ($("#municipality").val() == "") {
        $("#municipality").val(data.address.city);
        // };      
        
        roadsplit = data.address.road.split(" ");
        //if ($("#place_prefix").val() == "") {
          $("#place_prefix").val(roadsplit[0]);
        //}
        
        //if ($("#street").val() == "") {
          $("#street").val(data.address.road.substr(roadsplit[0].length+1,data.address.road.length-roadsplit[0].length+1));
        //}

        }
        }
    );
}

function getMapImageToMessage()
{
  t = "";
  
  if (map_reverse_location) {
    t = "<div class='row'><div class='col-xs-12'>" +
          "Mapa " + "<p><img class='col-xs-12' src='" + img_url + "'>" +
        "</div></div>";
  }
  
  return t;
}

// User Information Cookie
function setUserCookie() {
    var d = new Date();
    d.setTime(d.getTime() + (360*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
  document.cookie = "user=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = encodeURIComponent(JSON.stringify({ "name" : $("#name").val(), "id_type" : $("#id_type").val(), "id_number" : $("#id_number").val(), "address" : $("#address").val()})) + ";" + expires + ";path=/";
}


function getUserCookie() {
  if (document.cookie == "") {
    return
  }
  
  var decodedCookie = JSON.parse(decodeURIComponent(document.cookie));
  $("#name").val(decodedCookie.name);
  $("#id_type").val(decodedCookie.id_type);
  $("#id_number").val(decodedCookie.id_number);
  $("#address").val(decodedCookie.address);
}