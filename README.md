# form-for-parking-violation

Formulário para submissão de queixa de estacionamento ilegal junto de autoridade policial, ao abrigo do n.º 5 do art.º 170.º do Código da Estrada

O formulário pode ser visto aqui: http://jfolpf.pt/passeio_livre/form/form.html

## Opções

 * debug=1, ativa o modo de debug do formulário; debug=false desativa
 * images_support=1, ativa a submissão de imagens no formulário
 * map_reverse_location=1, ativa a geolocalização, mapa e reverse location

Exemplo:

 * http://jfolpf.pt/passeio_livre/form/form.html?debug=1&images_support=1&map_reverse_location=1
 * http://jfolpf.pt/passeio_livre/form/index.html?debug=1&images_support=1
 * http://jfolpf.pt/passeio_livre/form/index.html?debug=false&images_support=1

APIs Utilizadas:

 * Google Maps - https://maps.googleapis.com/maps/api
 * OpenStreetMap - https://nominatim.openstreetmap.org/reverse
 
