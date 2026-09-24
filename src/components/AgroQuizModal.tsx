import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  AGRICULTURAL_QUIZZES, 
  QUIZ_TOPICS, 
  QUIZ_STREAK_REWARDS, 
  QuizTopic, 
  QuizQuestion 
} from '../config/quizzes';
import { 
  X, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  BookOpen, 
  DollarSign, 
  HelpCircle,
  Trophy,
  Compass
} from 'lucide-react';

export const AgroQuizModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const farm = useGameStore((state) => state.farm);
  const submitQuizAnswer = useGameStore((state) => state.submitQuizAnswer);
  const resetQuizProgress = useGameStore((state) => state.resetQuizProgress);
  const claimStreakReward = useGameStore((state) => state.claimStreakReward);

  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | 'all' | 'milestones'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Beginner' | 'Intermediate' | 'Master'>('all');
  const [activeQuestionId, setActiveQuestionId] = useState<string>(AGRICULTURAL_QUIZZES[0].id);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; ecoPoints: number; cash: number } | null>(null);

  const quizStats = farm.quizStats || {
    answeredQuestions: {},
    currentStreak: 0,
    bestStreak: 0,
    totalEarnedEcoPoints: 0,
    totalEarnedCash: 0,
    claimedStreakMilestones: []
  };

  const answeredMap = quizStats.answeredQuestions;

  // Filter questions based on topic and difficulty
  const filteredQuestions = useMemo(() => {
    return AGRICULTURAL_QUIZZES.filter((q) => {
      const matchTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      return matchTopic && matchDiff;
    });
  }, [selectedTopic, selectedDifficulty]);

  // Keep active question valid
  useEffect(() => {
    if (selectedTopic === 'milestones') return;
    if (filteredQuestions.length > 0 && !filteredQuestions.some(q => q.id === activeQuestionId)) {
      setActiveQuestionId(filteredQuestions[0].id);
      setSelectedChoiceIndex(null);
      setLastFeedback(null);
    }
  }, [filteredQuestions, activeQuestionId, selectedTopic]);

  const activeQuestion = useMemo(() => {
    return AGRICULTURAL_QUIZZES.find(q => q.id === activeQuestionId) || AGRICULTURAL_QUIZZES[0];
  }, [activeQuestionId]);

  const activeAnswerRecord = answeredMap[activeQuestion.id];

  // Current question index in current filtered list
  const currentFilteredIndex = useMemo(() => {
    return filteredQuestions.findIndex(q => q.id === activeQuestion.id);
  }, [filteredQuestions, activeQuestion]);

  const handleSelectAnswer = (index: number) => {
    if (activeAnswerRecord) return; // Already answered
    setSelectedChoiceIndex(index);
    const result = submitQuizAnswer(activeQuestion.id, index);
    setLastFeedback({
      isCorrect: result.isCorrect,
      ecoPoints: result.reward.ecoPoints,
      cash: result.reward.cash
    });
  };

  const handleNextQuestion = () => {
    if (filteredQuestions.length === 0) return;
    const nextIndex = (currentFilteredIndex + 1) % filteredQuestions.length;
    setActiveQuestionId(filteredQuestions[nextIndex].id);
    setSelectedChoiceIndex(null);
    setLastFeedback(null);
  };

  const handlePrevQuestion = () => {
    if (filteredQuestions.length === 0) return;
    const prevIndex = (currentFilteredIndex - 1 + filteredQuestions.length) % filteredQuestions.length;
    setActiveQuestionId(filteredQuestions[prevIndex].id);
    setSelectedChoiceIndex(null);
    setLastFeedback(null);
  };

  // Keyboard navigation
  useEffect(() => {
    if (activeModal !== 'quiz') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowRight') {
        handleNextQuestion();
      } else if (e.key === 'ArrowLeft') {
        handlePrevQuestion();
      } else if (['1', '2', '3', '4'].includes(e.key) && !activeAnswerRecord) {
        handleSelectAnswer(parseInt(e.key, 10) - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, closeModal, activeAnswerRecord, currentFilteredIndex, filteredQuestions]);

  if (activeModal !== 'quiz') return null;

  const totalQuestions = AGRICULTURAL_QUIZZES.length;
  const answeredCount = Object.keys(answeredMap).length;
  const correctCount = Object.values(answeredMap).filter(a => a.isCorrect).length;
  const masteryPercent = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/80 border-b border-stone-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-2xl shadow-inner shadow-emerald-500/20 shrink-0">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold font-display text-white">
                  Agricultural Science Quiz & Research Grants
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Earn Cash & EcoPoints
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 max-w-xl">
                Master regenerative agronomy, living soil microbiology, hydrology & polycultures. Every correct answer earns funding grants and eco-points!
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors shrink-0"
            title="Close Quiz (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Quiz Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-stone-950 border-b border-stone-800 text-xs">
          {/* 1. Cash Grants Won */}
          <div className="px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Quiz Cash Grants</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                +${quizStats.totalEarnedCash.toLocaleString()}
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          {/* 2. EcoPoints Earned */}
          <div className="px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">EcoPoints Won</div>
              <div className="text-sm font-bold font-mono text-teal-400">
                +{(quizStats.totalEarnedEcoPoints || 0).toLocaleString()} pts
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* 3. Active Streak */}
          <div className="px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Current Streak</div>
              <div className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1">
                <span>{quizStats.currentStreak} in-a-row</span>
                {quizStats.currentStreak > 0 && <span className="animate-bounce">🔥</span>}
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          {/* 4. Mastery Progress */}
          <div className="px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Agronomy Mastery</div>
              <div className="text-sm font-bold font-mono text-stone-200">
                {correctCount} / {totalQuestions} <span className="text-stone-500 text-[11px]">({masteryPercent}%)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Category & Topic Filter Ribbon */}
        <div className="px-4 py-2.5 bg-stone-900/70 border-b border-stone-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedTopic === 'all'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'bg-stone-800/80 hover:bg-stone-750 text-stone-300 border border-stone-700/60'
            }`}
          >
            All Questions ({AGRICULTURAL_QUIZZES.length})
          </button>

          {QUIZ_TOPICS.map((topic) => {
            const topicQuestions = AGRICULTURAL_QUIZZES.filter(q => q.topic === topic.id);
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                    : 'bg-stone-800/80 hover:bg-stone-750 text-stone-300 border border-stone-700/60'
                }`}
              >
                <span>{topic.icon}</span>
                <span>{topic.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-800 text-white' : 'bg-stone-900 text-stone-400'}`}>
                  {topicQuestions.length}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setSelectedTopic('milestones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedTopic === 'milestones'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-950'
                : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Streak Rewards</span>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {selectedTopic === 'milestones' ? (
            /* Streak Rewards & Academic Milestones View */
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-stone-900 border border-amber-600/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>Streak Milestones & Academic Endowments</span>
                  </h3>
                  <p className="text-xs text-stone-300 mt-1">
                    Answer consecutive agricultural questions correctly to unlock prestige badges, major cash endowments, and bonus eco-points!
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-stone-400">All-Time Best Streak</div>
                  <div className="text-xl font-bold font-mono text-amber-400">{quizStats.bestStreak} 🔥</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUIZ_STREAK_REWARDS.map((reward) => {
                  const isClaimed = quizStats.claimedStreakMilestones.includes(reward.streak);
                  const canClaim = quizStats.bestStreak >= reward.streak && !isClaimed;
                  const isLocked = quizStats.bestStreak < reward.streak;

                  return (
                    <div 
                      key={reward.streak}
                      className={`p-4 rounded-xl border transition-all ${
                        isClaimed
                          ? 'bg-stone-950/90 border-emerald-500/40'
                          : canClaim
                          ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-500/30 shadow-lg'
                          : 'bg-stone-900/80 border-stone-800 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-xl shrink-0">
                            {reward.badge}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white font-display">{reward.title}</h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                                {reward.streak} Streak
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">{reward.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="text-emerald-400 font-bold">+${reward.cashBonus}</span>
                          <span className="text-teal-300 font-bold">+{reward.ecoPointsBonus} pts</span>
                        </div>

                        {isClaimed ? (
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Claimed
                          </span>
                        ) : canClaim ? (
                          <button
                            onClick={() => claimStreakReward(reward.streak)}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            Claim Reward
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-500 font-mono">
                            Need {reward.streak - quizStats.currentStreak} more in current run
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setSelectedTopic('all')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md"
                >
                  Return to Active Quizzes
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Quiz Question Card */
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Question Navigation & Filter Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-400">
                    Question {currentFilteredIndex + 1} of {filteredQuestions.length}
                  </span>
                  <span className="text-stone-600">•</span>
                  <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeQuestion.difficulty === 'Beginner'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : activeQuestion.difficulty === 'Intermediate'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {activeQuestion.difficulty}
                  </span>
                  <span className="text-stone-600">•</span>
                  <span className="text-stone-400 font-medium">
                    {activeQuestion.topicLabel}
                  </span>
                </div>

                {/* Difficulty Segmented Filter */}
                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                  {(['all', 'Beginner', 'Intermediate', 'Master'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-emerald-600 text-white'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {diff === 'all' ? 'All Diff' : diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Statement Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-stone-850 to-stone-900 border border-stone-750 shadow-md">
                <h3 className="text-sm sm:text-base font-semibold text-stone-100 leading-relaxed">
                  {activeQuestion.question}
                </h3>

                {/* Question Potential Rewards Indicator */}
                <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      +${activeQuestion.reward.cash} Research Grant
                    </span>
                    <span className="text-teal-400 font-mono font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      +{activeQuestion.reward.ecoPoints} EcoPoints
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    {activeQuestion.sdgTag}
                  </span>
                </div>
              </div>

              {/* 4 Answer Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {activeQuestion.options.map((option, idx) => {
                  const isAnswered = !!activeAnswerRecord;
                  const isCorrectAnswer = idx === activeQuestion.correctIndex;
                  const isUserSelection = isAnswered && activeAnswerRecord.answeredIndex === idx;
                  const isCurrentPendingSelection = selectedChoiceIndex === idx;

                  let optionStyle = 'bg-stone-950/70 hover:bg-stone-850 border-stone-800 hover:border-emerald-500/60 text-stone-200';
                  
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      optionStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40';
                    } else if (isUserSelection && !isCorrectAnswer) {
                      optionStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                    } else {
                      optionStyle = 'bg-stone-950/40 border-stone-850 text-stone-500 opacity-60';
                    }
                  } else if (isCurrentPendingSelection) {
                    optionStyle = 'bg-stone-850 border-emerald-400 text-white';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 group ${optionStyle} ${
                        !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                        isAnswered && isCorrectAnswer
                          ? 'bg-emerald-500 text-white'
                          : isAnswered && isUserSelection && !isCorrectAnswer
                          ? 'bg-rose-500 text-white'
                          : 'bg-stone-800 text-stone-400 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}>
                        {isAnswered && isCorrectAnswer ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isAnswered && isUserSelection && !isCorrectAnswer ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Agronomic Science Explanation Card (Shown once answered) */}
              {activeAnswerRecord && (
                <div className={`p-4 rounded-xl border animate-in fade-in duration-300 ${
                  activeAnswerRecord.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : 'bg-amber-950/30 border-amber-500/40'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {activeAnswerRecord.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold font-display uppercase tracking-wider text-stone-200">
                      Agronomy Insight: {activeQuestion.agronomicPrinciple}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {activeQuestion.explanation}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>{activeQuestion.sdgTag}</span>
                    {activeAnswerRecord.isCorrect && (
                      <span className="text-emerald-400 font-bold">
                        Reward successfully credited to farm account!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Carousel Navigation Controls */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevQuestion}
                  disabled={filteredQuestions.length <= 1}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 disabled:opacity-40 text-stone-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {filteredQuestions.map((q, idx) => {
                    const ans = answeredMap[q.id];
                    const isCurrent = q.id === activeQuestion.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setActiveQuestionId(q.id);
                          setSelectedChoiceIndex(null);
                          setLastFeedback(null);
                        }}
                        className={`w-3 h-3 rounded-full transition-all ${
                          isCurrent
                            ? 'ring-2 ring-white scale-125'
                            : ''
                        } ${
                          ans?.isCorrect
                            ? 'bg-emerald-500'
                            : ans && !ans.isCorrect
                            ? 'bg-rose-500'
                            : 'bg-stone-700 hover:bg-stone-600'
                        }`}
                        title={`Question ${idx + 1}: ${q.question}`}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={handleNextQuestion}
                  disabled={filteredQuestions.length <= 1}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Press 1-4 keys to select answers, Left/Right arrows to flip questions.</span>
            <span className="sm:hidden font-mono">{answeredCount}/{totalQuestions} Answered</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetQuizProgress}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-[11px] font-semibold transition-colors flex items-center gap-1"
              title="Reset practice history while keeping earned cash"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Practice</span>
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
