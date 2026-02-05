import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('🔍 Verificando conexión a Supabase...\n');

    try {
        // Verificar tablas existentes
        const tables = ['profiles', 'vocabulary', 'weekly_plans'];

        for (const table of tables) {
            console.log(`📊 Verificando tabla: ${table}`);

            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`   ❌ Error: ${error.message}`);
            } else {
                console.log(`   ✅ Tabla encontrada (${count || 0} registros)`);
            }
        }

        console.log('\n✨ Verificación completada!\n');

        // Mostrar estructura de cada tabla
        console.log('📋 Obteniendo estructura de las tablas...\n');

        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (data && data.length > 0) {
                console.log(`\n🔹 Estructura de ${table}:`);
                console.log(JSON.stringify(Object.keys(data[0]), null, 2));
            } else if (!error) {
                console.log(`\n🔹 Tabla ${table} está vacía`);
            }
        }

    } catch (err) {
        console.error('❌ Error general:', err.message);
    }
}

checkDatabase();
