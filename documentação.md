## Requisitos

### [Apache Cordova](https://cordova.apache.org/)

Este projeto faz uso de <a href="https://cordova.apache.org/">Apache Cordova</a> para converter código HTML5 e Javascript para uma aplicação de dispositivo móvel, como Android ou iOS. Precisa, portanto, de ter Apache Cordova instalado na sua máquina.

### [Node JS](https://nodejs.org/en/download/)

O projeto necessita de alguns pacotes `npm`, sendo que o `npm` vem instalado com o `nodejs`.
Alguns scripts do projeto também fazem uso do `nodejs`.

### [gradle](https://docs.gradle.org/current/userguide/what_is_gradle.html)

O gradle é usado para fazer o `build` dos projetos Apache Cordova

### Java 8

É uma exigência do Apache Cordova que seja a versão 8. Em Debian/Ubuntu `sudo apt install openjdk-8-jdk`

### [ADB](https://www.xda-developers.com/install-adb-windows-macos-linux/)

O ADB é usado para testar a APP no seu telemóvel Android

## Eventuais problemas com versões do Java

Um problema comum está relacionado com as versões do Java, considerando que o Apache Cordova exige Java 8.

Para saber a versão corra `java -c` e `javac -version` (compilador).

### Debian/Ubuntu
Caso haja várias versões instaladas, para escolher a versão correta, corra:

`sudo update-alternatives --config javac` 

ou de uma forma mais automática para excolher a versão 8

`sudo update-java-alternatives -s $(sudo update-java-alternatives -l | grep 8 | cut -d " " -f1)`

### macos
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`

## Eventuais problemas com Gradle

O [gradle](https://docs.gradle.org/current/userguide/what_is_gradle.html) é um executor de tarefas de compilação e é instalado aquando de `cordova build`. Pode dar problemas nesse comando (erro: `Could not determine java version from 'x.x.x'`). O gradle pode envolver diferentes versões:

- a versão global: `gradle -v`
- a versão local do project (wrapper): `./platforms/android/gradlew -v`

Tal pode dar problemas porque diferentes versões de gradle dependem de diferentes versões de java. Verificar a variável `JAVA_HOME` com `echo $JAVA_HOME`. Para resolver o problema mudar esta variável e associá-la a outras versões de java, por exemplo:

`export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/` ou<br>
`export JAVA_HOME=/usr/lib/jvm/jdk1.8.0_131/` ou<br>
mesmo apagar com `export JAVA_HOME=`

## Testar num smartphone

Para testar num smartphone Android precisa de ativar nas configurações do smartphone o [Developer options](https://developer.android.com/studio/command-line/adb#Enabling) e dentro desse menu precisa de ativar a opção <b>USB debugging</b>.

Depois corra numa linha de comandos

`adb devices`

para listar os dispositivos Android detectados. Caso o dispositivo seja detetado, corra

`cordova run android --device`

Para fazer debug no Chrome aceda a `chrome://inspect/#devices`

## Plugins necessários

* ver ficheiro `package.json`.
