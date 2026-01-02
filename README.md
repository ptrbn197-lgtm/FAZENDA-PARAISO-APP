# Sistema de Gestão do Seringal

Sistema completo e nativo para gestão de sangria e produção de borracha natural. Funciona 100% offline com armazenamento local.

## Características

- **100% Offline**: Funciona completamente sem conexão à internet
- **Multi-plataforma**: Android, Windows, macOS e Linux
- **Dados Seguros**: Armazenamento local no dispositivo
- **Rápido**: Performance nativa otimizada
- **Interface Moderna**: Design responsivo e intuitivo

## Funcionalidades

- Gestão de tarefas de sangria
- Controle de produção e pesagens
- Registro de inspeções
- Controle de pragas e doenças
- Gestão de equipe e avaliações
- Relatórios e estatísticas
- Múltiplos usuários e perfis

## Download e Instalação

### Para Usuários Finais

Acesse a página de download e escolha a versão para seu dispositivo:
- **Android**: Baixe o APK (gestao-seringal.apk) e instale
- **Windows**: Baixe o instalador EXE
- **macOS**: Baixe o DMG
- **Linux**: Baixe o AppImage

**Importante para Android:** 
Após baixar o APK, permita "Instalação de fontes desconhecidas" nas configurações do seu dispositivo para instalar o aplicativo.

### Para Desenvolvedores

#### Pré-requisitos

**Para todas as plataformas:**
- Node.js 18+ 
- npm ou yarn

**Para Android:**
- Android Studio
- Java JDK 17+
- Android SDK

**Para Desktop (Tauri):**
- Rust (instale via rustup.rs)
- Build tools do sistema operacional

## Comandos de Build

### Android

\`\`\`bash
# Instalar dependências
npm install

npm run postbuild

# Inicializar Capacitor (primeira vez)
npm run cap:init

# Adicionar plataforma Android (primeira vez)
npm run cap:add

# Build de desenvolvimento
npm run android:build

npm run build:apk

# Build APK de produção (assinado)
npm run build:apk:release
\`\`\`

**Os APKs são copiados automaticamente para `public/downloads/seringal-app.apk`**

### Windows / macOS / Linux

\`\`\`bash
# Instalar Rust (primeira vez)
# Visite: https://rustup.rs

# Instalar dependências
npm install

npm run postbuild

# Build de desenvolvimento
npm run tauri:dev

npm run tauri:build
\`\`\`

**Os instaladores são copiados automaticamente para `public/downloads/`:**
- Windows: `seringal-app-setup.exe`
- macOS: `seringal-app.dmg`
- Linux: `seringal-app.AppImage`

## 📦 Distribuição Automática dos Arquivos

Os scripts de build agora copiam automaticamente os arquivos gerados para a pasta `public/downloads/`. Você não precisa copiar manualmente!

Após executar os builds, os arquivos estarão em:

\`\`\`
public/
  downloads/
    seringal-app.apk           # Gerado por: npm run build:apk
    seringal-app-setup.exe     # Gerado por: npm run tauri:build (Windows)
    seringal-app.dmg           # Gerado por: npm run tauri:build (macOS)
    seringal-app.AppImage      # Gerado por: npm run tauri:build (Linux)
\`\`\`

Os botões de download na página `/download` apontam para esses arquivos automaticamente.

## Estrutura do Projeto

\`\`\`
.
├── app/                    # Páginas Next.js
│   ├── page.tsx           # App principal (redireciona para /download na web)
│   └── download/          # Página de download
├── components/            # Componentes React
├── lib/                   # Lógica e utilitários
│   ├── storage.ts        # Armazenamento local (localStorage)
│   └── auth-context.tsx  # Autenticação
├── public/               # Arquivos estáticos
│   └── downloads/        # Pasta para arquivos de download
├── scripts/              # Scripts de automação de build
│   ├── prepare-downloads.js  # Prepara diretório de downloads
│   ├── copy-apk.js          # Copia APK após build
│   └── copy-desktop.js      # Copia apps desktop após build
├── src-tauri/           # Configuração Tauri (desktop)
├── android/             # Projeto Android (gerado pelo Capacitor)
└── capacitor.config.ts  # Configuração Capacitor (mobile)
\`\`\`

## Desenvolvimento

\`\`\`bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento web
npm run dev

# Rodar em modo de desenvolvimento Android
npm run android:build

# Rodar em modo de desenvolvimento Desktop
npm run tauri:dev
\`\`\`

## Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Mobile**: Capacitor
- **Desktop**: Tauri
- **Armazenamento**: localStorage (client-side)
- **Gráficos**: Recharts

## Credenciais Padrão

**Administrador:**
- Usuário: `admin`
- Senha: `admin123`

**Fiscal:**
- Usuário: `fiscal`
- Senha: `fiscal123`

## Suporte

Para problemas ou dúvidas, consulte o arquivo [COMO_USAR.md](COMO_USAR.md) para documentação completa.

## Licença

© 2025 Fazenda Paraíso. Todos os direitos reservados.
