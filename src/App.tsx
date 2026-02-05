import { useState, useEffect, useCallback } from 'react';
import { AppView, UserProfile, UserProgress, WeeklyPlan, VocabularyItem, PracticeScenario, PracticeAttempt } from './types';
import { generateWeeklyPlan } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import Sidebar from './components/Sidebar';
import Onboarding from './components/Onboarding';
import WeeklyPlanView from './components/WeeklyPlanView';
import VocabularyBank from './components/VocabularyBank';
import Flashcards from './components/Flashcards';
import PracticeArena from './components/PracticeArena';
import ProgressCalendar from './components/ProgressCalendar';
import LoginScreen from './components/LoginScreen';
import { Loader2 } from 'lucide-react';

// Map AppView to section IDs for Sidebar
const viewToSection: Record<AppView, string> = {
  [AppView.LOGIN]: 'login',
  [AppView.ONBOARDING]: 'onboarding',
  [AppView.DASHBOARD]: 'plan',
  [AppView.VOCABULARY]: 'vocabulary',
  [AppView.FLASHCARDS]: 'flashcards',
  [AppView.PRACTICE]: 'practice',
  [AppView.CALENDAR]: 'progress',
};

const sectionToView: Record<string, AppView> = {
  'plan': AppView.DASHBOARD,
  'vocabulary': AppView.VOCABULARY,
  'flashcards': AppView.FLASHCARDS,
  'practice': AppView.PRACTICE,
  'progress': AppView.CALENDAR,
};

