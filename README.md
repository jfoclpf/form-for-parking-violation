<h1 align="center">
  <a href="https://play.google.com/store/apps/details?id=com.form.parking.violation&hl=pt"><img src="https://github.com/jfoclpf/form-for-parking-violation/blob/master/res/icon/android/512.png?raw=true" alt="logo" width="200"/></a>
  <br>
  Denúncia de Estacionamento!
  <br>
</h1>

[![Node.js CI](https://github.com/jfoclpf/form-for-parking-violation/actions/workflows/android.yml/badge.svg)](https://github.com/jfoclpf/form-for-parking-violation/actions/workflows/android.yml)
[![Node.js CI](https://github.com/jfoclpf/form-for-parking-violation/actions/workflows/ios.yml/badge.svg)](https://github.com/jfoclpf/form-for-parking-violation/actions/workflows/ios.yml)
[![js-standard-style][js-standard-style_img]][js-standard-style_url]
[![Donate with librepay](https://img.shields.io/liberapay/receives/joaopimentel1980.svg?logo=liberapay)](https://en.liberapay.com/joaopimentel1980)
[![Donate with librepay](https://img.shields.io/badge/donate-Donate-yellow?logo=liberapay)](https://en.liberapay.com/joaopimentel1980/donate)

[js-standard-style_img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[js-standard-style_url]: https://standardjs.com/

Aplicação móvel para submissão de queixa de estacionamento ilegal junto de autoridade policial, ao abrigo do n.º 5 do art.º 170.º do Código da Estrada.

O código está desenhado em Javascript para ser corrido num smartphone. Para tal faz uso da plataforma [Apache Cordova](https://cordova.apache.org/).

* A APP para Android está <a href="https://play.google.com/store/apps/details?id=com.form.parking.violation">aqui</a>.
* A APP para iOS está <a href="https://apps.apple.com/pt/app/den%C3%BAncia-estacionamento/id1560564781">aqui</a>.

## Como instalar e testar
### Requisitos, _debug_ e eventuais problemas

* ver [documentação](https://github.com/jfoclpf/form-for-parking-violation/blob/master/docs.md)

### Android

 1. Clone este projeto<br>`git clone https://github.com/jfoclpf/form-for-parking-violation`
 2. Entre na pasta recém criada<br>`cd form-for-parking-violation`
 3. Adicione a plataforma<br>`cordova platform add android`
 3. Corra `cordova build android` para construir o projeto na sua máquina. Em Android cria o ficheiro APK na pasta `platforms/android/build/outputs/apk`

### iOS
```
git clone https://github.com/jfoclpf/form-for-parking-violation.git
cd form-for-parking-violation
cordova platform add ios
open platforms/ios/Denúncia\ Estacionamento.xcworkspace/
```

## Contribuições são muito bem-vindas

 * Usamos StandardJS para o código
 * Respeite a estrutura dos ficheiros
 * Comente sempre o código (preferencialmente em Inglês), tal ajuda os outros a compreender as suas contribuiçes

## Licença

[GNU GPLv3](http://www.gnu.org/licenses/gpl-3.0.en.html)

## Na comunicação social

* [SIC Notícias](https://sicnoticias.pt/programas/poligrafo/2023-05-22-Ha-uma-app-para-denunciar-carros-mal-estacionados--03a2240d)
* [Polígrafo](https://poligrafo.sapo.pt/fact-check/e-possivel-denunciar-o-estacionamento-indevido-de-carros-atraves-de-uma-aplicacao-para-telemovel)
* <a href="https://www.jn.pt/motor-24/interior/carro-mal-estacionado-ja-pode-fazer-queixa-com-esta-app-8686603.html">Jornal de Notícias</a>
* <a href="https://www.dn.pt/motor-24/interior/carro-mal-estacionado-ja-pode-fazer-queixa-com-esta-app-8686600.html">Diário de Notícias</a>
* <a href="https://www.timeout.pt/lisboa/pt/blog/ha-uma-nova-app-para-fazer-queixinhas-de-estacionamento-ilegal-081417">Time Out</a>
* <a href="https://www.noticiasaominuto.com/tech/837146/ha-um-carro-a-bloquea-lo-faca-queixa-com-esta-aplicacao">Notícias ao Minuto</a>
* <a href="http://tek.sapo.pt/mobile/android/artigos/encontrou-um-carro-mal-estacionado-ha-uma-app-para-fazer-queixa">Tek Sapo</a>
* <a href="https://nit.pt/out-of-town/back-in-town/ha-nova-app-queixinhas-quem-nao-sabe-estacionar">Nit</a>
* <a href="http://www.turbo.pt/carro-mal-estacionado-ja-pode-queixa-esta-app/">Turbo</a>
* [pplware](https://pplware.sapo.pt/motores/veiculo-mal-estacionado-use-esta-app-para-denunciar-a-policia/)
* [Portugal News](https://www.theportugalnews.com/news/2023-05-24/new-app-to-report-illegally-parked-cars/77914)
