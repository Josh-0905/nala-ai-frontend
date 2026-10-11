import React from 'react';
import { Clock, Flame, IndianRupee, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { ScoredRecipe } from '../types';
import { getCuratedDishImage } from '../utils/recipeImages';

interface RecipeCardProps {
  scoredRecipe: ScoredRecipe;
  onSelect: (recipeId: string) => void;
  onToggleFavorite?: (recipeId: string) => void;
  isSaved?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  scoredRecipe,
  onSelect,
  onToggleFavorite,
  isSaved = false,
}) => {
  const recipe = scoredRecipe.recipe || (scoredRecipe as any);
  if (!recipe || !recipe.id) return null;

  const matchPercentage = scoredRecipe.matchPercentage !== undefined ? scoredRecipe.matchPercentage : ((scoredRecipe as any).score || 0);
  const ingredientStatus = scoredRecipe.ingredientStatus || { available: [], missing: [] };
  const is100PercentMatch = scoredRecipe.is100PercentMatch;
  const availableCount = ingredientStatus?.available?.length || 0;
  const missingItems = ingredientStatus?.missing || [];
  const missingCount = scoredRecipe.missingCount !== undefined ? scoredRecipe.missingCount : missingItems.length;
  const totalIng = availableCount + missingCount;
  const isExact100 = is100PercentMatch || (totalIng > 0 && missingCount === 0);
  const isTelangana =
    (recipe.cuisine || '').toLowerCase().includes('telangana') ||
    (recipe.tags && Array.isArray(recipe.tags) && recipe.tags.some((t: string) => t.toLowerCase().includes('telangana')));

  return (
    <div
      onClick={() => onSelect(recipe.id)}
      className="group bg-white rounded-3xl border border-stone-200/80 shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1 relative"
    >
      {/* Recipe Image & Overlays */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        <img
          src={getCuratedDishImage(recipe.name, recipe.image_url)}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Match / Availability Status Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isExact100 ? (
            <div className="bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-400/40">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse"></span>
              <span>✨ 100% Match • Ready To Cook</span>
            </div>
          ) : missingCount > 0 && missingCount <= 3 ? (
            <div className="bg-amber-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-amber-400/40">
              <span className="w-2 h-2 rounded-full bg-amber-200"></span>
              <span>🛒 Missing {missingCount} {missingCount === 1 ? 'Item' : 'Items'}</span>
            </div>
          ) : matchPercentage !== undefined ? (
            <div className="bg-forest-700/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
              <span>{matchPercentage}% Match</span>
            </div>
          ) : null}

          {isTelangana && (
            <div className="bg-orange-700/90 backdrop-blur-md text-amber-100 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-orange-500/40">
              <span>🌶️ Telangana Heritage</span>
            </div>
          )}
        </div>

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
              isSaved
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-black/30 hover:bg-black/50 text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Cuisine & Diet Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold text-charcoal-900 shadow-sm">
            {recipe.cuisine}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-md ${
              recipe.diet_type === 'Vegetarian'
                ? 'bg-emerald-600/90 text-white'
                : recipe.diet_type === 'Eggetarian'
                ? 'bg-amber-600/90 text-white'
                : 'bg-stone-800/80 text-white'
            }`}
          >
            {recipe.diet_type}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-charcoal-900 group-hover:text-forest-700 transition-colors line-clamp-1">
            {recipe.name}
          </h3>
          <p className="text-stone-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 mt-4 text-xs font-medium text-stone-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-forest-700" />
              <span>{recipe.total_time} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-terracotta-500" />
              <span>{recipe.difficulty}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <IndianRupee className="w-3.5 h-3.5 text-stone-500" />
              <span>₹{recipe.estimated_cost}</span>
            </div>
          </div>
        </div>

        {/* Available vs Missing Ingredients Indicator */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col gap-2">
          {totalIng > 0 ? (
            <div>
              <div className="flex items-center justify-between text-xs">
                {isExact100 ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    All ingredients available in kitchen
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    {availableCount}/{totalIng} available ({missingCount} missing)
                  </span>
                )}
                <span className="font-semibold text-forest-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Cook &rarr;
                </span>
              </div>

              {/* Show missing ingredients pill list for close matches (1 to 3 items missing) */}
              {!isExact100 && missingItems.length > 0 && missingCount <= 3 && (
                <div className="mt-2 text-[11px] text-stone-500 bg-amber-50/80 rounded-xl px-2.5 py-1.5 border border-amber-200/60">
                  <span className="font-bold text-amber-800">Add {missingCount} item{missingCount > 1 ? 's' : ''}: </span>
                  <span className="text-amber-900">{missingItems.map((m) => m.name).slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">
                {recipe.nutrition_data?.calories || 300} kcal • {recipe.nutrition_data?.protein || 10}g protein
              </span>
              <span className="font-semibold text-forest-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Cook &rarr;
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
