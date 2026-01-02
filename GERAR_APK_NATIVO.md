# Como Gerar APK Nativo Android

Este guia mostra como transformar o aplicativo Next.js em um APK nativo Android usando Capacitor.

## Pré-requisitos

1. **Node.js e npm** instalados
2. **Java JDK 17** instalado
3. **Android Studio** instalado (ou Android SDK Command Line Tools)
4. **Gradle** (vem com Android Studio)

### Verificar instalações:

\`\`\`bash
node -v
npm -v
java -version
\`\`\`

## Passo a Passo para Gerar APK

### 1. Instalar Dependências

\`\`\`bash
npm install
\`\`\`

### 2. Gerar APK Debug (para testes)

\`\`\`bash
npm run apk:debug
\`\`\`

O APK será gerado em:
\`\`\`
android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

### 3. Gerar APK Release (para distribuição)

\`\`\`bash
npm run apk:release
\`\`\`

O APK será gerado em:
\`\`\`
android/app/build/outputs/apk/release/app-release.apk
\`\`\`

### 4. Instalar no Dispositivo

#### Via USB:

\`\`\`bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

#### Via Transferência de Arquivo:

1. Copie o APK para o celular
2. Abra o arquivo no celular
3. Permita instalação de fontes desconhecidas
4. Instale o aplicativo

## Comandos Úteis

### Sincronizar código com Android:

\`\`\`bash
npm run build:android
\`\`\`

### Abrir projeto no Android Studio:

\`\`\`bash
npm run open:android
\`\`\`

### Build manual no Android Studio:

1. Execute: \`npm run open:android\`
2. No Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
3. Aguarde o build completar
4. Clique em "locate" para encontrar o APK

## Características do App Nativo

✅ **100% Offline** - Funciona sem internet após instalação
✅ **Armazenamento Local** - Todos os dados salvos no dispositivo
✅ **Performance Nativa** - Usa WebView otimizado do Android
✅ **Ícone Próprio** - Aparece na tela inicial como app nativo
✅ **Splash Screen** - Tela de abertura profissional
✅ **Sem Barra de Navegador** - Interface limpa e nativa

## Solução de Problemas

### Erro: "JAVA_HOME not found"

Configure a variável de ambiente:
\`\`\`bash
export JAVA_HOME=/caminho/para/jdk-17
\`\`\`

### Erro: "Android SDK not found"

Defina o caminho do SDK:
\`\`\`bash
export ANDROID_HOME=/caminho/para/android-sdk
\`\`\`

### APK não instala

1. Ative "Fontes desconhecidas" nas configurações
2. Verifique se há espaço no dispositivo
3. Desinstale versões anteriores do app

### Build falhou

Limpe o cache do Gradle:
\`\`\`bash
cd android
./gradlew clean
cd ..
npm run apk:debug
\`\`\`

## Publicar na Google Play Store

Para publicar na Play Store, você precisa assinar o APK com uma chave:

1. Crie uma keystore
2. Configure em \`android/app/build.gradle\`
3. Gere o APK assinado
4. Faça upload na Play Console

Consulte a documentação oficial do Android para mais detalhes sobre assinatura de apps.
