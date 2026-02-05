import { WeeklyPlan, PracticeScenario } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Play, Check, Target } from 'lucide-react';

interface WeeklyPlanViewProps {
  plan: WeeklyPlan;
  onStartPractice: (scenario: PracticeScenario) => void;
}

const WeeklyPlanView = ({ plan, onStartPractice }: WeeklyPlanViewProps) => {
  const completedDays = plan.dailyGoals.filter(d => d.completed).length;
  const totalDays = plan.dailyGoals.length;
  const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Plan Semanal</h1>
          <p className="text-slate-500">Semana {plan.weekNumber} — {plan.weekTheme}</p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Target className="size-3.5 mr-1.5" />
          {completedDays}/{totalDays} completados
        </Badge>
      </header>

      {/* Weekly Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Progreso semanal</span>
            <span className="text-sm text-slate-500">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Daily Goals */}
      <section aria-label="Objetivos diarios">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Objetivos diarios</h2>
        <div className="space-y-3">
          {plan.dailyGoals.map((goal, index) => (
            <Card 
              key={index}
              className={cn(
                "transition-colors",
                goal.completed && "bg-slate-50"
              )}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {/* Status indicator */}
                <div className={cn(
                  "size-10 rounded-lg flex items-center justify-center shrink-0",
                  goal.completed 
                    ? "bg-success-100 text-success" 
                    : "bg-slate-100 text-slate-400"
                )}>
                  {goal.completed ? (
                    <Check className="size-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {goal.day}
                    </span>
                  </div>
                  <p className={cn(
                    "font-medium text-slate-900",
                    goal.completed && "line-through text-slate-500"
                  )}>
                    {goal.practiceScenario.title}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {goal.practiceScenario.prompt}
                  </p>
                </div>

                {/* Action */}
                {!goal.completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStartPractice(goal.practiceScenario)}
                  >
                    <Play className="size-3.5" />
                    Practicar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Weekly Vocabulary */}
      {plan.newVocabulary && plan.newVocabulary.length > 0 && (
        <section aria-label="Vocabulario de la semana">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Vocabulario de la semana</h2>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.newVocabulary.slice(0, 6).map((word, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                  >
                    <div className="size-8 rounded bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{word.word}</p>
                      <p className="text-sm text-slate-500 truncate">{word.spanish}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default WeeklyPlanView;
