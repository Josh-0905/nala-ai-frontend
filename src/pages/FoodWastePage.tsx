import React, { useState, useEffect } from 'react';
import {
  Leaf,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { PantryItem, ScoredRecipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface FoodWastePageProps {
  onSelectRecipe: (id: string, ingredients: string[]) => void;
}

export const FoodWastePage: React.FC<FoodWastePageProps> = ({ onSelectRecipe }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<ScoredRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New item form
  const [name, setName] = useState('');
  const [daysLeft, setDaysLeft] = useState('2');
  const [quantity, setQuantity] = useState('2');
  const [unit, setUnit] = useState('pcs');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFoodWasteData();
      setItems(res.items || []);
      setRecipes(res.recipes || []);
    } catch (err: any) {
      console.warn('Food waste error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsAdding(true);
    try {
      await api.addPantryItem({
        ingredient_name: name.trim(),
        days_until_expiry: parseInt(daysLeft) || 2,
        quantity: parseFloat(quantity) || 1,
        unit,
      });
      setName('');
      await fetchData();
      showToast('Tracked ingredient in your expiring pantry!', 'success');
    } catch (err: any) {
      showToast('Sign in to track your expiring groceries.', 'info');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.deletePantryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast('Item removed.', 'info');
    } catch (err: any) {
      showToast('Could not remove item.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Banner */}
      <div className="bg-forest-800 text-white rounded-3xl p-6 sm:p-10 mb-8 relative overflow-hidden shadow-food">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/80 border border-forest-600 text-forest-200 text-xs font-bold mb-3">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Food Waste Initiative</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
            “Use It Before You Lose It”
          </h1>
          <p className="mt-2 text-forest-100 text-xs sm:text-sm leading-relaxed">
            Track produce and dairy nearing their expiration date. NALA AI prioritizes recipes that use these items first, saving you money and preventing food waste.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Track Expiring Produce */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft">
            <h3 className="font-display font-bold text-lg text-charcoal-900 mb-1">
              Add Expiring Ingredient
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter produce or dairy you need to consume this week.
            </p>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomatoes, Fresh Spinach, Milk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-forest-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Days Left
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={daysLeft}
                    onChange={(e) => setDaysLeft(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs text-center focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Track in Pantry</span>
              </button>
            </form>
          </div>

          {/* List of at-risk items */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft">
            <h3 className="font-display font-bold text-sm text-charcoal-900 mb-3">
              Expiring Soonest ({items.length})
            </h3>

            {items.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">
                No items marked as expiring. All kitchen supplies are fresh!
              </p>
            ) : (
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                        ⚠️
                      </div>
                      <div>
                        <span className="font-bold text-charcoal-900 block">
                          {item.ingredient_name}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md text-[10px]">
                        {item.days_until_expiry} days left
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Priority Recipes */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-charcoal-900">
                Recommended Priority Recipes
              </h3>
              <p className="text-xs text-stone-500">
                Dishes specially chosen to use your expiring produce first
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-forest-600 mx-auto" />
            </div>
          ) : recipes.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center shadow-soft">
              <p className="text-xs text-stone-500">
                Track expiring ingredients on the left to see instant matching recipes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipes.map((item) => (
                <RecipeCard
                  key={item.recipe.id}
                  scoredRecipe={item}
                  onSelect={(id) => onSelectRecipe(id, items.map((i) => i.ingredient_name))}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
