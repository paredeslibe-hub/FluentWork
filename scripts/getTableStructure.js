import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
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

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function inspectTables() {
    console.log('🔍 Inspeccionando tablas de Supabase...\n');

    const tables = ['profiles', 'vocabulary', 'weekly_plans'];

    for (const tableName of tables) {
        console.log(`\n📊 Tabla: ${tableName}`);
        console.log('─'.repeat(50));

        try {
            // Intentar obtener metadata usando una query que falle intencionalmente
            // para ver la estructura en el mensaje de error
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);

            if (error) {
                console.log(`❌ Error: ${error.message}`);
                console.log(`Código: ${error.code}`);
                console.log(`Detalles: ${error.details}`);
                console.log(`Hint: ${error.hint}`);
            } else {
                console.log(`✅ Tabla accesible`);
                if (data && data.length > 0) {
                    console.log(`📋 Columnas encontradas: ${Object.keys(data[0]).join(', ')}`);
                } else {
                    console.log(`📋 La tabla está vacía, intentando inserción de prueba...`);

                    // Intentar una inserción simple para descubrir columnas requeridas
                    const testData = { test: 'test' };
                    const { error: insertError } = await supabase
                        .from(tableName)
                        .insert([testData]);

                    if (insertError) {
                        console.log(`\n💡 Info de inserción fallida:`);
                        console.log(`   Mensaje: ${insertError.message}`);
                        console.log(`   Detalles: ${insertError.details}`);
                        console.log(`   Hint: ${insertError.hint}`);
                    }
                }
            }
        } catch (err) {
            console.error(`❌ Error inesperado: ${err.message}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Inspección completada!\n');
}

inspectTables();
