
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
        
        ImageUriArray[imgNmbr]=imageUri;
        
        //hides "Adds images" button
        $("#" + "addImg_" + imgNmbr).text("Substituir imagem");
        $("#" + "remImg_" + imgNmbr).show();
        
        if (type == "library"){
            
            window.resolveLocalFileSystemURL(imageUri,
                    function(entry) {
                        entry.file(function(file) {
                            console.log(file);
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
        
        }

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


function displayImage(imgUri, id) {

    var elem = document.getElementById(id);
    elem.src = imgUri;
    elem.style.display = "block";
}

function removeImage(id, num){
    
    var elem = document.getElementById(id);
    elem.src = "";
    elem.style.display = "none";
    ImageUriArray[num] = null;
}

function standardErrorHandler(){
    console.log("Error geting the photo file info");
}
