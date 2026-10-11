import React, { useState, useEffect } from 'react';
import { Heart, Clock, Star, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Recipe } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { getCuratedDishImage } from '../utils/recipeImages';

interface FavoritesHistoryPageProps {
  onSelectRecipe: (id: string) => void;
}

export const FavoritesHistoryPage: React.FC<FavoritesHistoryPageProps> = ({ onSelectRecipe }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [favRes, histRes] = await Promise.all([
        api.getFavorites().catch(() => ({ favorites: [] })),
        api.getHistory().catch(() => ({ history: [] })),
      ]);
      setFavorites(favRes.favorites || []);
      setHistory(histRes.history || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      await api.toggleFavorite(recipeId);
      setFavorites((prev) => prev.filter((r) => r.id !== recipeId));
      showToast('Removed from favorites', 'info');
    } catch (err: any) {
      showToast('Could not remove favorite', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Cookbook & Log
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Access your saved favorites and track meals cooked with NALA AI.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-stone-100 border border-stone-200">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-white text-forest-800 shadow-sm'
                : 'text-stone-600 hover:text-charcoal-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>My Favorites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-forest-800 shadow-sm'
                : 'text-stone-600 hover:text-charcoal-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amberFood-600" />
            <span>Recently Cooked ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Favorites Tab Content */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center max-w-md mx-auto shadow-soft">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3 text-xl">
                ❤️
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                “Your recipe collection is waiting.”
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Click the heart icon on any recipe card to save it here for quick access later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => onSelectRecipe(recipe.id)}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-soft overflow-hidden cursor-pointer hover:shadow-soft-lg transition-all group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img
                      src={getCuratedDishImage(recipe.name, recipe.image_url)}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(recipe.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-sm"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 text-xs font-bold text-charcoal-900">
                      {recipe.cuisine}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-base text-charcoal-900 group-hover:text-forest-700 transition-colors">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 text-xs font-semibold text-stone-500">
                      <span>⏱ {recipe.total_time} min</span>
                      <span className="text-forest-700 flex items-center gap-1">
                        Cook &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center max-w-md mx-auto shadow-soft">
              <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-3 text-xl">
                🍳
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                “Your cooking journey starts here.”
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                When you finish a recipe in Cooking Mode, it will be automatically recorded here with your rating and personal notes.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {history.map((item: any) => (
                <div
                  key={item.history_id || item.id}
                  onClick={() => onSelectRecipe(item.id)}
                  className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-soft hover:shadow-soft-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getCuratedDishImage(item.name, item.image_url)}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-stone-200 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-charcoal-900">
                          {item.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                          {item.cuisine}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-stone-500 mt-1 italic line-clamp-1">
                          “{item.notes}”
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                        <span>
                          {item.cooked_at ? new Date(item.cooked_at).toLocaleDateString() : 'Recently'}
                        </span>
                        <span>•</span>
                        <div className="flex items-center text-amberFood-500">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="px-4 py-2 rounded-xl bg-forest-50 text-forest-700 hover:bg-forest-100 font-bold text-xs self-end sm:self-auto flex items-center gap-1">
                    <span>Cook Again</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
