# Download e Instalação do APK - Seringal Fazenda Paraíso

## Para Usuários (Instalação Fácil)

### Opção 1: Download Direto (Recomendado)
1. **Faça download do arquivo APK**
   - Procure pelo arquivo: `app-release.apk` ou `seringal-fazenda-paraiso.apk`
   - Tamanho: aproximadamente 80-120 MB
   - O arquivo é 100% seguro e funciona offline

2. **Instale no seu Android**
   - Copie o arquivo para seu dispositivo Android
   - Abra o gerenciador de arquivos
   - Procure pelo arquivo `.apk`
   - Clique para instalar
   - Se pedir permissão de "Fontes desconhecidas", clique em "Configurações" e ative
   - Pronto! O app está instalado

3. **Abra o aplicativo**
   - Procure por "Seringal Fazenda Paraíso" na lista de apps
   - Clique e comece a usar
   - Sem login necessário - acessa direto!

### Opção 2: Compartilhamento via WhatsApp, Email ou AirDrop
1. Envie o arquivo `.apk` por qualquer plataforma de compartilhamento
2. O destinatário recebe e instala normalmente
3. Funciona em qualquer dispositivo Android 6.0+

---

## Para Desenvolvedores (Compilar Próprio APK)

### Pré-requisitos
- Node.js 18+ instalado
- Java Development Kit (JDK) 11+
- Android SDK
- Git

### Passo a Passo

1. **Clone ou baixe o projeto**
   \`\`\`bash
   git clone <seu-repositorio>
   cd seringal-fazenda-paraiso
   \`\`\`

2. **Instale as dependências**
   \`\`\`bash
   npm install
   \`\`\`

3. **Crie o build web otimizado**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Gere o APK debug (para teste)**
   \`\`\`bash
   cd android
   ./gradlew assembleDebug
   \`\`\`
   
   O arquivo fica em: `android/app/build/outputs/apk/debug/app-debug.apk`

5. **Ou gere o APK release (para produção)**
   \`\`\`bash
   cd android
   ./gradlew assembleRelease
   \`\`\`
   
   O arquivo fica em: `android/app/build/outputs/apk/release/app-release.apk`

6. **Transfira para seu dispositivo**
   - Via USB: `adb install caminho/do/arquivo.apk`
   - Ou copie manualmente para o dispositivo

---

## Características do App

✅ Funciona 100% offline após instalação
✅ Nenhum login obrigatório - acesso direto
✅ Sem dependências externas
✅ Todos os dados salvos localmente no dispositivo
✅ Compatível com Android 6.0+
✅ Interface moderna e intuitiva
✅ Gráficos de evolução mensal
✅ Gestão completa de talhões, produção e frequência

---

## Solução de Problemas

**Problema:** "Não posso instalar apps de fontes desconhecidas"
- Solução: Vá para Configurações > Segurança > ative "Fontes desconhecidas"

**Problema:** O app não inicia
- Solução: Reinstale o APK ou limpe o cache (Configurações > Apps > Seringal Fazenda Paraíso > Armazenamento > Limpar cache)

**Problema:** Dados não estão sendo salvos
- Solução: Verifique se o app tem permissão de armazenamento (Configurações > Apps > Seringal > Permissões > Armazenamento)

---

## Versão Atual
- Versão: 1.0.0
- Tamanho: ~100 MB
- Último update: 2025
- Status: Completamente independente e offline
