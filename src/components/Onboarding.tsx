import { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<number>(1);
  const [context, setContext] = useState('');
  const [goal, setGoal] = useState('');

  const levels = [
    { id: 1, name: 'A1 - Básico', desc: 'Puedo presentarme con frases simples.' },
    { id: 2, name: 'A2 - Elemental', desc: 'Entiendo frases sencillas del día a día.' },
    { id: 3, name: 'B1 - Intermedio', desc: 'Puedo mantener conversaciones simples.' },
    { id: 4, name: 'B2 - Intermedio Alto', desc: 'Me comunico con fluidez en la mayoría de temas.' },
  ];

  const contexts = [
    { id: 'tech', name: 'Tech / Software', emoji: '💻' },
    { id: 'marketing', name: 'Marketing', emoji: '📢' },
    { id: 'design', name: 'Diseño', emoji: '🎨' },
    { id: 'management', name: 'Management', emoji: '📊' },
    { id: 'sales', name: 'Ventas', emoji: '🤝' },
    { id: 'general', name: 'General Business', emoji: '💼' },
  ];

  const goals = [
    { id: 'meetings', name: 'Participar en meetings' },
    { id: 'emails', name: 'Escribir emails profesionales' },
    { id: 'presentations', name: 'Dar presentaciones' },
    { id: 'interviews', name: 'Preparar entrevistas' },
    { id: 'networking', name: 'Hacer networking' },
  ];

  const handleFinish = () => {
    onComplete({ level, context, goal });
  };

  const totalSteps = 3;
  const progressValue = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Paso {step + 1} de {totalSteps}</span>
              <span className="text-slate-500">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Level */}
          {step === 0 && (
            <section className="space-y-4 animate-fade-in" aria-labelledby="level-title">
              <div>
                <CardTitle id="level-title">¿Cuál es tu nivel actual?</CardTitle>
                <CardDescription className="mt-1">Selecciona el que mejor te describa</CardDescription>
              </div>
              
              <div 
                className="space-y-2" 
                role="radiogroup" 
                aria-label="Selección de nivel"
              >
                {levels.map((l) => (
                  <button 
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-colors flex items-center justify-between",
                      level === l.id 
                        ? "border-slate-900 bg-slate-50" 
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    role="radio"
                    aria-checked={level === l.id}
                  >
                    <div>
                      <p className="font-medium text-slate-900">{l.name}</p>
                      <p className="text-sm text-slate-500">{l.desc}</p>
                    </div>
                    {level === l.id && <Check className="size-5 text-slate-900" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 1: Context */}
          {step === 1 && (
            <section className="space-y-4 animate-fade-in" aria-labelledby="context-title">
              <div>
                <CardTitle id="context-title">¿En qué industria trabajas?</CardTitle>
                <CardDescription className="mt-1">Personalizaremos el vocabulario</CardDescription>
              </div>
              
              <div 
                className="grid grid-cols-2 gap-2" 
                role="radiogroup" 
                aria-label="Selección de industria"
              >
                {contexts.map((c) => (
                  <button 
                    key={c.id}
                    onClick={() => setContext(c.id)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-colors",
                      context === c.id 
                        ? "border-slate-900 bg-slate-50" 
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    role="radio"
                    aria-checked={context === c.id}
                  >
                    <span className="text-xl mb-2 block" aria-hidden="true">{c.emoji}</span>
                    <p className="font-medium text-sm text-slate-900">{c.name}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <section className="space-y-4 animate-fade-in" aria-labelledby="goal-title">
              <div>
                <CardTitle id="goal-title">¿Cuál es tu objetivo principal?</CardTitle>
                <CardDescription className="mt-1">Enfoca tu práctica</CardDescription>
              </div>
              
              <div 
                className="space-y-2" 
                role="radiogroup" 
                aria-label="Selección de objetivo"
              >
                {goals.map((g) => (
                  <button 
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-colors flex items-center justify-between",
                      goal === g.id 
                        ? "border-slate-900 bg-slate-50" 
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    role="radio"
                    aria-checked={goal === g.id}
                  >
                    <span className="font-medium text-slate-900">{g.name}</span>
                    {goal === g.id && <Check className="size-5 text-slate-900" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {step > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Atrás
              </Button>
            )}
            
            {step < 2 ? (
              <Button 
                onClick={() => setStep(step + 1)} 
                disabled={step === 1 && !context}
                className="flex-1"
              >
                Continuar
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleFinish} 
                disabled={!goal}
                className="flex-1"
              >
                Empezar
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
