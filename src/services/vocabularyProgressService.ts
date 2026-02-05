import { supabase } from './supabaseClient';
import { VocabularyProgress } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

type ProgressCallback = (progress: VocabularyProgress[]) => void;
type ProgressChangeCallback = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: VocabularyProgress | null;
  old: VocabularyProgress | null;
}) => void;

let realtimeChannel: RealtimeChannel | null = null;

/**
 * Fetches the user's vocabulary progress from the database
 */
export const fetchVocabularyProgress = async (userId: string): Promise<VocabularyProgress[]> => {
  const { data, error } = await supabase
    .from('vocabulary_progress')
    .select(`
      *,
      vocabulary (
        id,
        word,
        definition,
        translation,
        category,
        level
      )
    `)
    .eq('user_id', userId)
    .order('next_review_date', { ascending: true });

  if (error) {
    console.error('Error fetching vocabulary progress:', error);
    throw error;
  }

  return data || [];
};

/**
 * Subscribes to real-time changes in vocabulary_progress table
 */
export const subscribeToProgress = (
  userId: string,
  onInitialData: ProgressCallback,
  onChange: ProgressChangeCallback
): (() => void) => {
  // Fetch initial data
  fetchVocabularyProgress(userId).then(onInitialData).catch(console.error);

  // Set up Realtime subscription
  realtimeChannel = supabase
    .channel(`vocabulary_progress:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'vocabulary_progress',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        // Enrich the payload with vocabulary data
        let enrichedNew = payload.new as VocabularyProgress | null;
        
        if (enrichedNew?.vocabulary_id) {
          const { data: vocab } = await supabase
            .from('vocabulary')
            .select('id, word, definition, translation, category, level')
            .eq('id', enrichedNew.vocabulary_id)
            .single();
          
          if (vocab) {
            enrichedNew = { ...enrichedNew, vocabulary: vocab };
          }
        }

        onChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: enrichedNew,
          old: payload.old as VocabularyProgress | null
        });
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };
};

/**
 * Marks a vocabulary word as learned
 */
export const markWordAsLearned = async (
  userId: string,
  vocabularyId: string,
  learned: boolean = true
): Promise<VocabularyProgress> => {
  const { data, error } = await supabase
    .from('vocabulary_progress')
    .upsert({
      user_id: userId,
      vocabulary_id: vocabularyId,
      learned,
      mastery_level: learned ? 5 : 0,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,vocabulary_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error marking word as learned:', error);
    throw error;
  }

  return data;
};

/**
 * Updates mastery level after flashcard review
 */
export const updateMasteryLevel = async (
  userId: string,
  vocabularyId: string,
  isCorrect: boolean
): Promise<VocabularyProgress> => {
  // First, get current progress or create new
  const { data: existing } = await supabase
    .from('vocabulary_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('vocabulary_id', vocabularyId)
    .single();

  const currentMastery = existing?.mastery_level || 0;
  const timesReviewed = (existing?.times_reviewed || 0) + 1;
  const timesCorrect = (existing?.times_correct || 0) + (isCorrect ? 1 : 0);
  
  // Calculate new mastery level (0-5)
  const newMastery = isCorrect 
    ? Math.min(5, currentMastery + 1) 
    : Math.max(0, currentMastery - 1);

  // Calculate next review date based on mastery (spaced repetition)
  const daysUntilReview = [0, 1, 3, 7, 14, 30][newMastery];
  const nextReviewDate = new Date(Date.now() + daysUntilReview * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('vocabulary_progress')
    .upsert({
      user_id: userId,
      vocabulary_id: vocabularyId,
      mastery_level: newMastery,
      times_reviewed: timesReviewed,
      times_correct: timesCorrect,
      next_review_date: nextReviewDate,
      learned: newMastery >= 5,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,vocabulary_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating mastery level:', error);
    throw error;
  }

  return data;
};

/**
 * Gets progress statistics for the user
 */
export const getProgressStats = async (userId: string): Promise<{
  totalWords: number;
  learnedWords: number;
  inProgressWords: number;
  masteryPercentage: number;
}> => {
  const { data: progress, error } = await supabase
    .from('vocabulary_progress')
    .select('mastery_level, learned')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching progress stats:', error);
    throw error;
  }

  const { count: totalVocab } = await supabase
    .from('vocabulary')
    .select('*', { count: 'exact', head: true });

  const learnedWords = progress?.filter(p => p.learned).length || 0;
  const inProgressWords = progress?.filter(p => !p.learned && p.mastery_level > 0).length || 0;
  const totalMastery = progress?.reduce((sum, p) => sum + p.mastery_level, 0) || 0;
  const maxMastery = (totalVocab || 1) * 5;

  return {
    totalWords: totalVocab || 0,
    learnedWords,
    inProgressWords,
    masteryPercentage: Math.round((totalMastery / maxMastery) * 100)
  };
};
