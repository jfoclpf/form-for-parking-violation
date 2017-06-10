/* The uploader form */
    $(function () {
        $(":file").change(function () {
            if (this.files && this.files[0]) {
                var reader = new FileReader();
				
                reader.onload = (function(id) {
				   return function(e) {
					   $("#myImg_" + id).attr('src', e.target.result);
				       $("#myImg_" + id).show();
				   }
			    })($(this).data("id"));

                reader.readAsDataURL(this.files[0]);
            }
        });
    });

	function getImagesToMessage()
	{
		t = "<div class='row'><div class='col-xs-12'>";
		i = 0;
  	    $(".image_to_mail").each(function(e){		  		 		  
		  i++;
		  if (this.clientHeight > 0) {
			t = t + "Imagem " + i + "<p><img class='col-xs-12' src='" + this.currentSrc + "'><p/>";
		  }
	  });

	  return t + "</div></div>";
	}
	
	/*
    function imageIsLoaded(e) {
        $('#myImg').attr('src', e.target.result);
        $('#yourImage').attr('src', e.target.result);
		$('#myImg').show();
    };
	*/
