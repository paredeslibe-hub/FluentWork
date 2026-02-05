import { useState, useEffect } from 'react';
import { UserProfile, PracticeScenario, PracticeAttempt } from '../types';
import { getCorrection } from '../services/geminiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, Play, RotateCcw, Loader2, Check, Lightbulb } from 'lucide-react';

interface PracticeArenaProps {
  profile: UserProfile;
  onUpdateProgress: (mistake?: string, activity?: string, attemptDetails?: PracticeAttempt) => void;
  initialScenario: PracticeScenario | null;
  onComplete: (scenarioTitle: string) => void;
}

const PracticeArena = ({ onUpdateProgress, initialScenario, onComplete }: PracticeArenaProps) => {
  const [scenario, setScenario] = useState<PracticeScenario | null>(initialScenario);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showTheory, setShowTheory] = useState(true);

  useEffect(() => {
    if (initialScenario) {
      setScenario(initialScenario);
      setShowTheory(true);
      setFeedback(null);
      setUserInput('');
    }
  }, [initialScenario]);

  const scenarios = [
    { 
      title: 'Daily Meeting Update', 
      prompt: 'Explica qué hiciste ayer y en qué trabajarás hoy de forma breve.',
      context: 'Daily Standup',
      theory: 'Usa el Past Simple para tareas terminadas ("Yesterday, I finished...") y el Present Continuous/Will para hoy ("Today, I am working on...").',
      emoji: '📅'
    },
    { 
      title: 'Requesting Clarification', 
      prompt: 'Un compañero te ha enviado una tarea pero no entiendes el plazo de entrega. Pide aclaración.',
      context: 'Slack/Chat',
      theory: 'Para sonar educado, usa "Could you please clarify...?" o "I am not sure about the deadline, could you confirm it?".',
      emoji: '💬'
    }
  ];

  const handleSubmit = async () => {
    if (!userInput.trim() || !scenario) return;
    setLoading(true);
    try {
      const res = await getCorrection(userInput, scenario.context, scenario.prompt);
      setFeedback(res);
      
      const attempt: PracticeAttempt = {
        date: new Date().toISOString(),
        scenarioTitle: scenario.title,
        userInput: userInput,
        correctedEn: res.correctedEn,
        feedbackEs: res.feedbackEs,
        isCorrect: res.isCorrect
      };

      onUpdateProgress(
        res.isCorrect ? undefined : userInput, 
        `Práctica: ${scenario.title}`,
        attempt
      );

      if (res.isCorrect) {
        onComplete(scenario.title);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setScenario(null);
    setUserInput('');
    setFeedback(null);
    setShowTheory(true);
  };

  // Scenario selection view
  if (!scenario) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Práctica</h1>
          <p className="text-slate-500">Elige un escenario para practicar tu inglés profesional.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Escenarios de práctica">
          {scenarios.map((s, idx) => (
            <Card
              key={idx}
              className="hover:border-slate-300 transition-colors cursor-pointer group"
              role="listitem"
            >
              <button
                onClick={() => { setScenario(s); setShowTheory(true); }}
                className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset rounded-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <span aria-hidden="true">{s.emoji}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-slate-900 mb-1">{s.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{s.prompt}</p>
                    <div className="mt-3 text-sm font-medium text-primary-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                      <Play className="size-3.5" /> Empezar
                    </div>
                  </div>
                </div>
              </button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={reset}>
        <ArrowLeft className="size-4" />
        Cambiar escenario
      </Button>

      {/* Theory tip */}
      {showTheory && scenario.theory && (
        <Card className="bg-primary-50 border-primary-100 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <Lightbulb className="size-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-slate-900 mb-2">Tip antes de empezar</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{scenario.theory}</p>
                <Button onClick={() => setShowTheory(false)}>
                  Entendido, ir al ejercicio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practice card */}
      {!showTheory && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{scenario.context}</Badge>
            </div>
            <CardTitle>{scenario.title}</CardTitle>
            <CardDescription>{scenario.prompt}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!feedback ? (
              <>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your response in English here..."
                  className="w-full h-32 p-4 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-ring outline-none text-sm resize-none text-slate-900 placeholder-slate-400"
                  disabled={loading}
                  aria-label="Tu respuesta en inglés"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!userInput.trim() || loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="size-4" />
                      Check my English
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-lg border",
                  feedback.isCorrect ? 'bg-success-50 border-success/20' : 'bg-slate-50 border-slate-200'
                )}>
                  <p className="text-sm text-slate-700 mb-4">{feedback.feedbackEs}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Tu versión corregida</p>
                      <p className="text-sm font-medium text-slate-900 p-3 bg-white rounded-md border border-slate-200">{feedback.correctedEn}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Alternativa profesional</p>
                      <p className="text-sm font-medium text-slate-900 p-3 bg-white rounded-md border border-slate-200">{feedback.professionalAlternative}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => { setFeedback(null); setUserInput(''); }}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="size-4" />
                  Intentar otro mensaje
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeArena;
