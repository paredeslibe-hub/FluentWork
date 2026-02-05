import { UserProfile, UserProgress, WeeklyPlan, VocabularyItem, PracticeScenario, DailyGoal } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseJSON<T>(text: string): T {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1] : text;
  return JSON.parse(jsonString.trim());
}

export async function generateWeeklyPlan(
  profile: UserProfile,
  progress: UserProgress,
  weekNumber: number
): Promise<WeeklyPlan> {
  const prompt = `
Eres un coach de inglés para profesionales hispanohablantes. Genera un plan semanal de práctica de inglés.

Perfil del usuario:
- Nivel: ${profile.level}
- Contexto laboral: ${profile.context}
- Objetivo: ${profile.goal}

Semana: ${weekNumber}
Errores previos: ${progress.mistakes.slice(-5).join(', ') || 'Ninguno'}

Responde SOLO con un JSON válido (sin markdown) con esta estructura:
{
  "weekNumber": ${weekNumber},
  "mainFocus": "Tema principal de la semana",
  "grammarFocus": "Punto gramatical específico",
  "dailyGoals": [
    {
      "day": "Lunes",
      "goal": "Descripción del objetivo",
      "time": "10 min",
      "completed": false,
      "practiceScenario": {
        "title": "Título del escenario",
        "prompt": "Instrucción en español para el usuario",
        "context": "Contexto (ej: Email, Meeting, Slack)",
        "theory": "Consejo gramatical breve en español"
      }
    }
  ],
  "newVocabulary": [
    {
      "id": "vocab-1",
      "word": "palabra en inglés",
      "spanish": "traducción",
      "example": "Oración de ejemplo usando la palabra",
      "category": "professional",
      "masteryLevel": 0,
      "nextReviewDate": "${new Date().toISOString()}",
      "commonError": "Error común opcional"
    }
  ]
}

Genera 5 objetivos diarios (Lunes a Viernes) y 8-10 palabras de vocabulario relevantes al contexto laboral.
`;

  try {
    const response = await callGemini(prompt);
    return parseJSON<WeeklyPlan>(response);
  } catch (error) {
    console.error('Error generating weekly plan:', error);
    // Return a fallback plan
    return getDefaultWeeklyPlan(weekNumber);
  }
}

export async function getCorrection(
  userInput: string,
  context: string,
  originalPrompt: string
): Promise<{
  correctedEn: string;
  feedbackEs: string;
  isCorrect: boolean;
  professionalAlternative: string;
}> {
  const prompt = `
Eres un coach de inglés para profesionales. Corrige el siguiente texto en inglés.

Contexto: ${context}
Instrucción original: ${originalPrompt}
Respuesta del usuario: "${userInput}"

Responde SOLO con un JSON válido (sin markdown):
{
  "correctedEn": "Texto corregido en inglés",
  "feedbackEs": "Explicación en español de los errores y cómo mejorar",
  "isCorrect": true/false,
  "professionalAlternative": "Una versión más profesional/nativa del mensaje"
}
`;

  try {
    const response = await callGemini(prompt);
    return parseJSON(response);
  } catch (error) {
    console.error('Error getting correction:', error);
    return {
      correctedEn: userInput,
      feedbackEs: 'No se pudo obtener la corrección. Intenta de nuevo.',
      isCorrect: false,
      professionalAlternative: userInput
    };
  }
}

function getDefaultWeeklyPlan(weekNumber: number): WeeklyPlan {
  const today = new Date().toISOString();
  return {
    weekNumber,
    mainFocus: 'Comunicación profesional básica',
    grammarFocus: 'Present Simple vs Present Continuous',
    dailyGoals: [
      {
        day: 'Lunes',
        goal: 'Practicar saludos y presentaciones',
        time: '10 min',
        completed: false,
        practiceScenario: {
          title: 'Professional Introduction',
          prompt: 'Preséntate a un nuevo compañero de trabajo',
          context: 'Meeting',
          theory: 'Usa "I am" para información permanente y "I work" para tu rol actual.'
        }
      },
      {
        day: 'Martes',
        goal: 'Escribir un email de seguimiento',
        time: '15 min',
        completed: false,
        practiceScenario: {
          title: 'Follow-up Email',
          prompt: 'Escribe un email de seguimiento después de una reunión',
          context: 'Email',
          theory: 'Comienza con "Thank you for..." o "Following up on..."'
        }
      },
      {
        day: 'Miércoles',
        goal: 'Daily standup update',
        time: '10 min',
        completed: false,
        practiceScenario: {
          title: 'Daily Meeting Update',
          prompt: 'Explica qué hiciste ayer y en qué trabajarás hoy',
          context: 'Daily Standup',
          theory: 'Usa Past Simple para ayer ("I finished...") y will/going to para hoy.'
        }
      },
      {
        day: 'Jueves',
        goal: 'Pedir clarificación educadamente',
        time: '10 min',
        completed: false,
        practiceScenario: {
          title: 'Requesting Clarification',
          prompt: 'Un compañero te envió instrucciones confusas. Pide clarificación.',
          context: 'Slack/Chat',
          theory: 'Usa "Could you please clarify...?" para sonar educado.'
        }
      },
      {
        day: 'Viernes',
        goal: 'Resumen semanal',
        time: '15 min',
        completed: false,
        practiceScenario: {
          title: 'Weekly Summary',
          prompt: 'Escribe un resumen de tus logros de la semana para tu manager',
          context: 'Email',
          theory: 'Usa "I completed...", "I achieved...", "Next week I will..."'
        }
      }
    ],
    newVocabulary: [
      { id: 'v1', word: 'deadline', spanish: 'fecha límite', example: 'The deadline is next Friday.', category: 'professional', masteryLevel: 0, nextReviewDate: today },
      { id: 'v2', word: 'feedback', spanish: 'retroalimentación', example: 'Could you give me some feedback?', category: 'professional', masteryLevel: 0, nextReviewDate: today },
      { id: 'v3', word: 'stakeholder', spanish: 'parte interesada', example: 'We need to update the stakeholders.', category: 'professional', masteryLevel: 0, nextReviewDate: today },
      { id: 'v4', word: 'milestone', spanish: 'hito', example: 'We reached an important milestone.', category: 'professional', masteryLevel: 0, nextReviewDate: today },
      { id: 'v5', word: 'blocker', spanish: 'impedimento', example: 'I have a blocker on this task.', category: 'professional', masteryLevel: 0, nextReviewDate: today },
    ]
  };
}
