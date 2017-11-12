
//get Photo function
//type depends if the photo is got from camera or the photo library
function getPhoto(imgNmbr, type) {

    
    if (type == "camera"){    
        var srcType = Camera.PictureSourceType.CAMERA;
    }
    else if (type == "library"){
        var srcType = Camera.PictureSourceType.PHOTOLIBRARY;        
    }
    else{
        console.log("getPhoto error");
        return;
    }    
    
    var options = setOptions(srcType);    

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri, "myImg_" + imgNmbr);
        
        //removes queries from the URI, i.e., the text after "?"
        //for example 'file://photo.jpg?123' will be 'file://photo.jpg'
        imageUri = getPathFromUri(imageUri);
        console.log(imageUri);
        console.log(getDateFromFileName(imageUri));
        
        IMGS_URI_ARRAY[imgNmbr]=imageUri;
        
        //hides "Adds images" button
        $("#" + "addImg_" + imgNmbr).text("Substituir imagem");
        $("#" + "remImg_" + imgNmbr).show();
                
        //tries to get the date from the photo when such photo is got from library
        //still not working properly this part/if
        /*if (type == "library"){
            
            window.resolveLocalFileSystemURL(imageUri,
                    function(entry) {
                        entry.file(function(file) {
                            console.log(file);
                            //tries to get date from file name
                            EXIF.getData(file, function() {
                                var datetime = EXIF.getTag(this, "DateTimeOriginal");
                                console.log(datetime);
                            });                                              

                            // do something useful....

                        }, standardErrorHandler);
                    },
                    function(e) {
                        console.log('Unexpected error obtaining image file.');
                        standardErrorHandler();
                    });           
        
        }*/

    }, function cameraError(error) {
        console.debug("Não foi possível obter fotografia: " + error, "app");

    }, options);
}

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,        
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}

//tries to get date from file name
function getDateFromFileName(fileURI){

    //date yearmonthday
    var n = fileURI.search(/[2][0][0-9][0-9](1[0-2]|0[1-9])([0][1-9]|[1,2][0-9]|3[0,1])/);
    var year = fileURI.substr(n, 4);
    var month = fileURI.substr(n+4, 2);
    var day = fileURI.substr(n+6, 2);
    
    //hourminutes
    var newstring = fileURI.substring(0, n) + fileURI.substring(n+8);
    n = newstring.search(/[0,1,2][0-9][0-5][0-9]/);
    var hour = newstring.substr(n, 2);
    var minute = newstring.substr(n+2, 2); 
    
    var objectDate = {
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute
    };
    return objectDate;
}


function displayImage(imgUri, id) {

    var elem = document.getElementById(id);
    elem.src = imgUri;
    elem.style.display = "block";
}

function removeImage(id, num){
    
    var elem = document.getElementById(id);
    elem.src = "";
    elem.style.display = "none";
    IMGS_URI_ARRAY[num] = null;
}

function standardErrorHandler(){
    console.log("Erro geting the photo file info");
}
