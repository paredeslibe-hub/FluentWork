import { useState } from 'react';
import { VocabularyItem, FlashcardState, PracticeAttempt } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, Check } from 'lucide-react';

interface FlashcardsProps {
  vocab: VocabularyItem[];
  onVocabUpdate: (item: VocabularyItem) => void;
  onUpdateProgress: (mistake?: string, activity?: string, attemptDetails?: PracticeAttempt) => void;
}

const Flashcards = ({ vocab, onVocabUpdate, onUpdateProgress }: FlashcardsProps) => {
  const [state, setState] = useState<FlashcardState>({
    currentCardIndex: 0,
    showBack: false,
    userInput: ''
  });
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const cardsToReview = vocab || [];
  const currentCard = cardsToReview[state.currentCardIndex];

  const handleCheck = () => {
    if (!currentCard) return;
    const correct = state.userInput.toLowerCase().trim() === currentCard.word.toLowerCase().trim();
    setIsCorrect(correct);
    setIsAnswered(true);
    
    const updatedItem = {
      ...currentCard,
      masteryLevel: correct ? Math.min(5, currentCard.masteryLevel + 1) : Math.max(0, currentCard.masteryLevel - 1),
      nextReviewDate: new Date(Date.now() + (correct ? 86400000 * 2 : 0)).toISOString()
    };
    
    onVocabUpdate(updatedItem);

    if (!correct) {
      onUpdateProgress(`Error en vocabulario: ${currentCard.word}`);
    }
  };

  const handleNext = () => {
    if (state.currentCardIndex < cardsToReview.length - 1) {
      setState({
        ...state,
        currentCardIndex: state.currentCardIndex + 1,
        showBack: false,
        userInput: ''
      });
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      onUpdateProgress(undefined, 'Sesión de Flashcards completada');
      alert("¡Sesión completada!");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswered && state.userInput.trim()) {
      handleCheck();
    }
  };

  if (!currentCard) return (
    <div className="text-center py-16">
      <p className="text-slate-500">No hay tarjetas para revisar hoy.</p>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Flashcards</h1>
        <Badge variant="outline">
          {state.currentCardIndex + 1} / {cardsToReview.length}
        </Badge>
      </header>

      {/* Flashcard */}
      <Card 
        className={cn(
          "transition-colors",
          isAnswered && isCorrect && "border-success",
          isAnswered && !isCorrect && "border-destructive"
        )}
        role="region"
        aria-label={`Flashcard ${state.currentCardIndex + 1} de ${cardsToReview.length}`}
      >
        <CardContent className="p-8 text-center space-y-6">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
              Escribe en inglés
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">{currentCard.spanish}</h2>
            <p className="text-sm text-slate-500 mt-2 italic">
              "{currentCard.example.replace(currentCard.word, '______')}"
            </p>
          </div>

          <Input
            type="text"
            value={state.userInput}
            onChange={(e) => setState({ ...state, userInput: e.target.value })}
            onKeyDown={handleKeyDown}
            disabled={isAnswered}
            autoFocus
            className={cn(
              "text-center text-lg font-medium h-12",
              isAnswered && isCorrect && "border-success bg-success-50",
              isAnswered && !isCorrect && "border-destructive bg-destructive/5"
            )}
            placeholder="Tu respuesta..."
            aria-label="Tu respuesta en inglés"
          />

          {/* Answer revealed */}
          {isAnswered && (
            <div className="pt-4 border-t border-slate-200 animate-fade-in">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Respuesta correcta</p>
              <p className="text-xl font-semibold text-slate-900">{currentCard.word}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0">
          {isAnswered ? (
            <Button onClick={handleNext} className="w-full">
              Siguiente
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleCheck}
              disabled={!state.userInput.trim()}
              className="w-full"
            >
              <Check className="size-4" />
              Comprobar
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" /> Dominado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-300" /> En progreso
        </span>
      </div>
    </div>
  );
};

export default Flashcards;
