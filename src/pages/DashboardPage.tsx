import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  Heart,
  Plus,
  Zap,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ScoredRecipe, Recipe, PantryItem } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { getCuratedDishImage } from '../utils/recipeImages';

interface DashboardPageProps {
  onOpenScan: () => void;
  onSelectRecipe: (id: string, ingredients: string[]) => void;
  onNavigate: (view: string) => void;
  onSetIngredientsAndSearch: (ingredients: string[]) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenScan,
  onSelectRecipe,
  onNavigate,
  onSetIngredientsAndSearch,
}) => {
  const { user } = useAuth();

  const [manualInput, setManualInput] = useState('');
  const [quickIngredients, setQuickIngredients] = useState<string[]>([
    'Tomato',
    'Onion',
    'Potato',
    'Green Chilli',
    'Coriander',
  ]);
  const [featuredRecipes, setFeaturedRecipes] = useState<ScoredRecipe[]>([]);
  const [quickMeals, setQuickMeals] = useState<Recipe[]>([]);
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [recRes, allRes, wasteRes] = await Promise.all([
        api.getRecommendations({
          ingredients: quickIngredients,
          dietType: user?.preferences?.diet_type || 'Vegetarian',
          cuisine: user?.preferences?.cuisine_preferences?.[0] || 'Indian',
        }).catch(() => ({ recommendations: [] })),
        api.getAllRecipes().catch(() => ({ recipes: [] })),
        api.getFoodWasteData().catch(() => ({ items: [] })),
      ]);

      setFeaturedRecipes(recRes.recommendations || []);
      setQuickMeals(
        (allRes.recipes || []).filter((r) => r.total_time <= 25).slice(0, 3)
      );
      setExpiringItems(wasteRes.items || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManualTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const names = manualInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setQuickIngredients((prev) => [...new Set([...prev, ...names])]);
    setManualInput('');
  };

  const handleFindMealsForBasket = () => {
    onSetIngredientsAndSearch(quickIngredients);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* Personalized Hero Header & Main Scanner CTA */}
      <div className="bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border border-stone-200/90 shadow-soft relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
            <span>Kitchen Assistant Ready</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-charcoal-900 tracking-tight">
            “What are we cooking today, {user ? user.name.split(' ')[0] : 'Chef'}?”
          </h1>
          <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
            Snap your groceries or enter your pantry ingredients to turn what you have into what you'll love.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenScan}
              className="px-6 py-3.5 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-food transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>📸 Scan My Ingredients</span>
            </button>

            <button
              onClick={() => onNavigate('food-waste')}
              className="px-5 py-3.5 rounded-2xl bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 font-bold text-xs transition-all flex items-center gap-2"
            >
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Use Soon (Expiring Produce)</span>
            </button>
          </div>
        </div>

        {/* Quick Manual Entry Strip (Section 10) */}
        <div className="mt-8 pt-6 border-t border-stone-100">
          <span className="block text-xs font-bold text-stone-600 uppercase mb-2">
            ✍️ Or Enter Ingredients Manually (Comma separated)
          </span>
          <form onSubmit={handleAddManualTag} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              type="text"
              placeholder="e.g. Tomato, onion, potato, rice, eggs"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-forest-600"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-950 text-white font-bold text-xs"
            >
              Add To Basket
            </button>
          </form>

          {/* Basket Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-400 mr-1">Your Basket:</span>
            {quickIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold"
              >
                <CheckCircle2 className="w-3 h-3 text-forest-600" />
                <span>{item}</span>
                <button
                  onClick={() => setQuickIngredients((prev) => prev.filter((i) => i !== item))}
                  className="hover:text-red-600 ml-1 text-stone-400"
                >
                  &times;
                </button>
              </span>
            ))}
            <button
              onClick={handleFindMealsForBasket}
              className="text-xs font-bold text-forest-700 hover:underline ml-2"
            >
              Find Matching Recipes &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* "Use It Before You Lose It" Quick Callout Banner */}
      {expiringItems.length > 0 && (
        <div
          onClick={() => onNavigate('food-waste')}
          className="bg-amber-500/10 border border-amber-300/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-amber-500/15 transition-all shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amberFood-500 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
              🍅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-charcoal-900">
                  “Use It Before You Lose It”
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amberFood-100 text-amber-800">
                  {expiringItems.length} at risk
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {expiringItems.map((i) => i.ingredient_name).slice(0, 3).join(', ')} may expire in 1-2 days. Let's make something delicious before they spoil!
              </p>
            </div>
          </div>

          <button className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs shadow-sm flex items-center gap-1.5 flex-shrink-0">
            <span>Find Recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Section 1: Based On Your Ingredients (Scored Recommendations) */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
              Based On Your Kitchen Ingredients
            </h2>
            <p className="text-xs text-stone-500">
              Ranked with NALA AI explainable recipe matching engine
            </p>
          </div>
          <button
            onClick={() => onNavigate('recipes')}
            className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
          >
            <span>See All Recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredRecipes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center text-xs text-stone-500">
            No matching recipes found yet. Try scanning or adding produce above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecipes.slice(0, 3).map((item) => (
              <RecipeCard
                key={item.recipe.id}
                scoredRecipe={item}
                onSelect={(id) => onSelectRecipe(id, quickIngredients)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Quick 15-Minute Meals */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-forest-700" />
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
                Quick 15 to 25-Minute Meals
              </h2>
              <p className="text-xs text-stone-500">Fast, comforting dinners with minimal prep</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {quickMeals.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id, quickIngredients)}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-soft hover:shadow-soft-lg transition-all overflow-hidden cursor-pointer group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                <img
                  src={getCuratedDishImage(recipe.name, recipe.image_url)}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-white/95 text-xs font-bold text-charcoal-900">
                  ⏱ {recipe.total_time} min
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-base text-charcoal-900 group-hover:text-forest-700 transition-colors line-clamp-1">
                  {recipe.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {recipe.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
