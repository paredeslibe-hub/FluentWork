import { useState } from 'react';
import { VocabularyItem } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Search, AlertTriangle } from 'lucide-react';

interface VocabularyBankProps {
  vocab: VocabularyItem[];
}

const VocabularyBank = ({ vocab }: VocabularyBankProps) => {
  const [filter, setFilter] = useState<'all' | 'general' | 'professional'>('all');
  const [search, setSearch] = useState('');

  const safeVocab = vocab || [];

  const filtered = safeVocab.filter(v => {
    const matchesFilter = filter === 'all' || v.category === filter;
    const matchesSearch = v.word.toLowerCase().includes(search.toLowerCase()) || 
                          v.spanish.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'general', label: 'General' },
    { value: 'professional', label: 'Profesional' },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vocabulario</h1>
          <p className="text-slate-500">{filtered.length} palabras</p>
        </div>
        
        {/* Filter */}
        <div 
          className="inline-flex rounded-lg border border-slate-200 p-1 bg-white"
          role="group"
          aria-label="Filtrar vocabulario"
        >
          {filterOptions.map(option => (
            <Button
              key={option.value}
              onClick={() => setFilter(option.value)}
              variant={filter === option.value ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={filter === option.value}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" aria-hidden="true" />
        <Input 
          type="text" 
          placeholder="Buscar palabra o traducción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Buscar vocabulario"
        />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Lista de vocabulario">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:border-slate-300 transition-colors" role="listitem">
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{item.word}</h3>
                  <p className="text-sm text-slate-500">{item.spanish}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {item.category === 'professional' ? 'Work' : 'General'}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 mb-4 italic">"{item.example}"</p>
              
              {item.commonError && (
                <div className="bg-destructive/5 p-3 rounded-md border border-destructive/10 flex items-start gap-2 mb-4">
                  <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium text-destructive mb-0.5">Error común</p>
                    <p className="text-xs text-slate-600">{item.commonError}</p>
                  </div>
                </div>
              )}
              
              {/* Mastery bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Dominio</span>
                  <span>{item.masteryLevel}/5</span>
                </div>
                <Progress 
                  value={(item.masteryLevel / 5) * 100} 
                  className="h-1.5"
                  aria-label={`Dominio: ${item.masteryLevel} de 5`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p>No se encontraron palabras.</p>
        </div>
      )}
    </div>
  );
};

export default VocabularyBank;
