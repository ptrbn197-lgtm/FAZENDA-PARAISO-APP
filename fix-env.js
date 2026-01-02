const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const supabasePath = path.join(__dirname, 'lib', 'supabase.ts');

if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim();
    }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!url || !key) {
    console.error('Missing Supabase Config in .env.local');
    process.exit(1);
}

const supabaseContent = `import { createClient } from '@supabase/supabase-js'

// GERADO AUTOMATICAMENTE - NÃO EDITAR MANUALMENTE
const supabaseUrl = '${url}'
const supabaseAnonKey = '${key}'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

if (!supabaseAnonKey) {
    console.warn("⚠️ Supabase Anon Key is missing!")
}
`;

fs.writeFileSync(supabasePath, supabaseContent);
console.log('Successfully hardcoded Supabase credentials into lib/supabase.ts');
