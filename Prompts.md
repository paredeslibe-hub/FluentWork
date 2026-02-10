1. Fase de Definición (El Arquitecto)
Objetivo: Definir la lógica de aprendizaje adaptativo para diseñadores.

Prompt: "Actúa como un Senior Product Manager. Quiero desarrollar FluentWork, una app de coaching de inglés técnico para profesionales de UX/UI hispanohablantes. El problema es que los diseñadores conocen la teoría pero fallan en la comunicación técnica (stakeholders, critiques). Genera:

Un User Flow que incluya: Registro con Google -> Onboarding (nivel de inglés y contexto UX) -> Dashboard con plan semanal -> Arena de práctica con IA.

MVP: Autenticación (Supabase), Core (Corrección de frases con Gemini AI y Plan Semanal dinámico), Perfil (Persistencia de nivel y progreso).

Estructura JSON: Esquemas para profiles (contexto laboral), weekly_plans y practice_logs (historial de errores).

Rutas: /login, /onboarding, /dashboard, /practice, /progress."

2. Fase de Frontend (El Generative UI)
Objetivo: Crear una interfaz limpia, profesional y "UX-friendly".

Prompt: "Construye el frontend de FluentWork usando React, Tailwind CSS y Shadcn UI. Requisitos:

Estilo visual inspirado en herramientas de diseño (Figma/Linear): modo oscuro opcional, tipografía limpia (Inter/Geist) y componentes minimalistas.

Sistema de Local Data: Emula el plan semanal y el feedback de la IA mediante archivos JSON locales para probar la navegación sin llamadas a la API todavía.

Crea un componente 'PracticeArena' con un área de texto y tarjetas de feedback que cambien de color según el éxito (verde/amarillo/rojo).

3. Fase de Lógica Local (El AI Editor)
Objetivo: Inyectar la "inteligencia" y el rol de Senior UX Coach.

Prompt: "Actúa como un Ingeniero Fullstack. Vamos a implementar la lógica de Gemini AI en el archivo geminiService.ts:

Configura el modelo gemini-1.5-flash para que actúe como un Senior UX English Coach.

Implementa getCorrection: debe recibir el texto del usuario y el contexto UX, devolviendo un JSON con la corrección y un 'UX Professional Tip'.

Agrega un sistema de fallback: si la API de Gemini falla (error 429/403), el sistema debe cargar un getDefaultWeeklyPlan para que el usuario nunca vea el dashboard vacío.

Asegúrate de que el estado de la sesión persista usando Context API o hooks de React."

4. Fase de Evolución Backend (El Integrador MCP)
Objetivo: Migrar a la nube y asegurar que el progreso se guarde.

Prompt: "Actúa como un Cloud Engineer. Vamos a migrar el sistema de archivos locales a Supabase. Instrucciones:

Analiza mis tablas actuales y genera el esquema SQL para profiles (con columnas context, goal y level), weekly_plans y practice_logs.

Refactoriza Onboarding.tsx para que use el método .upsert() de Supabase para guardar el perfil del diseñador.

Asegúrate de que la Arena de Práctica guarde cada intento en la tabla practice_logs vinculada al user_id del usuario autenticado.

Ajusta las políticas RLS para que el progreso sea privado y solo el dueño pueda verlo."
