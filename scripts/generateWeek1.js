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

const supabase = createClient(supabaseUrl, supabaseKey);

// Contenido de la Semana 1: Design Reviews - Nivel A2
// Adaptado a la estructura real de las tablas
const week1Vocabulary = [
    {
        term: 'layout',
        meaning_en: 'the way in which elements are arranged on a page or screen',
        example_sentence: 'The layout looks clean and organized.',
        mastery_level: 0
    },
    {
        term: 'wireframe',
        meaning_en: 'a basic visual guide showing the structure of a website or app',
        example_sentence: "Let's review the wireframe first.",
        mastery_level: 0
    },
    {
        term: 'user flow',
        meaning_en: 'the path a user takes through an application',
        example_sentence: 'The user flow is intuitive and easy to follow.',
        mastery_level: 0
    },
    {
        term: 'button',
        meaning_en: 'a clickable element that triggers an action',
        example_sentence: 'The button is too small for mobile devices.',
        mastery_level: 0
    },
    {
        term: 'navigation',
        meaning_en: 'the system that allows users to move through an interface',
        example_sentence: 'The navigation menu is clear and easy to use.',
        mastery_level: 0
    },
    {
        term: 'feedback',
        meaning_en: 'comments or suggestions about something',
        example_sentence: 'I have some feedback on this design.',
        mastery_level: 0
    },
    {
        term: 'prototype',
        meaning_en: 'an early sample or model of a product',
        example_sentence: 'Can you show me the interactive prototype?',
        mastery_level: 0
    },
    {
        term: 'color scheme',
        meaning_en: 'a combination of colors used in a design',
        example_sentence: 'I really like this color scheme!',
        mastery_level: 0
    },
    {
        term: 'typography',
        meaning_en: 'the style and appearance of text',
        example_sentence: 'The typography needs some improvement.',
        mastery_level: 0
    },
    {
        term: 'spacing',
        meaning_en: 'the distance between elements in a design',
        example_sentence: 'Add more spacing between elements.',
        mastery_level: 0
    },
    {
        term: 'contrast',
        meaning_en: 'the difference in visual properties that makes an object distinguishable',
        example_sentence: 'The contrast between text and background is good.',
        mastery_level: 0
    },
    {
        term: 'icon',
        meaning_en: 'a small visual symbol used to represent something',
        example_sentence: 'This icon is confusing for users.',
        mastery_level: 0
    },
    {
        term: 'alignment',
        meaning_en: 'the positioning of elements in a straight line',
        example_sentence: 'Check the alignment of these elements.',
        mastery_level: 0
    },
    {
        term: 'clickable',
        meaning_en: 'able to be clicked or selected',
        example_sentence: 'This text should be clickable.',
        mastery_level: 0
    },
    {
        term: 'responsive',
        meaning_en: 'adapting to different screen sizes automatically',
        example_sentence: 'Is this design responsive for mobile?',
        mastery_level: 0
    }
];

const week1Plan = {
    week_number: 1,
    main_focus: 'Design Reviews Fundamentals - A2 Level',
    status: 'active'
};

async function generateWeek1() {
    console.log('🚀 Generando contenido para Semana 1...\n');
    console.log('📚 Tema: Design Reviews (Nivel A2)\n');

    try {
        // Insertar vocabulario
        console.log('📝 Insertando 15 palabras de vocabulario...');
        const { data: vocabData, error: vocabError } = await supabase
            .from('vocabulary')
            .insert(week1Vocabulary)
            .select();

        if (vocabError) {
            console.log(`❌ Error al insertar vocabulario: ${vocabError.message}`);
            console.log(`   Código: ${vocabError.code || 'N/A'}`);
            console.log(`   Detalles: ${vocabError.details || 'No details'}`);
            console.log(`   Hint: ${vocabError.hint || 'No hint'}`);

            // Intentar ver qué palabras específicas fallaron
            console.log('\n🔍 Intentando inserción individual para identificar problemas...');
            for (const word of week1Vocabulary) {
                const { error: individualError } = await supabase
                    .from('vocabulary')
                    .insert([word]);
                if (individualError) {
                    console.log(`   ❌ Falló: "${word.term}" - ${individualError.message}`);
                } else {
                    console.log(`   ✅ Insertado: "${word.term}"`);
                }
            }
        } else {
            console.log(`✅ ${vocabData.length} palabras insertadas correctamente!`);
            console.log('\n📋 Palabras insertadas:');
            vocabData.forEach((word, index) => {
                console.log(`   ${index + 1}. ${word.term}`);
            });
        }

        // Insertar plan semanal
        console.log('\n📅 Insertando plan semanal...');
        const { data: planData, error: planError } = await supabase
            .from('weekly_plans')
            .insert([week1Plan])
            .select();

        if (planError) {
            console.log(`❌ Error al insertar plan semanal: ${planError.message}`);
            console.log(`   Código: ${planError.code || 'N/A'}`);
            console.log(`   Detalles: ${planError.details || 'No details'}`);
            console.log(`   Hint: ${planError.hint || 'No hint'}`);
        } else {
            console.log(`✅ Plan semanal insertado correctamente!`);
            console.log(`   ID: ${planData[0].id}`);
            console.log(`   Semana: ${planData[0].week_number}`);
            console.log(`   Enfoque: ${planData[0].main_focus}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✨ Generación de Semana 1 completada!');
        console.log('='.repeat(60));
        console.log('\n📊 Resumen del contenido generado:');
        console.log(`   - Vocabulario: ${week1Vocabulary.length} palabras técnicas de UX/UI`);
        console.log(`   - Nivel: A2 (Elementary)`);
        console.log(`   - Tema: Design Reviews`);
        console.log(`   - Categorías: Layout, UI Elements, Feedback\n`);

        // Verificar datos insertados
        console.log('🔍 Verificando datos en la base de datos...\n');

        const { data: allVocab, count: vocabCount } = await supabase
            .from('vocabulary')
            .select('term, meaning_en', { count: 'exact' });

        const { data: allPlans, count: planCount } = await supabase
            .from('weekly_plans')
            .select('week_number, main_focus', { count: 'exact' });

        console.log(`📊 Total de vocabulario en DB: ${vocabCount || 0} palabras`);
        if (allVocab && allVocab.length > 0) {
            console.log('   Últimas 5 palabras:');
            allVocab.slice(-5).forEach(word => {
                console.log(`   - ${word.term}`);
            });
        }

        console.log(`\n📊 Total de planes semanales en DB: ${planCount || 0} planes`);
        if (allPlans && allPlans.length > 0) {
            allPlans.forEach(plan => {
                console.log(`   - Semana ${plan.week_number}: ${plan.main_focus}`);
            });
        }

        console.log('\n✅ Proceso completado exitosamente!\n');

    } catch (err) {
        console.error(`\n❌ Error general: ${err.message}`);
        console.error(`   Stack: ${err.stack}`);
    }
}

// Ejecutar
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   FluentWork - Coach de Inglés UX/UI                    ║');
console.log('║   Generador de Contenido: Semana 1                      ║');
console.log('║   Estructura adaptada a esquema real de Supabase        ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

generateWeek1();
