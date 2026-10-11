import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { ShoppingItem, ShoppingListResponse } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export const ShoppingListPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<ShoppingListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New item inputs
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Vegetables');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnit, setItemUnit] = useState('pcs');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchShoppingList();
  }, [user]);

  const fetchShoppingList = async () => {
    setIsLoading(true);
    try {
      const res = await api.getShoppingList();
      setData(res);
    } catch (err: any) {
      console.warn('Shopping list load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    try {
      const nextState = !item.purchased;
      await api.toggleItemPurchased(item.id, nextState);
      setData((prev) => {
        if (!prev) return null;
        const updatedItems = prev.items.map((i) =>
          i.id === item.id ? { ...i, purchased: nextState } : i
        );
        // Re-group
        const newGrouped: Record<string, ShoppingItem[]> = {};
        for (const it of updatedItems) {
          const cat = it.category || 'Other';
          if (!newGrouped[cat]) newGrouped[cat] = [];
          newGrouped[cat].push(it);
        }
        return {
          ...prev,
          items: updatedItems,
          grouped: newGrouped,
          purchasedCount: updatedItems.filter((i) => i.purchased).length,
        };
      });
    } catch (err: any) {
      showToast('Sign in to sync your shopping list items.', 'info');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.deleteShoppingItem(itemId);
      setData((prev) => {
        if (!prev) return null;
        const remaining = prev.items.filter((i) => i.id !== itemId);
        const newGrouped: Record<string, ShoppingItem[]> = {};
        for (const it of remaining) {
          const cat = it.category || 'Other';
          if (!newGrouped[cat]) newGrouped[cat] = [];
          newGrouped[cat].push(it);
        }
        return {
          ...prev,
          items: remaining,
          grouped: newGrouped,
          totalItems: remaining.length,
          purchasedCount: remaining.filter((i) => i.purchased).length,
        };
      });
      showToast('Item removed from shopping list', 'info');
    } catch (err: any) {
      showToast('Could not delete item.', 'error');
    }
  };

  const handleClearPurchased = async () => {
    try {
      await api.clearPurchasedItems();
      await fetchShoppingList();
      showToast('Cleared purchased items.', 'success');
    } catch (err: any) {
      showToast('Failed to clear purchased items.', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    setIsAdding(true);
    try {
      await api.addShoppingItem({
        name: itemName.trim(),
        category: itemCategory,
        quantity: parseFloat(itemQuantity) || 1,
        unit: itemUnit,
      });
      setItemName('');
      await fetchShoppingList();
      showToast('Item added to shopping list!', 'success');
    } catch (err: any) {
      showToast('Sign in to add custom grocery items.', 'info');
    } finally {
      setIsAdding(false);
    }
  };

  const categories = Object.keys(data?.grouped || {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-forest-700" />
            <span>Smart Restock Assistant</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Kitchen Shopping List
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Grouped by grocery departments for faster market trips.
          </p>
        </div>

        {data && data.purchasedCount > 0 && (
          <button
            onClick={handleClearPurchased}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-stone-200 hover:border-red-300 text-xs font-bold text-stone-600 hover:text-red-600 transition-colors"
          >
            Clear Purchased ({data.purchasedCount})
          </button>
        )}
      </div>

      {/* Add New Item Box */}
      <form
        onSubmit={handleAddItem}
        className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-soft mb-8 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
      >
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
            Item Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Garam Masala, Coconut Milk"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-forest-600"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
            Category
          </label>
          <select
            value={itemCategory}
            onChange={(e) => setItemCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-forest-600 bg-white"
          >
            <option value="Vegetables">Vegetables</option>
            <option value="Dairy">Dairy</option>
            <option value="Spices">Spices</option>
            <option value="Grains">Grains & Lentils</option>
            <option value="Oils & Condiments">Oils & Condiments</option>
            <option value="Proteins">Proteins</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex gap-1">
          <div className="w-1/2">
            <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">Qty</label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              className="w-full px-2 py-2.5 rounded-xl border border-stone-300 text-xs text-center focus:outline-none"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">Unit</label>
            <input
              type="text"
              value={itemUnit}
              onChange={(e) => setItemUnit(e.target.value)}
              placeholder="g"
              className="w-full px-2 py-2.5 rounded-xl border border-stone-300 text-xs text-center focus:outline-none"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isAdding}
            className="w-full py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </form>

      {/* Categorized List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-forest-600 mx-auto" />
          <p className="text-xs text-stone-500 mt-2">Loading items...</p>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center max-w-md mx-auto shadow-soft">
          <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto mb-3 text-xl">
            🛒
          </div>
          <h3 className="font-display font-bold text-lg text-charcoal-900">
            “Your shopping list is empty.”
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Missing recipe ingredients will automatically appear here when you click “Add Missing Ingredients to Shopping List”.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const items = data.grouped[cat];
            if (!items || items.length === 0) return null;

            return (
              <div
                key={cat}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft"
              >
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-100">
                  <Layers className="w-4 h-4 text-forest-700" />
                  <h3 className="font-display font-bold text-base text-charcoal-900">{cat}</h3>
                  <span className="text-xs text-stone-400 font-semibold">({items.length})</span>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleTogglePurchased(item)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        item.purchased
                          ? 'bg-stone-50 border-stone-200 opacity-60'
                          : 'bg-white border-stone-200/80 hover:border-forest-400 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            item.purchased
                              ? 'bg-forest-600 border-forest-600 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {item.purchased && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            item.purchased
                              ? 'line-through text-stone-400'
                              : 'text-charcoal-900'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-500">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
