# Guia de Hospedagem Própria - Gestão Seringal

Este guia explica como hospedar o aplicativo em seu próprio servidor com domínio personalizado, completamente independente de serviços de terceiros.

## Opções de Hospedagem

### 1. VPS (Servidor Virtual Privado) - Recomendado

Provedores recomendados:
- DigitalOcean (a partir de $6/mês)
- Linode (a partir de $5/mês)
- Vultr (a partir de $5/mês)
- AWS EC2 (varia conforme uso)
- Google Cloud Compute Engine
- Hostinger VPS (Brasil, a partir de R$30/mês)
- Contabo (Alemanha, muito barato)

### 2. Hospedagem Compartilhada

Para tráfego baixo:
- Hostinger (Brasil)
- HostGator
- Locaweb
- UOL Host

## Configuração do Servidor (VPS)

### Passo 1: Conectar ao Servidor

\`\`\`bash
ssh root@seu-servidor-ip
\`\`\`

### Passo 2: Instalar Node.js e npm

\`\`\`bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Verificar instalação
node --version
npm --version
\`\`\`

### Passo 3: Instalar Nginx

\`\`\`bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
\`\`\`

### Passo 4: Configurar Firewall

\`\`\`bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
\`\`\`

### Passo 5: Fazer Upload do Projeto

\`\`\`bash
# No seu computador, fazer build
npm run build

# Copiar para servidor
scp -r out/* root@seu-servidor-ip:/var/www/gestao-seringal/
\`\`\`

Ou use Git:

\`\`\`bash
# No servidor
cd /var/www
git clone seu-repositorio gestao-seringal
cd gestao-seringal
npm install
npm run build
\`\`\`

### Passo 6: Configurar Nginx

Crie o arquivo `/etc/nginx/sites-available/gestao-seringal`:

\`\`\`nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;
    
    root /var/www/gestao-seringal/out;
    index index.html;
    
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
\`\`\`

Ativar o site:

\`\`\`bash
ln -s /etc/nginx/sites-available/gestao-seringal /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
\`\`\`

## Configuração de Domínio

### Passo 1: Registrar Domínio

Registre seu domínio em:
- Registro.br (domínios .br)
- GoDaddy
- Namecheap
- Google Domains
- Hostinger

### Passo 2: Configurar DNS

No painel do seu registrador de domínio, adicione:

\`\`\`
Tipo: A
Nome: @
Valor: IP-DO-SEU-SERVIDOR
TTL: 3600

Tipo: A
Nome: www
Valor: IP-DO-SEU-SERVIDOR
TTL: 3600
\`\`\`

### Passo 3: Instalar SSL (HTTPS)

\`\`\`bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obter certificado SSL gratuito
certbot --nginx -d seudominio.com.br -d www.seudominio.com.br

# Renovação automática
certbot renew --dry-run
\`\`\`

## Atualizar o Aplicativo

\`\`\`bash
cd /var/www/gestao-seringal
git pull
npm install
npm run build
systemctl reload nginx
\`\`\`

## Monitoramento e Manutenção

### Logs do Nginx

\`\`\`bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
\`\`\`

### Backup Automático

Crie script `/root/backup.sh`:

\`\`\`bash
#!/bin/bash
tar -czf /root/backups/gestao-$(date +%Y%m%d).tar.gz /var/www/gestao-seringal
find /root/backups -mtime +30 -delete
\`\`\`

Adicione ao cron:

\`\`\`bash
crontab -e
# Adicionar: 0 2 * * * /root/backup.sh
\`\`\`

## Custos Estimados

### Opção Econômica (R$50-80/mês)
- Domínio .com.br: R$40/ano
- VPS Básico: $5-6/mês (R$25-30)
- SSL: Grátis (Let's Encrypt)

### Opção Média (R$150-200/mês)
- Domínio .com: R$50/ano
- VPS Médio: $20/mês (R$100)
- Backup: Incluído

### Opção Premium (R$300+/mês)
- Domínio premium
- VPS com mais recursos
- CDN (Cloudflare - grátis ou pago)
- Backup profissional

## Segurança

1. Sempre use HTTPS
2. Configure firewall adequadamente
3. Mantenha sistema atualizado
4. Faça backups regulares
5. Use senhas fortes
6. Configure fail2ban para proteção contra ataques

## Sugestões de Domínio

- gestao-seringal.com.br
- fazenda-paraiso.com.br
- seringal-paraiso.com.br
- borracha-natural.com.br
- controle-sangria.com.br

## Suporte

Para dúvidas sobre hospedagem, consulte a documentação dos provedores ou contrate um administrador de sistemas.
