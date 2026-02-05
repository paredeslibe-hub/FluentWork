import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Calendar, BookOpen, Layers, Briefcase, TrendingUp } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  level: number;
}

const Sidebar = ({ activeSection, onNavigate, level }: SidebarProps) => {
  const menuItems = [
    { id: 'plan', label: 'Plan Semanal', icon: Calendar },
    { id: 'vocabulary', label: 'Vocabulario', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'practice', label: 'Práctica', icon: Briefcase },
    { id: 'progress', label: 'Progreso', icon: TrendingUp },
  ];

  return (
    <nav 
      className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
        <div className="size-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-sm">🚀</span>
        </div>
        <span className="font-semibold text-slate-900">FluentWork</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full justify-start gap-3 h-10",
                isActive && "bg-slate-100 text-slate-900 font-medium"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Level Progress */}
      <div className="p-4 border-t border-slate-200">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-900">Nivel {level}</span>
            <span className="text-slate-500">{Math.min(level * 20, 100)}%</span>
          </div>
          <Progress 
            value={Math.min(level * 20, 100)} 
            className="h-2"
            aria-label={`Progreso de nivel: ${Math.min(level * 20, 100)}%`}
          />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
