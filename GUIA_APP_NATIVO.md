# Guia Completo - App Nativo Android

## O que é este App?

Este é um **aplicativo Android 100% nativo** que funciona completamente **offline** após instalado. Todos os ícones, imagens e funcionalidades estão embutidos no APK.

## Características do App Nativo

✅ **Funciona 100% Offline** - Todos os recursos são armazenados localmente  
✅ **Ícones Nativos** - Todos os ícones (lucide-react) são empacotados no JavaScript  
✅ **Armazenamento Local** - Usa localStorage para salvar dados no dispositivo  
✅ **Sem Dependências Web** - Não precisa de internet após instalação  
✅ **Performance Nativa** - WebView otimizada do Android  

## Como Gerar o APK

### Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Java JDK 17**
3. **Android Studio** (ou Android SDK)
4. **Gradle** (vem com o Android Studio)

### Passo a Passo

1. **Instale as dependências:**
\`\`\`bash
npm install
\`\`\`

2. **Gere o APK de Debug (para testes):**
\`\`\`bash
npm run apk:debug
\`\`\`

O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Gere o APK de Release (para produção):**
\`\`\`bash
npm run apk:release
\`\`\`

O APK estará em: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Como Instalar no Celular

### Método 1: USB (Recomendado)

1. Conecte o celular no computador via USB
2. Ative "Depuração USB" nas configurações do desenvolvedor do Android
3. Copie o APK para o celular:
\`\`\`bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

### Método 2: Download Direto

1. Copie o APK para um servidor ou serviço de arquivos
2. No celular, baixe o APK
3. Habilite "Instalar de fontes desconhecidas" nas configurações
4. Toque no APK baixado para instalar

## Funcionamento Offline

O app funciona **100% offline** usando:

1. **Service Worker** - Cacheia todos os arquivos HTML, CSS e JS
2. **localStorage** - Armazena todos os dados localmente no dispositivo
3. **Ícones Embutidos** - Todos os ícones lucide-react são JavaScript empacotado
4. **Imagens Locais** - Todas as imagens estão na pasta `/public`

### O que funciona offline?

✅ Todo o dashboard  
✅ Registro de produção  
✅ Controle de presença  
✅ Calendário de estimulação  
✅ Inventário de árvores  
✅ Controle de pragas  
✅ Ranking de performance  
✅ Gerenciamento de tarefas  

### O que precisa de internet?

⚠️ Apenas compartilhamento via WhatsApp (função opcional)

## Estrutura do App Nativo

\`\`\`
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml      # Configurações do app
│   │   ├── java/                    # Código Java nativo
│   │   └── res/                     # Recursos (ícones, splash)
│   └── build.gradle                 # Configurações de build
└── build.gradle                     # Configurações globais
\`\`\`

## Ícones e Assets

Todos os ícones são do **lucide-react** e ficam empacotados no JavaScript compilado. Não há dependência de CDN ou recursos externos.

### Ícones do App

- `/icon-192.jpg` - Ícone 192x192 (tela inicial)
- `/icon-512.jpg` - Ícone 512x512 (alta resolução)
- Ícones Android: `android/app/src/main/res/mipmap-*/`

## Assinatura do APK (Para Google Play)

Para publicar na Play Store, você precisa assinar o APK:

1. **Gere uma keystore:**
\`\`\`bash
keytool -genkey -v -keystore gestao-seringal.keystore -alias gestao -keyalg RSA -keysize 2048 -validity 10000
\`\`\`

2. **Configure em `android/app/build.gradle`:**
\`\`\`gradle
android {
    signingConfigs {
        release {
            storeFile file('../../gestao-seringal.keystore')
            storePassword 'SUA_SENHA'
            keyAlias 'gestao'
            keyPassword 'SUA_SENHA'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
\`\`\`

3. **Gere o APK assinado:**
\`\`\`bash
npm run apk:release
\`\`\`

## Solução de Problemas

### APK não instala

1. Verifique se "Fontes desconhecidas" está habilitado
2. Desinstale versões anteriores
3. Verifique se há espaço suficiente no dispositivo

### App não abre

1. Verifique os logs do Android:
\`\`\`bash
adb logcat | grep -i gestao
\`\`\`

2. Reinstale o app
3. Limpe os dados do app nas configurações

### Ícones não aparecem

Os ícones são do lucide-react e estão empacotados no JavaScript. Se não aparecerem:

1. Verifique se o build foi completo: `npm run build`
2. Verifique se o Capacitor sincronizou: `npx cap sync android`
3. Limpe o cache e rebuilde: `cd android && ./gradlew clean`

## Performance

O app é otimizado para funcionar nativamente:

- **WebView nativa do Android** - Performance similar a apps nativos
- **Cache agressivo** - Carrega instantaneamente após primeira execução
- **Sem requisições de rede** - Tudo está local
- **localStorage** - Acesso instantâneo aos dados

## Atualizações

Para atualizar o app:

1. Incremente a versão em `package.json`
2. Gere novo APK
3. Instale sobre a versão antiga (preserva os dados)

## Suporte

- **Android**: Versão 7.0+ (API 24+)
- **Tamanho do APK**: ~15-20 MB
- **Armazenamento necessário**: ~50 MB
