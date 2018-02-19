# Denúncia Estacionamento

Formulário para submissão de queixa de estacionamento ilegal junto de autoridade policial, ao abrigo do n.º 5 do art.º 170.º do Código da Estrada. 

O código está desenhado em Javascript para ser corrido num smartphone. Para tal faz uso da plataforma <a href="https://cordova.apache.org/">Apache Cordova</a>. A pasta raiz do projeto faz referência à pasta `www/` de um projecto Cordova.

* A APP para Android está <a href="https://play.google.com/store/apps/details?id=com.form.parking.violation">aqui</a>.
* A APP para iOS está <a href="https://itunes.apple.com/pt/app/aqui-n%C3%A3o/id1335652238?mt=8">aqui</a>.

## Como instalar e testar

 1. <a href="https://cordova.apache.org/docs/en/latest/guide/cli/">Inicie um projecto Cordova</a>
 2. No recém-criado projeto entre na pasta `www/` e apague o seu conteúdo:<br> 
    `cd www/`<br>
    `rm -rf *`<br>
 3. De dentro da pasta `www/` faça uma colonagem do projeto<br>
    `git clone https://github.com/jfoclpf/form-for-parking-violation .` (inclua o ponto no final)
 4. Instale os componentes extra necessários<br>
    `cordova plugin add [nome_do_plugin]`<br>
    por exemplo `cordova plugin add cordova-plugin-camera`
 5. Corra `cordova build` para construir o projeto na sua máquina (em Android criar o ficheiro APK)

## Plugins necessários

* cordova-plugin-camera-with-exif "Camera" (with EXIF information)
* cordova-plugin-compat "Compat"
* cordova-plugin-email-composer "EmailComposer"
* cordova-plugin-file "File"
* cordova-plugin-geolocation "Geolocation"
* cordova-plugin-googlemaps "cordova-plugin-googlemaps"
* cordova-plugin-network-information "Network Information"
* cordova-plugin-statusbar "StatusBar"
* cordova-plugin-whitelist "Whitelist"

## Contribuições são muito bem-vindas
 
 * respeite a estrutura dos ficheiros
 * comente sempre o código (preferencialmente em Inglês), tal ajuda os outros a compreender as suas contribuiçes
 * para identações, use sempre 4 espaços (não use 2 espaços, nem tabulaçes, ou seja TAB)

## Licença

GNU GPLv3<br>
http://www.gnu.org/licenses/gpl-3.0.en.html <br>
http://choosealicense.com/licenses/gpl-3.0/

## Na comunicação social

* <a href="http://www.jornaleconomico.sapo.pt/noticias/estacionamentos-selvagens-ja-existe-uma-app-para-denuncia-los-189812">Jornal Económico</a>
* <a href="https://www.jn.pt/motor-24/interior/carro-mal-estacionado-ja-pode-fazer-queixa-com-esta-app-8686603.html">Jornal de Notícias</a>
* <a href="https://www.dn.pt/motor-24/interior/carro-mal-estacionado-ja-pode-fazer-queixa-com-esta-app-8686600.html">Diário de Notícias</a>
* <a href="https://www.timeout.pt/lisboa/pt/blog/ha-uma-nova-app-para-fazer-queixinhas-de-estacionamento-ilegal-081417">Time Out</a>
* <a href="https://www.noticiasaominuto.com/tech/837146/ha-um-carro-a-bloquea-lo-faca-queixa-com-esta-aplicacao">Notícias ao Minuto</a>
* <a href="http://tek.sapo.pt/mobile/android/artigos/encontrou-um-carro-mal-estacionado-ha-uma-app-para-fazer-queixa">Tek Sapo</a>
* <a href="https://nit.pt/out-of-town/back-in-town/ha-nova-app-queixinhas-quem-nao-sabe-estacionar">Nit</a>
* <a href="http://www.turbo.pt/carro-mal-estacionado-ja-pode-queixa-esta-app/">Turbo</a>
