## Requisitos


### [Node JS](https://nodejs.org/en/download/)

O projeto necessita de alguns pacotes `npm`, sendo que o `npm` vem instalado com o `nodejs`.
Alguns scripts do projeto também fazem uso do `nodejs`.

### [Apache Cordova](https://cordova.apache.org/)

Este projeto faz uso de <a href="https://cordova.apache.org/">Apache Cordova</a> para converter código HTML5 e Javascript para uma aplicação de dispositivo móvel, como Android ou iOS. Precisa, portanto, de ter Apache Cordova instalado na sua máquina.

```
npm install -g cordova
```

### [gradle](https://docs.gradle.org/current/userguide/what_is_gradle.html)

O gradle é usado para fazer o `build` dos projetos Apache Cordova

### Java

É uma exigência do Apache Cordova a instalação do Java

Em Debian/Ubuntu, o comando para instalar as versões necessárias, é

```sh
sudo apt install openjdk-8-jdk openjdk-17-jdk openjdk-21-jdk
```

### [ADB](https://www.xda-developers.com/install-adb-windows-macos-linux/)

O ADB é usado para testar a APP no seu telemóvel Android

## Eventuais problemas com versões do Java

Um problema comum pode estar relacionado com as versões do Java. Para saber a versão corra `java -version` e `javac -version` (compilador).

Em Debian/Ubuntu para escolher a versão correta, corra `sudo update-alternatives --config javac`. Em macOS, por exemplo, `export JAVA_HOME=/usr/libexec/java_home -v 1.11`.

Edite também a variável `JAVA_HOME` em conformidade com a versão pretendida.

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

## Testar num emulador

Instalar o emulador

```
[sudo] sdkmanager --install "emulator"
```

Instalar as plataformas de teste, exemplo para Android 16 (API level 36):

```
[sudo] sdkmanager --install "emulator;36.3.4" "platforms;android-36.1" "build-tools;36.1.0"
```

Para ver todas as plataformas `sdkmanager --list`

Criar o dispositivo virtual (AVD), exemplo:

```
avdmanager create avd -n emulator -k "system-images;android-32;google_apis;x86_64"
```

Confirmar que ficou instalado

```
avdmanager list avd
```

Correr o emulador

```
cordova emulate android --target=emulator
```

## Plugins necessários

* ver ficheiro `package.json`.
