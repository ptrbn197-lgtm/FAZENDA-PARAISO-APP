---
description: Como gerar e instalar o aplicativo Android (APK)
---

Este workflow automatiza e detalha os passos para levar o código do computador para o celular.

1.  **Verificar Dependências**
    -   Execute `npm install` para garantir que o Capacitor e o Next.js estão prontos.

2.  **Construir e Sincronizar**
    // turbo
    -   Execute `npm run build:android`. Isso gerará a pasta `out` e atualizará o projeto Android.

3.  **Gerar APK de Teste**
    // turbo
    -   Execute `npm run apk:debug`.
    -   O arquivo estará em: `android/app/build/outputs/apk/debug/app-debug.apk`.

4.  **Assinar/Distribuir (Opcional)**
    -   Para uma versão final sem avisos do Android, use o Android Studio para gerar um "Signed Bundle/APK".

5.  **Instalação Direta**
    -   Conecte o celular via USB.
    -   Habilite a "Depuração USB" nas opções de desenvolvedor do Android.
    -   Execute `npx cap run android` para instalar e abrir o app diretamente de uma vez.