const App = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    history: [],
    mistakes: [],
    totalDaysPracticed: 0
  });
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);
  const [vocab, setVocab] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<PracticeScenario | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Check for OAuth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hasAuthCallback = window.location.hash.includes('access_token') || 
                              window.location.search.includes('code=');
      
      if (hasAuthCallback) {
        setLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            setUserId(session.user.id);
            setIsOffline(false);
            await loadUserData(session.user.id, false);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setLoading(false);
          }
        } catch (e) {
          console.error("Auth Callback Error", e);
          setLoading(false);
        }
      }
    };
    handleAuthCallback();
  }, []);

  const handleLoginGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error Google Auth:", error);
      alert("Error conectando con Google. Verifica la configuración.\n\nDetalle: " + (error.message || error));
    }
  };

  const handleLoginGuest = async () => {
    setIsOffline(true);
    setUserId('local-guest');
    await loadUserData('local-guest', true);
  };

  const loadUserData = async (uid: string, offline: boolean) => {
    try {
      setLoading(true);
      
      if (offline) {
        const savedProfile = localStorage.getItem('fluentwork_profile');
        const savedProgress = localStorage.getItem('fluentwork_progress');
        const savedVocab = localStorage.getItem('fluentwork_vocab');
        const savedPlan = localStorage.getItem('fluentwork_plan');

        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
            setView(AppView.DASHBOARD);
        } else {
            setView(AppView.ONBOARDING);
        }
        
        if (savedProgress) {
            const p = JSON.parse(savedProgress);
            setProgress({
                history: Array.isArray(p.history) ? p.history : [],
                mistakes: Array.isArray(p.mistakes) ? p.mistakes : [],
                totalDaysPracticed: typeof p.totalDaysPracticed === 'number' ? p.totalDaysPracticed : 0
            });
        }

        if (savedVocab) setVocab(JSON.parse(savedVocab));
        if (savedPlan) setCurrentPlan(JSON.parse(savedPlan));

      } else {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', uid).single();
        
        if (profileData) {
          setProfile({ level: profileData.level, context: profileData.context, goal: profileData.goal });
          setView(AppView.DASHBOARD);

          const { data: planData } = await supabase.from('weekly_plans').select('data').eq('user_id', uid).order('created_at', { ascending: false }).limit(1).single();
          if (planData) setCurrentPlan(planData.data);

          const { data: vocabData } = await supabase.from('vocabulary').select('*').eq('user_id', uid);
          if (vocabData) {
            setVocab(vocabData.map((v: any) => ({ ...v.data, id: v.id, masteryLevel: v.mastery_level, nextReviewDate: v.next_review_date })));
          }

          const { data: historyData } = await supabase.from('progress_history').select('*').eq('user_id', uid).order('date', { ascending: true });
          if (historyData) {
            const mistakes: string[] = [];
            let daysSet = new Set<string>();
            const historyFormatted = historyData.map((h: any) => {
              if (h.details && !h.details.isCorrect) mistakes.push(h.details.userInput);
              daysSet.add(h.date.split('T')[0]);
              return { date: h.date, type: h.type, description: h.description, details: h.details };
            });
            setProgress({ history: historyFormatted, mistakes, totalDaysPracticed: daysSet.size });
          }

        } else {
          setView(AppView.ONBOARDING);
        }
      }

    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (p: UserProfile) => {
    if (!userId) return;
    setLoading(true);
    setProfile(p);
    
    try {
      const plan = await generateWeeklyPlan(p, progress, 1);
      setCurrentPlan(plan);
      setVocab(plan.newVocabulary);

      if (isOffline) {
        localStorage.setItem('fluentwork_profile', JSON.stringify(p));
        localStorage.setItem('fluentwork_plan', JSON.stringify(plan));
        localStorage.setItem('fluentwork_vocab', JSON.stringify(plan.newVocabulary));
      } else {
        await supabase.from('profiles').upsert({ 
          user_id: userId, 
          level: p.level, 
          context: p.context, 
          goal: p.goal 
        });

        await supabase.from('weekly_plans').insert({
          user_id: userId,
          week_number: plan.weekNumber,
          data: plan
        });

        const vocabInserts = plan.newVocabulary.map(v => ({
          id: v.id,
          user_id: userId,
          word: v.word,
          data: v,
          mastery_level: 0,
          next_review_date: new Date().toISOString()
        }));
        
        if (vocabInserts.length > 0) {
          await supabase.from('vocabulary').upsert(vocabInserts);
        }
      }

      setView(AppView.DASHBOARD);
    } catch (error) {
      console.error("Error initial setup", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = useCallback(async (mistake?: string, activity?: string, attemptDetails?: PracticeAttempt) => {
    if (!userId) return;
    
    setProgress(prev => {
      const newMistakes = mistake ? [...new Set([...prev.mistakes, mistake])] : prev.mistakes;
      const newHistory = activity ? [...prev.history, { 
        date: new Date().toISOString(), 
        type: 'practice', 
        description: activity,
        details: attemptDetails
      }] : prev.history;
      
      const lastDate = prev.history.length > 0 ? prev.history[prev.history.length - 1].date.split('T')[0] : '';
      const today = new Date().toISOString().split('T')[0];
      const newTotal = lastDate !== today ? prev.totalDaysPracticed + 1 : prev.totalDaysPracticed;

      const newProgress = { ...prev, mistakes: newMistakes, history: newHistory, totalDaysPracticed: newTotal };
      
      if (isOffline) {
        localStorage.setItem('fluentwork_progress', JSON.stringify(newProgress));
      }

      return newProgress;
    });

    if (!isOffline && activity) {
      await supabase.from('progress_history').insert({
        user_id: userId,
        date: new Date().toISOString(),
        type: 'practice',
        description: activity,
        details: attemptDetails
      });
    }
  }, [userId, isOffline]);

  const handleUpdateVocab = async (updatedItem: VocabularyItem) => {
    if (!userId) return;
    
    setVocab(prev => {
      const newVal = prev.map(v => v.id === updatedItem.id ? updatedItem : v);
      if (isOffline) {
        localStorage.setItem('fluentwork_vocab', JSON.stringify(newVal));
      }
      return newVal;
    });

    if (!isOffline) {
      await supabase.from('vocabulary').update({
        mastery_level: updatedItem.masteryLevel,
        next_review_date: updatedItem.nextReviewDate,
        data: updatedItem
      }).eq('id', updatedItem.id);
    }
  };

  const handleStartPractice = (scenario: PracticeScenario) => {
    setActiveScenario(scenario);
    setView(AppView.PRACTICE);
  };

  const markDayCompleted = async (day: string) => {
    if (!currentPlan || !userId) return;
    
    const updatedGoals = currentPlan.dailyGoals.map(dg => dg.day === day ? { ...dg, completed: true } : dg);
    const updatedPlan = { ...currentPlan, dailyGoals: updatedGoals };
    
    setCurrentPlan(updatedPlan);

    if (isOffline) {
      localStorage.setItem('fluentwork_plan', JSON.stringify(updatedPlan));
    } else {
      const { data: plans } = await supabase.from('weekly_plans').select('id').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
      
      if (plans && plans.length > 0) {
        await supabase.from('weekly_plans').update({ data: updatedPlan }).eq('id', plans[0].id);
      }
    }
  };

  const handleNavigate = (section: string) => {
    const newView = sectionToView[section];
    if (newView) {
      setView(newView);
      if (newView !== AppView.PRACTICE) setActiveScenario(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="size-8 animate-spin text-slate-600 mb-4" />
        <p className="text-slate-600 text-sm">Conectando...</p>
      </main>
    );
  }

  // Login view
  if (view === AppView.LOGIN) {
    return (
      <LoginScreen 
        onLogin={handleLoginGoogle} 
        onGuestAccess={handleLoginGuest} 
        loading={loading}
      />
    );
  }

  // Onboarding view
  if (view === AppView.ONBOARDING) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Onboarding onComplete={handleOnboardingComplete} />
      </main>
    );
  }

  // Dashboard views with sidebar
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 w-full bg-slate-100 text-slate-600 text-xs font-medium text-center py-1.5 z-50 border-b border-slate-200">
          👤 Modo Invitado — Los datos se guardan localmente
        </div>
      )}

      <Sidebar 
        activeSection={viewToSection[view]} 
        onNavigate={handleNavigate}
        level={(() => {
          const levelMap: Record<string, number> = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
          return levelMap[profile?.level || 'A2'] || 2;
        })()}
      />
      
      <main className={`flex-1 overflow-y-auto ${isOffline ? 'pt-10' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {view === AppView.DASHBOARD && currentPlan && (
            <WeeklyPlanView 
              plan={currentPlan} 
              onStartPractice={handleStartPractice}
            />
          )}
          {view === AppView.VOCABULARY && <VocabularyBank vocab={vocab} />}
          {view === AppView.FLASHCARDS && (
            <Flashcards 
              vocab={vocab}
              userId={userId || undefined}
              onVocabUpdate={handleUpdateVocab} 
              onUpdateProgress={handleUpdateProgress} 
            />
          )}
          {view === AppView.PRACTICE && profile && (
            <PracticeArena 
              profile={profile} 
              onUpdateProgress={handleUpdateProgress}
              initialScenario={activeScenario}
              onComplete={(scenarioTitle) => {
                const day = currentPlan?.dailyGoals.find(dg => dg.practiceScenario.title === scenarioTitle)?.day;
                if (day) markDayCompleted(day);
              }}
            />
          )}
          {view === AppView.CALENDAR && <ProgressCalendar progress={progress} />}
        </div>
      </main>
    </div>
  );
};

export default App;
