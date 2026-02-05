import { useState } from 'react';
import { UserProgress, PracticeAttempt } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface ProgressCalendarProps {
  progress: UserProgress;
}

const ProgressCalendar = ({ progress }: ProgressCalendarProps) => {
  const [selectedAttempt, setSelectedAttempt] = useState<PracticeAttempt | null>(null);
  const sortedHistory = [...progress.history].reverse();

  const stats = [
    { 
      label: 'Días de práctica', 
      value: progress.totalDaysPracticed, 
      icon: TrendingUp,
      color: 'text-slate-900'
    },
    { 
      label: 'Errores clave', 
      value: progress.mistakes.length, 
      icon: AlertTriangle,
      color: 'text-slate-900'
    },
    { 
      label: 'Tiempo estimado', 
      value: `${Math.round(progress.history.length * 10)}m`, 
      icon: Clock,
      color: 'text-slate-900'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Progreso</h1>
        <p className="text-slate-500">Tu historial de práctica</p>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="region" aria-label="Estadísticas de progreso">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <stat.icon className="size-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div 
              className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-2" 
              role="list" 
              aria-label="Historial de actividades"
            >
              {sortedHistory.map((entry, idx) => (
                <button 
                  key={idx}
                  onClick={() => entry.details && setSelectedAttempt(entry.details)}
                  disabled={!entry.details}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3",
                    entry.details && "hover:bg-slate-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring",
                    !entry.details && "cursor-default",
                    entry.details?.isCorrect === false ? 'border-destructive/20 bg-destructive/5' : 'border-slate-200'
                  )}
                  aria-label={`${entry.description} - ${new Date(entry.date).toLocaleDateString()}`}
                >
                  <div className={cn(
                    "size-8 rounded-md flex items-center justify-center shrink-0",
                    entry.details?.isCorrect 
                      ? "bg-success-100 text-success" 
                      : entry.details?.isCorrect === false 
                        ? "bg-destructive/10 text-destructive"
                        : "bg-slate-100 text-slate-400"
                  )}>
                    {entry.details?.isCorrect ? (
                      <CheckCircle className="size-4" />
                    ) : entry.details?.isCorrect === false ? (
                      <AlertCircle className="size-4" />
                    ) : (
                      <TrendingUp className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{entry.description}</p>
                    <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
              {sortedHistory.length === 0 && (
                <p className="text-slate-400 text-center py-8 text-sm">
                  No hay historial aún. ¡Empieza a practicar!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detail panel */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {selectedAttempt ? (
              <div className="space-y-4 animate-fade-in" role="region" aria-label="Detalle de la práctica seleccionada">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Tu respuesta</p>
                  <p className="text-sm text-slate-700">"{selectedAttempt.userInput}"</p>
                </div>
                <div className="p-4 rounded-lg bg-success-50 border border-success/20">
                  <p className="text-xs font-medium text-success uppercase tracking-wide mb-2">Corrección</p>
                  <p className="text-sm font-medium text-slate-900">{selectedAttempt.correctedEn}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Feedback</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedAttempt.feedbackEs}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <AlertCircle className="size-8 mb-3 opacity-50" />
                <p className="text-sm">Selecciona una práctica del historial para ver el detalle.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressCalendar;
