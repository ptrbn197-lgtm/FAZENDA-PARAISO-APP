# 🚀 Guia Completo: Gerar APK do Seringal Fazenda Paraíso

## ✨ Sobre o App
- **Nome**: Seringal Fazenda Paraíso
- **Versão**: 1.0.0
- **Tipo**: App Nativo Android 100% Offline
- **Tamanho**: ~50MB (APK final)

## 📋 Pré-requisitos

Antes de gerar o APK, você precisa ter instalado:

1. **Node.js** (v18 ou superior)
   - Download: https://nodejs.org/
   - Verificar: `node --version`

2. **Java Development Kit (JDK)** (versão 11 ou 17)
   - Download: https://www.oracle.com/java/technologies/downloads/
   - Verificar: `java -version`

3. **Android SDK**
   - Download: https://developer.android.com/studio
   - Instalar via Android Studio ou manualmente

4. **Git** (opcional, para clonar o projeto)
   - Download: https://git-scm.com/

## 🔧 Configuração Inicial

### 1. Clonar ou Baixar o Projeto
\`\`\`bash
# Via Git
git clone <URL_DO_REPOSITORIO>
cd seringal-fazenda-paraiso

# Ou baixar direto no v0 e extrair o ZIP
\`\`\`

### 2. Instalar Dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configurar Variáveis de Ambiente
Criar arquivo `.env.local` na raiz do projeto:
\`\`\`
NEXT_PUBLIC_APP_NAME=Seringal Fazenda Paraíso
NODE_ENV=production
\`\`\`

## 🏗️ Gerar o APK

### Opção 1: APK Debug (Rápido, para Testes)
\`\`\`bash
npm run apk:debug
\`\`\`
- ⏱️ Tempo: ~5-10 minutos
- 📁 Local: `android/app/build/outputs/apk/debug/app-debug.apk`
- ✅ Pronto para instalar em emulador ou dispositivo de teste

### Opção 2: APK Release (Final, Otimizado)
\`\`\`bash
npm run apk:release
\`\`\`
- ⏱️ Tempo: ~10-15 minutos
- 📁 Local: `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- 📦 Versão otimizada, menor tamanho, melhor performance

## 📱 Instalar no Dispositivo

### Via ADB (Android Debug Bridge)
\`\`\`bash
# Verificar se dispositivo está conectado
adb devices

# Instalar o APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Iniciar o app
adb shell am start -n com.seringal.gestao/com.seringal.gestao.MainActivity
\`\`\`

### Via Transferência Direta
1. Conecte seu telefone ao PC
2. Copie o arquivo APK para a pasta Downloads do telefone
3. Abra o Gerenciador de Arquivos no telefone
4. Navegue até Downloads
5. Toque em `app-debug.apk` ou `app-release-unsigned.apk`
6. Toque em "Instalar"
7. Permita a instalação de "Fontes desconhecidas" se solicitado

### Via QR Code
1. Depois de gerar o APK, hospede-o em um servidor
2. Crie um QR code apontando para o download
3. Escaneie com seu telefone e baixe/instale

## ✅ Verificação Pós-Instalação

Após instalar o app:

1. ✔️ Toque no ícone "Seringal Fazenda Paraíso"
2. ✔️ Faça login (credenciais padrão: admin/1234)
3. ✔️ Verifique se os dados estão carregando
4. ✔️ Teste offline (desative WiFi/dados)
5. ✔️ Navegue por todas as abas para confirmar funcionalidade

## 🐛 Solução de Problemas

### Erro: "java: command not found"
\`\`\`bash
# Instale o JDK
# Windows: Baixe de https://www.oracle.com/java/
# Mac: brew install openjdk@17
# Linux: sudo apt install openjdk-17-jdk
\`\`\`

### Erro: "android: command not found"
\`\`\`bash
# Configure Android SDK
# Adicione ao PATH do seu sistema:
# export PATH=$PATH:~/Android/Sdk/tools:~/Android/Sdk/platform-tools
\`\`\`

### APK não instala
\`\`\`bash
# Desinstale versão anterior
adb uninstall com.seringal.gestao

# Reinstale
adb install android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

### App não funciona offline
- Verifique se o Service Worker está ativo (Configurações > Aplicativos > Seringal > Permissões)
- Limpe cache da app (Configurações > Aplicativos > Seringal > Armazenamento > Limpar Cache)

## 📊 Especificações do App

- **SDK Mínimo**: Android 8.0 (API 26)
- **SDK Alvo**: Android 14+ (API 34+)
- **Arquitetura**: ARM64, ARMv7
- **Permissões**: Apenas armazenamento local (100% offline)
- **Tamanho Instalado**: ~80-100MB com cache

## 🚀 Distribuição

### Compartilhar o APK
1. Gere a versão Release: `npm run apk:release`
2. Renomeie para algo descritivo: `seringal-v1.0.0.apk`
3. Compartilhe via:
   - Google Drive
   - Dropbox
   - Email
   - WhatsApp
   - Site pessoal

### Publicar na Google Play Store (Futuro)
- Será necessário:
  - Conta Google Developer ($25 uma vez)
  - Assinatura digital do APK
  - Screenshots e descrição
  - Política de privacidade

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todas as dependências estão instaladas
2. Execute `npm install` novamente
3. Delete a pasta `android/.gradle` e recrie
4. Reinicie seu computador

## ✨ Pronto!

Seu app Seringal Fazenda Paraíso está pronto para ser compartilhado e instalado em qualquer dispositivo Android! 🎉
