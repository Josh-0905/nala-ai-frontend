import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Flame,
  IndianRupee,
  Heart,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Play,
  ChefHat,
  ShoppingBag,
  Share2,
  Star,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { ScoredRecipe } from '../types';
import { api } from '../services/api';
import { NutritionCard } from '../components/NutritionCard';
import { CookingModeModal } from '../components/CookingModeModal';
import { RecipeReviewsSection } from '../components/RecipeReviewsSection';
import { useToast } from '../contexts/ToastContext';
import { getCuratedDishImage } from '../utils/recipeImages';

interface RecipeDetailPageProps {
  recipeId: string;
  userIngredients?: string[];
  onBack: () => void;
  onOpenShoppingList: () => void;
}

export const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({
  recipeId,
  userIngredients = [],
  onBack,
  onOpenShoppingList,
}) => {
  const { showToast } = useToast();
  const [data, setData] = useState<ScoredRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepTimer, setStepTimer] = useState<{ stepNumber: number; remainingSeconds: number; isRunning: boolean } | null>(null);

  useEffect(() => {
    fetchDetail();
  }, [recipeId]);

  // Step countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (stepTimer && stepTimer.isRunning && stepTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setStepTimer((prev) => {
          if (!prev) return null;
          if (prev.remainingSeconds <= 1) {
            showToast(`Step ${prev.stepNumber} Timer Finished! 🔔`, 'info');
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.8);
            } catch (e) {}
            return { ...prev, remainingSeconds: 0, isRunning: false };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stepTimer]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRecipeById(recipeId, userIngredients);
      setData(res);
      setIsSaved(Boolean(res.isSaved));
    } catch (err: any) {
      showToast('Could not load recipe details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await api.toggleFavorite(recipeId);
      setIsSaved(res.saved);
      showToast(res.saved ? 'Saved to Favorites ❤️' : 'Removed from Favorites', 'info');
    } catch (err: any) {
      showToast('Sign in to save this recipe.', 'info');
    }
  };

  const handleAddMissingToShoppingList = async () => {
    if (!data?.ingredientStatus?.missing?.length) {
      showToast('You already have all ingredients for this recipe!', 'info');
      return;
    }

    setIsAddingToList(true);
    try {
      const missing = data.ingredientStatus.missing.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: 'Spices',
      }));

      await api.addShoppingItem({ items: missing });
      showToast(`Added ${missing.length} missing items to your shopping list!`, 'success');
    } catch (err: any) {
      showToast('Sign in to sync your shopping list items.', 'info');
    } finally {
      setIsAddingToList(false);
    }
  };

  const toggleStepCompletion = (stepNum: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
  };

  const toggleInlineTimer = (stepNum: number, timerMins: number) => {
    if (stepTimer && stepTimer.stepNumber === stepNum && stepTimer.isRunning) {
      setStepTimer({ ...stepTimer, isRunning: false });
    } else if (stepTimer && stepTimer.stepNumber === stepNum && !stepTimer.isRunning) {
      setStepTimer({ ...stepTimer, isRunning: true });
    } else {
      setStepTimer({
        stepNumber: stepNum,
        remainingSeconds: timerMins * 60,
        isRunning: true,
      });
    }
  };

  const formatTimeSecs = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-charcoal-900">Loading recipe details...</p>
      </div>
    );
  }

  const { recipe, matchPercentage, ingredientStatus, score } = data;
  const availableItems = ingredientStatus.available || [];
  const missingItems = ingredientStatus.missing || [];
  const totalItems = availableItems.length + missingItems.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-charcoal-900 bg-white border border-stone-200 px-3.5 py-2 rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recipes</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              isSaved
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-stone-200 text-stone-600 hover:text-charcoal-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hero Image & Headline Card */}
      <div className="bg-white rounded-3xl sm:rounded-[36px] border border-stone-200/90 shadow-soft overflow-hidden mb-8">
        <div className="relative aspect-[21/9] sm:aspect-[21/8] w-full overflow-hidden bg-stone-100">
          <img
            src={getCuratedDishImage(recipe.name, recipe.image_url)}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-black/30 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-forest-700/95 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>{matchPercentage}% Ingredient Match</span>
            </span>

            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/95 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{recipe.rating ? Number(recipe.rating).toFixed(1) : '4.9'} ({recipe.reviewCount || 14} reviews)</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-charcoal-900 text-xs font-bold">
              {recipe.cuisine}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-300">
              {recipe.meal_type} • {recipe.diet_type}
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-1">
              {recipe.name}
            </h1>
          </div>
        </div>

        {/* Overview Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100 p-4 sm:p-6 bg-stone-50/70 border-b border-stone-100 text-center">
          <div className="py-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Prep Time
            </span>
            <p className="font-display font-bold text-lg text-charcoal-900 mt-0.5">
              {recipe.preparation_time} min
            </p>
          </div>
          <div className="py-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Cook Time
            </span>
            <p className="font-display font-bold text-lg text-charcoal-900 mt-0.5">
              {recipe.cooking_time} min
            </p>
          </div>
          <div className="py-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Difficulty
            </span>
            <p className="font-display font-bold text-lg text-charcoal-900 mt-0.5">
              {recipe.difficulty}
            </p>
          </div>
          <div className="py-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Est. Cost
            </span>
            <p className="font-display font-bold text-lg text-charcoal-900 mt-0.5">
              ₹{recipe.estimated_cost}
            </p>
          </div>
        </div>

        {/* Action Callout & Description */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-display font-bold text-base text-charcoal-900">About this dish</h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {recipe.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Start Cooking Mode Button */}
            <button
              onClick={() => setIsCookingModeOpen(true)}
              className="px-7 py-3.5 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm shadow-food transition-all transform hover:scale-105 flex items-center justify-center gap-2 flex-shrink-0"
            >
              <ChefHat className="w-5 h-5" />
              <span>Start Cooking Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Ingredients Status vs Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        {/* Left Column: Smart Missing Ingredient System */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-display font-bold text-xl text-charcoal-900">
                Ingredient Checklist
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                You have <span className="font-bold text-forest-700">{availableItems.length}</span> of {totalItems} ingredients
              </p>
            </div>

            {missingItems.length > 0 && (
              <button
                onClick={handleAddMissingToShoppingList}
                disabled={isAddingToList}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 text-xs font-bold transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-forest-700" />
                <span>{isAddingToList ? 'Adding...' : 'Add Missing to List'}</span>
              </button>
            )}
          </div>

          {/* Available Items */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                🟢 Available In Your Kitchen ({availableItems.length})
              </h4>
            </div>

            {availableItems.length === 0 ? (
              <p className="text-xs text-stone-400 italic">None of the scanned items match yet.</p>
            ) : (
              <div className="space-y-2">
                {availableItems.map((item, idx) => (
                  <div
                    key={`avail-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-forest-50/50 border border-forest-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-600 flex-shrink-0" />
                      <span className="font-bold text-charcoal-900">{item.name}</span>
                    </div>
                    <span className="font-semibold text-stone-500">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Items */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                🔴 Missing Ingredients ({missingItems.length})
              </h4>
            </div>

            {missingItems.length === 0 ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Great news! You have everything required to prepare this meal right now.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {missingItems.map((item, idx) => (
                  <div
                    key={`miss-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-50/40 border border-rose-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span className="font-semibold text-charcoal-900">{item.name}</span>
                    </div>
                    <span className="font-medium text-stone-500">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nutrition Card & Overview */}
        <div className="lg:col-span-5 space-y-6">
          <NutritionCard nutrition={recipe.nutrition_data} servings={recipe.servings} />
        </div>
      </div>

      {/* Detailed Step-by-Step Cooking Instructions Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              <span>Chef-Approved Sequential Workflow</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              Step-by-Step Cooking Process
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {recipe.instructions?.length || 0} sequential steps with exact heat settings, timings, and chef secrets.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCookingModeOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold transition-all shadow-food"
            >
              <ChefHat className="w-4 h-4" />
              <span>Cooking Mode</span>
            </button>
          </div>
        </div>

        {/* Sequential Step Cards */}
        <div className="mt-6 space-y-4">
          {recipe.instructions && recipe.instructions.length > 0 ? (
            recipe.instructions.map((step, idx) => {
              const stepNum = step.step || idx + 1;
              const isDone = completedSteps.has(stepNum);
              const isTimerActive = stepTimer?.stepNumber === stepNum && stepTimer.isRunning;

              return (
                <div
                  key={`step-${idx}`}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200 opacity-90'
                      : 'bg-stone-50/60 hover:bg-white border-stone-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Step Number Circle Badge */}
                      <button
                        type="button"
                        onClick={() => toggleStepCompletion(stepNum)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0 transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-forest-700 text-white shadow-sm'
                        }`}
                        title={isDone ? 'Mark as incomplete' : 'Mark step as done'}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                      </button>

                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-forest-700">
                            Step {stepNum}
                          </span>
                          {step.title && (
                            <span className="text-sm font-bold text-charcoal-900">
                              • {step.title}
                            </span>
                          )}
                          {step.timerMinutes && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>{step.timerMinutes} min timer</span>
                            </span>
                          )}
                        </div>

                        <p className={`text-sm sm:text-base mt-2 leading-relaxed ${
                          isDone ? 'text-stone-500 line-through' : 'text-charcoal-800'
                        }`}>
                          {step.instruction}
                        </p>

                        {/* Pro Chef Tip Callout */}
                        {step.tip && (
                          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs sm:text-sm font-medium flex items-start gap-2">
                            <span className="text-base flex-shrink-0">💡</span>
                            <div>
                              <span className="font-bold">Pro Tip: </span>
                              <span>{step.tip}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step Actions: Timer & Completion Checkbox */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {step.timerMinutes && (
                        <button
                          type="button"
                          onClick={() => toggleInlineTimer(stepNum, step.timerMinutes!)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isTimerActive
                              ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {stepTimer?.stepNumber === stepNum
                              ? formatTimeSecs(stepTimer.remainingSeconds)
                              : `Start Timer (${step.timerMinutes}m)`}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleStepCompletion(stepNum)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isDone
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                            : 'bg-white border-stone-200 text-stone-400 hover:text-stone-700'
                        }`}
                        title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-stone-400 text-sm italic">Cooking instructions being synthesized...</p>
          )}
        </div>

        {/* Progress Tracker Footer */}
        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-forest-50 to-emerald-50 border border-forest-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-forest-900">
              {completedSteps.size === (recipe.instructions?.length || 0)
                ? '🎉 All cooking steps completed! Delicious meal ready!'
                : `Progress: ${completedSteps.size} of ${recipe.instructions?.length || 0} steps checked off`}
            </h4>
            <p className="text-xs text-forest-700 mt-0.5">
              Prefer hands-free voice readouts and full-screen kitchen timers? Launch Cooking Mode anytime.
            </p>
          </div>

          <button
            onClick={() => setIsCookingModeOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-food transition-all flex items-center gap-2 flex-shrink-0"
          >
            <ChefHat className="w-4 h-4" />
            <span>Launch Cooking Mode</span>
          </button>
        </div>
      </div>

      {/* Community Cook Reviews & Ratings Section */}
      <RecipeReviewsSection
        recipeId={recipe.id}
        recipeName={recipe.name}
      />

      {/* Cooking Mode Modal if active */}
      {isCookingModeOpen && (
        <CookingModeModal
          recipe={recipe}
          onClose={() => setIsCookingModeOpen(false)}
          onFinishedCooking={() => {
            fetchDetail();
          }}
        />
      )}
    </div>
  );
};
