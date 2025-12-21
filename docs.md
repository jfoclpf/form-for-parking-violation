## Requisitos

Todas estas instruções estão otimizadas para uma máquina Ubuntu.
É possível instalar noutras máquinas, mas as instruções terão de ser adaptadas em conformidade.

### [Node JS](https://nodejs.org/en/download/)

O projeto necessita de alguns pacotes `npm`, sendo que o `npm` vem instalado com o `nodejs`.
Alguns scripts do projeto também fazem uso do `nodejs`.

### [Apache Cordova](https://cordova.apache.org/)

Este projeto faz uso de <a href="https://cordova.apache.org/">Apache Cordova</a> para converter código HTML5 e Javascript para uma aplicação de dispositivo móvel, como Android ou iOS. Precisa, portanto, de ter Apache Cordova instalado na sua máquina.

```
[sudo] npm install -g cordova
```

### Gradle

O gradle é usado para fazer o `build` dos projetos Apache Cordova. Instruções de instalação [aqui](https://docs.gradle.org/current/userguide/installation.html#ex-installing-manually).

### Java

É uma exigência do Apache Cordova a instalação do Java (precisamos de várias versões)

```sh
sudo apt install openjdk-8-jdk openjdk-17-jdk openjdk-21-jdk
```

### [ADB](https://www.xda-developers.com/install-adb-windows-macos-linux/)

O ADB é usado para testar a APP no seu telemóvel Android

```sh
sudo apt install adb
```

### sdkmanager

Preciamos apenas dos CMD line tools, descarregar [aqui](https://developer.android.com/studio#command-line-tools-only), e instalar em

```sh
/usr/lib/android-sdk/cmdline-tools/latest
```

**Devemos ter ambas** as diretorias `bin/` e `lib/` em `$ANDROID_SDK_ROOT/cmdline-tools/latest/`:
```sh
$ ls /usr/lib/android-sdk/cmdline-tools/latest/
bin  lib  NOTICE.txt  source.properties
```

### Variáveis do sistema

O ficheiro `~/.profile` ou `~/.bashrc` deve conter estas linhas:

```bash
# Android SDK
export ANDROID_SDK_ROOT=/usr/lib/android-sdk
export ANDROID_HOME=/usr/lib/android-sdk

PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools"
```

## Eventuais problemas 
### Java

Um problema comum pode estar relacionado com as versões do Java. Para saber a versão corra `java -version` e `javac -version` (compilador).

Em Debian/Ubuntu para escolher a versão correta, corra `sudo update-alternatives --config javac`.

Edite também a variável `JAVA_HOME` em conformidade com a versão pretendida.

### Gradle

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
