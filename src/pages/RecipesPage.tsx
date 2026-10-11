import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  Clock,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  MessageSquare,
  Send,
  Camera,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { ScoredRecipe, Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getIngredientImage } from '../utils/ingredientImages';

interface RecipesPageProps {
  initialIngredients?: string[];
  onSelectRecipe: (id: string, currentIngredients: string[]) => void;
  onOpenScan: () => void;
}

export const RecipesPage: React.FC<RecipesPageProps> = ({
  initialIngredients = [],
  onSelectRecipe,
  onOpenScan,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [quickInput, setQuickInput] = useState('');
  const [isParsingQuick, setIsParsingQuick] = useState(false);
  const [recipes, setRecipes] = useState<ScoredRecipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

  useEffect(() => {
    setIngredients(initialIngredients);
  }, [initialIngredients]);

  // Filter states (Section 12 requirement)
  const [mealType, setMealType] = useState('Any');
  const [cuisine, setCuisine] = useState('Any');
  const [maxCookingTime, setMaxCookingTime] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState('Any');
  const [dietType, setDietType] = useState(user?.preferences?.diet_type || 'Any');
  const [servings, setServings] = useState(2);
  const [budget, setBudget] = useState<number | undefined>(500);

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeScoreBreakdown, setActiveScoreBreakdown] = useState<ScoredRecipe | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'ready_to_cook' | 'extra_missing' | 'telangana'>('all');

  useEffect(() => {
    fetchRecommendations();
    if (user) {
      fetchSavedRecipes();
    }
  }, [ingredients, mealType, cuisine, maxCookingTime, difficulty, dietType, budget, servings]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      if (ingredients.length > 0) {
        const res = await api.getRecommendations({
          ingredients,
          cuisine: cuisine === 'Any' ? undefined : cuisine,
          mealType: mealType === 'Any' ? undefined : mealType,
          dietType: dietType === 'Any' ? undefined : dietType,
          maxCookingTime,
          difficulty: difficulty === 'Any' ? undefined : difficulty,
          budget,
          servings,
        });
        setRecipes(res.recommendations);
      } else {
        // Fallback to all recipes when no ingredients scanned
        const allRes = await api.getAllRecipes({
          cuisine: cuisine === 'Any' ? undefined : cuisine,
          dietType: dietType === 'Any' ? undefined : dietType,
        });
        const mapped: ScoredRecipe[] = allRes.recipes.map((r) => ({
          recipe: r,
          score: 100,
          matchPercentage: 100,
          ingredientStatus: {
            available: [],
            missing: [],
          },
        }));
        setRecipes(mapped);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Could not load recipe recommendations.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedRecipes = async () => {
    try {
      const res = await api.getFavorites();
      setSavedRecipeIds(res.favorites.map((f) => f.id));
    } catch (e) {}
  };

  const handleToggleFavorite = async (recipeId: string) => {
    try {
      const res = await api.toggleFavorite(recipeId);
      if (res.saved) {
        setSavedRecipeIds((prev) => [...prev, recipeId]);
        showToast('Saved to your Favorites ❤️', 'success');
      } else {
        setSavedRecipeIds((prev) => prev.filter((id) => id !== recipeId));
        showToast('Removed from Favorites', 'info');
      }
    } catch (err: any) {
      showToast('Sign in to save your favorite recipes.', 'info');
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    setIsParsingQuick(true);
    try {
      const res = await api.parseMessageIngredients(quickInput);
      if (res.ingredients && res.ingredients.length > 0) {
        const names = res.ingredients.map((i) => i.name);
        setIngredients((prev) => {
          const next = [...prev];
          for (const n of names) {
            if (!next.some((x) => x.toLowerCase() === n.toLowerCase())) {
              next.push(n);
            }
          }
          return next;
        });
        showToast(res.message || `Added ${names.length} ingredients!`, 'success');
        setQuickInput('');
      } else {
        const items = quickInput
          .split(/[,;\n]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (items.length > 0) {
          setIngredients((prev) => {
            const next = [...prev];
            for (const item of items) {
              const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
              if (!next.some((x) => x.toLowerCase() === capitalized.toLowerCase())) {
                next.push(capitalized);
              }
            }
            return next;
          });
          showToast(`Added ${items.length} items to your basket`, 'success');
          setQuickInput('');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to parse ingredients.', 'error');
    } finally {
      setIsParsingQuick(false);
    }
  };

  const handleApplyCombo = (comboItems: string[]) => {
    setIngredients(comboItems);
    showToast(`Loaded ${comboItems.length} ingredients!`, 'success');
  };

  // Filter recipes by user search input
  const filteredRecipes = recipes.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.recipe.name.toLowerCase().includes(q) ||
      item.recipe.cuisine.toLowerCase().includes(q) ||
      item.recipe.description.toLowerCase().includes(q)
    );
  });

  // 1. Ready to cook recipes (100% matched, zero non-staples missing)
  const readyToCookList = filteredRecipes.filter(
    (item) => item.is100PercentMatch || (item.ingredientStatus?.missing?.length === 0 && ingredients.length > 0)
  );

  // 2. Extra recipes that need just 1, 2, or 3 missing items
  const extraList = filteredRecipes.filter((item) => {
    if (item.is100PercentMatch || (item.ingredientStatus?.missing?.length === 0 && ingredients.length > 0)) {
      return false;
    }
    const missing = item.missingCount !== undefined ? item.missingCount : item.ingredientStatus?.missing?.length || 0;
    return missing >= 1 && missing <= 3;
  });

  // 3. Authentic Telangana recipes
  const telanganaList = filteredRecipes.filter((item) => {
    const c = (item.recipe.cuisine || '').toLowerCase();
    const hasTag = item.recipe.tags && Array.isArray(item.recipe.tags) && item.recipe.tags.some((t: string) => t.toLowerCase().includes('telangana'));
    return c.includes('telangana') || hasTag;
  });

  // 4. Other recipes (needing 4+ items)
  const otherList = filteredRecipes.filter((item) => {
    const isReady = item.is100PercentMatch || (item.ingredientStatus?.missing?.length === 0 && ingredients.length > 0);
    const missing = item.missingCount !== undefined ? item.missingCount : item.ingredientStatus?.missing?.length || 0;
    const isExtra = missing >= 1 && missing <= 3;
    return !isReady && !isExtra;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Active Ingredients Tag Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200">
                AI Recommendation Engine
              </span>
              <span className="text-xs text-stone-500 font-medium">
                Ranked by 6 explainable factors
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 mt-2">
              Personalized Recipes For Your Kitchen
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFiltersModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-stone-200 hover:border-forest-600 bg-white text-xs font-bold text-charcoal-900 shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-forest-700" />
              <span>Filters & Preferences</span>
            </button>

            <button
              onClick={onOpenScan}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>+ Rescan Items</span>
            </button>
          </div>
        </div>

        {/* Available Ingredients Tray & Message Input */}
        <div className="mt-6 pt-6 border-t border-stone-100 space-y-4">
          {/* Quick Message / Type Ingredient Bar */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
            <div className="relative flex-1">
              <MessageSquare className="w-4 h-4 text-forest-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Message or type items (e.g. 'I have 3 eggs, bread, butter' or 'apple, oats, honey')..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-charcoal-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 placeholder-stone-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={!quickInput.trim() || isParsingQuick}
              className="px-4 py-2.5 rounded-2xl bg-forest-700 hover:bg-forest-800 disabled:bg-stone-200 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              {isParsingQuick ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Add Items</span>
            </button>
          </form>

          {/* Quick Combo Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
              <Zap className="w-3 h-3 text-amberFood-600 fill-amberFood-600" />
              <span>Quick Test Combos:</span>
            </span>
            {[
              { label: '🍳 Egg Toast (American)', items: ['Egg', 'Bread', 'Butter', 'Cooking Oil'] },
              { label: '🥡 Cantonese Fried Rice (Chinese)', items: ['Rice', 'Egg', 'Cooking Oil', 'Garlic'] },
              { label: '🌮 Chicken Fajitas (Mexican)', items: ['Chicken', 'Bell Pepper', 'Onion', 'Cooking Oil'] },
              { label: '🍝 Aglio e Olio (Italian)', items: ['Pasta', 'Garlic', 'Olive Oil'] },
              { label: '🥘 Tawa Paneer (Indian)', items: ['Paneer', 'Cooking Oil', 'Capsicum', 'Onion'] },
              { label: '🌾 Telangana Pachi Pulusu', items: ['Tamarind', 'Onion', 'Green Chilli', 'Curry Leaves', 'Cooking Oil'] },
              { label: '🍎 Spiced Apple Oats', items: ['Apple', 'Oats', 'Honey', 'Milk'] },
            ].map((combo) => (
              <button
                key={combo.label}
                type="button"
                onClick={() => handleApplyCombo(combo.items)}
                className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-forest-50 hover:text-forest-700 hover:border-forest-300 border border-stone-200 text-stone-700 font-semibold whitespace-nowrap transition-all"
              >
                {combo.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>Ingredients In Your Basket ({ingredients.length})</span>
            </span>
            {ingredients.length > 0 && (
              <button
                onClick={() => setIngredients([])}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {ingredients.length === 0 ? (
            <div className="bg-amberFood-50/60 border border-amberFood-200/80 rounded-2xl p-4 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amberFood-600 flex-shrink-0" />
                <span>
                  Currently showing our entire recipe catalog. Type or message ingredients above, or{' '}
                  <button onClick={onOpenScan} className="font-bold text-forest-700 underline">
                    scan your items
                  </button>{' '}
                  to generate recipes <strong>exclusively</strong> from what you have!
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold shadow-xs"
                >
                  <img
                    src={getIngredientImage(ing)}
                    alt={ing}
                    className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-black/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <span>{ing}</span>
                  <button
                    onClick={() => setIngredients((prev) => prev.filter((i) => i !== ing))}
                    className="hover:text-red-600 ml-1 text-stone-400 hover:bg-stone-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search & Quick Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recipes or dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs text-charcoal-900 focus:outline-none focus:border-forest-600 shadow-sm"
          />
        </div>

        {/* Diet & Cuisine Filter Pills */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {/* Diet Pills */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
            {[
              { label: 'All', val: 'Any' },
              { label: 'Veg 🥬', val: 'Vegetarian' },
              { label: 'Non-Veg 🍗', val: 'Non-Vegetarian' },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setDietType(d.val)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  dietType === d.val
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-charcoal-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-stone-200 hidden sm:block" />

          {/* Cuisine Pills with Telangana highlighted */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { val: 'Any', label: 'All Cuisines' },
              { val: 'Telangana', label: 'Telangana 🌶️' },
              { val: 'Indian', label: 'Indian 🍛' },
              { val: 'Chinese', label: 'Chinese 🥡' },
              { val: 'Italian', label: 'Italian 🍝' },
              { val: 'Mexican', label: 'Mexican 🌮' },
              { val: 'Thai', label: 'Thai 🥥' },
              { val: 'Japanese', label: 'Japanese 🍱' },
              { val: 'French', label: 'French 🥖' },
              { val: 'American', label: 'American 🍔' },
              { val: 'Middle Eastern', label: 'Middle Eastern 🧆' },
              { val: 'Korean', label: 'Korean 🥢' },
              { val: 'Mediterranean', label: 'Mediterranean 🫒' },
              { val: 'Continental', label: 'Continental' },
            ].map((c) => (
              <button
                key={c.val}
                onClick={() => setCuisine(c.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  cuisine === c.val
                    ? 'bg-forest-700 text-white shadow-sm'
                    : c.val === 'Telangana'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-bold'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-forest-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs (Ready to Cook vs Extra Recipes with 1-3 missing items vs Telangana) */}
      {ingredients.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeCategory === 'all'
                ? 'bg-charcoal-900 text-white shadow-md'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-forest-300'
            }`}
          >
            <span>All Results</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
              {filteredRecipes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('ready_to_cook')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeCategory === 'ready_to_cook'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✨ Ready To Cook (0 Missing)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'ready_to_cook' ? 'bg-emerald-900 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
              {readyToCookList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('extra_missing')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeCategory === 'extra_missing'
                ? 'bg-amber-700 text-white shadow-md'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>🛒 Extra Recipes (1-3 Missing)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'extra_missing' ? 'bg-amber-900 text-white' : 'bg-amber-200 text-amber-900'}`}>
              {extraList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('telangana')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeCategory === 'telangana'
                ? 'bg-orange-700 text-white shadow-md'
                : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            <span>🌾 Telangana Heritage 🌶️</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === 'telangana' ? 'bg-orange-900 text-white' : 'bg-orange-200 text-orange-900'}`}>
              {telanganaList.length}
            </span>
          </button>
        </div>
      )}

      {/* Recipes Display Area */}
      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-forest-600 mx-auto" />
          <p className="font-bold text-sm text-charcoal-900 mt-4">
            Computing recipe suggestions…
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Analyzing ingredient availability, 100% matches, and Telangana cuisine specialties
          </p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center max-w-lg mx-auto shadow-soft">
          <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-4 text-2xl">
            🍲
          </div>
          <h3 className="font-display font-bold text-xl text-charcoal-900">
            No recipes matched these filters
          </h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Try relaxing your cooking time or cuisine filters, or add more staples to your ingredients basket.
          </p>
          <button
            onClick={() => {
              setCuisine('Any');
              setMaxCookingTime(undefined);
              setMealType('Any');
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="mt-6 px-6 py-2.5 rounded-xl bg-forest-700 text-white font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : ingredients.length > 0 && activeCategory === 'all' ? (
        /* Categorized dual-section layout for scanned ingredients */
        <div className="space-y-12">
          {/* SECTION 1: Ready to Cook (100% Match) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-white border border-emerald-200 shadow-soft">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready To Cook</span>
                  </span>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-emerald-950">
                    Made ONLY With Your Uploaded Ingredients
                  </h2>
                </div>
                <p className="text-xs text-emerald-800 mt-1.5 leading-relaxed">
                  Zero grocery runs required! You have all the core ingredients right now in your kitchen.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-sm">
                  {readyToCookList.length} Dishes Available
                </span>
              </div>
            </div>

            {readyToCookList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {readyToCookList.map((item) => (
                  <RecipeCard
                    key={item.recipe.id}
                    scoredRecipe={item}
                    onSelect={(id) => onSelectRecipe(id, ingredients)}
                    onToggleFavorite={handleToggleFavorite}
                    isSaved={savedRecipeIds.includes(item.recipe.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-200 text-center">
                <p className="text-sm font-semibold text-emerald-900">
                  No 100% matches found for this specific subset alone.
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Look below for delicious recipes that require just 1 or 2 more items!
                </p>
              </div>
            )}
          </div>

          {/* SECTION 2: Extra Recipes (Just 1-3 items missing) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-amber-50/60 to-white border border-amber-200 shadow-soft">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Extra Recipes</span>
                  </span>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-amber-950">
                    Need Just 1 to 3 More Ingredients
                  </h2>
                </div>
                <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
                  Unlock these authentic recipes by grabbing just 2 or 3 missing items on your next kitchen run.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-sm">
                  {extraList.length} Recipes Unlocked
                </span>
              </div>
            </div>

            {extraList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {extraList.map((item) => (
                  <RecipeCard
                    key={item.recipe.id}
                    scoredRecipe={item}
                    onSelect={(id) => onSelectRecipe(id, ingredients)}
                    onToggleFavorite={handleToggleFavorite}
                    isSaved={savedRecipeIds.includes(item.recipe.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-amber-50/50 border border-amber-200 text-center">
                <p className="text-sm font-semibold text-amber-900">
                  No near-matches within 1-3 missing items with current filters.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 3: Other Recipe Inspirations (Optional) */}
          {otherList.length > 0 && (
            <div>
              <div className="mb-4">
                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  Other Culinary Ideas
                </h3>
                <p className="text-xs text-stone-500">
                  Recipes requiring more ingredients to prepare.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherList.map((item) => (
                  <RecipeCard
                    key={item.recipe.id}
                    scoredRecipe={item}
                    onSelect={(id) => onSelectRecipe(id, ingredients)}
                    onToggleFavorite={handleToggleFavorite}
                    isSaved={savedRecipeIds.includes(item.recipe.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Single Category / Filter View */
        <div>
          {activeCategory === 'ready_to_cook' && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <h2 className="font-display font-bold text-lg text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Ready To Cook (0 Missing Items) — {readyToCookList.length} Recipes</span>
              </h2>
              <p className="text-xs text-emerald-800 mt-1">
                Showing recipes you can cook immediately using only your uploaded pantry ingredients.
              </p>
            </div>
          )}

          {activeCategory === 'extra_missing' && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h2 className="font-display font-bold text-lg text-amber-950 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Extra Recipes (1 to 3 Missing Items) — {extraList.length} Recipes</span>
              </h2>
              <p className="text-xs text-amber-800 mt-1">
                Showing recipes where you only need 1, 2, or 3 additional items to cook.
              </p>
            </div>
          )}

          {activeCategory === 'telangana' && (
            <div className="mb-6 p-4 rounded-2xl bg-orange-50 border border-orange-200">
              <h2 className="font-display font-bold text-lg text-orange-950 flex items-center gap-2">
                <span>🌾 Telangana Cuisine Heritage Specialties — {telanganaList.length} Recipes</span>
              </h2>
              <p className="text-xs text-orange-800 mt-1">
                Featuring authentic Telangana regional dishes: Sarva Pindi, Pachi Pulusu, Bagara Rice, Makka Garelu, Golichina Mamsam, and more.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeCategory === 'ready_to_cook'
              ? readyToCookList
              : activeCategory === 'extra_missing'
              ? extraList
              : activeCategory === 'telangana'
              ? telanganaList
              : filteredRecipes
            ).map((item) => (
              <RecipeCard
                key={item.recipe.id}
                scoredRecipe={item}
                onSelect={(id) => onSelectRecipe(id, ingredients)}
                onToggleFavorite={handleToggleFavorite}
                isSaved={savedRecipeIds.includes(item.recipe.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filter Modal (Section 12 Preference Filters) */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 my-8 text-charcoal-900">
            <button
              onClick={() => setShowFiltersModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-charcoal-900 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-xl text-charcoal-900 mb-1">
              Recipe Preference Filter
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Customize meal type, cooking speed, cuisine, and budget.
            </p>

            <div className="space-y-5 text-left">
              {/* Diet Type */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Dietary Preference
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Any', val: 'Any' },
                    { label: 'Veg 🥬', val: 'Vegetarian' },
                    { label: 'Non-Veg 🍗', val: 'Non-Vegetarian' },
                    { label: 'Egg 🍳', val: 'Eggetarian' },
                  ].map((d) => (
                    <button
                      key={d.val}
                      onClick={() => setDietType(d.val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        dietType === d.val
                          ? 'bg-forest-700 text-white border-forest-700'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine Preference */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Cuisine
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'Any', label: 'Any' },
                    { val: 'Telangana', label: 'Telangana 🌶️' },
                    { val: 'Indian', label: 'Indian 🍛' },
                    { val: 'Chinese', label: 'Chinese 🥡' },
                    { val: 'Italian', label: 'Italian 🍝' },
                    { val: 'Mexican', label: 'Mexican 🌮' },
                    { val: 'Thai', label: 'Thai 🥥' },
                    { val: 'Japanese', label: 'Japanese 🍱' },
                    { val: 'French', label: 'French 🥖' },
                    { val: 'American', label: 'American 🍔' },
                    { val: 'Middle Eastern', label: 'Middle Eastern 🧆' },
                    { val: 'Korean', label: 'Korean 🥢' },
                    { val: 'Mediterranean', label: 'Mediterranean 🫒' },
                    { val: 'Continental', label: 'Continental' },
                  ].map((c) => (
                    <button
                      key={c.val}
                      onClick={() => setCuisine(c.val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        cuisine === c.val
                          ? 'bg-forest-700 text-white border-forest-700'
                          : c.val === 'Telangana'
                          ? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {['Any', 'Breakfast', 'Lunch', 'Dinner', 'Snack'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMealType(m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        mealType === m
                          ? 'bg-forest-700 text-white border-forest-700'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooking Time */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Maximum Cooking Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '< 15 min', val: 15 },
                    { label: '< 30 min', val: 30 },
                    { label: '< 60 min', val: 60 },
                    { label: 'Any time', val: undefined },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setMaxCookingTime(t.val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        maxCookingTime === t.val
                          ? 'bg-forest-700 text-white border-forest-700'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Any', 'Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        difficulty === d
                          ? 'bg-forest-700 text-white border-forest-700'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Estimated Meal Budget
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '₹100', val: 100 },
                    { label: '₹250', val: 250 },
                    { label: '₹500', val: 500 },
                    { label: '₹1000+', val: 1000 },
                  ].map((b) => (
                    <button
                      key={b.label}
                      onClick={() => setBudget(b.val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        budget === b.val
                          ? 'bg-amberFood-600 text-white border-amberFood-600'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Servings Counter */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">
                  Number of Servings
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="w-10 h-10 rounded-xl border border-stone-300 flex items-center justify-center font-bold hover:bg-stone-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display font-bold text-lg">{servings} Servings</span>
                  <button
                    onClick={() => setServings((s) => s + 1)}
                    className="w-10 h-10 rounded-xl border border-stone-300 flex items-center justify-center font-bold hover:bg-stone-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFiltersModal(false)}
              className="mt-8 w-full py-3.5 rounded-2xl bg-forest-700 text-white font-bold text-sm shadow-md hover:bg-forest-800 transition-all"
            >
              Apply Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
