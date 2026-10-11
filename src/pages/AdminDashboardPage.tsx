import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Camera,
  ChefHat,
  Heart,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  Star,
  Activity,
} from 'lucide-react';
import { api } from '../services/api';
import { AdminAnalytics } from '../types';
import { useToast } from '../contexts/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      setData(res);
    } catch (err: any) {
      showToast('Could not load admin analytics.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-forest-600 mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-semibold">Loading platform analytics...</p>
      </div>
    );
  }

  const { metrics, popularRecipes, topIngredients, recentActivity } = data;

  const statCards = [
    { label: 'Registered Users', value: metrics.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Ingredient Scans', value: metrics.totalScans, icon: Camera, color: 'text-forest-600 bg-forest-50 border-forest-200' },
    { label: 'Catalog Recipes', value: metrics.totalRecipes, icon: ChefHat, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Meals Cooked', value: metrics.totalCooked, icon: Activity, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Favorites Saved', value: metrics.totalSaved, icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { label: 'Shopping Items', value: metrics.totalShoppingItems, icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>Admin Telemetry & Analytics</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Platform Health & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time usage metrics across ingredient scans, scoring, and cooking conversions.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold hover:bg-stone-50 flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 rounded-3xl border flex flex-col justify-between ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold opacity-80">{card.label}</span>
                <Icon className="w-4 h-4 opacity-80" />
              </div>
              <p className="font-display font-black text-2xl sm:text-3xl mt-4 text-charcoal-950">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Top Ingredients vs Popular Recipes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Most Detected Ingredients */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900">
                Most Detected Produce
              </h3>
              <p className="text-xs text-stone-500">From user camera uploads</p>
            </div>
            <TrendingUp className="w-4 h-4 text-forest-700" />
          </div>

          <div className="space-y-3">
            {topIngredients.map((item, idx) => {
              const maxCount = topIngredients[0]?.count || 1;
              const percent = Math.round((item.count / maxCount) * 100);

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-charcoal-900">
                      {idx + 1}. {item.name}
                    </span>
                    <span className="font-semibold text-stone-500">{item.count} scans</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-forest-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Popular Recipes */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900">
                Top Performing Recipes
              </h3>
              <p className="text-xs text-stone-500">Most cooked and highest rated</p>
            </div>
            <ChefHat className="w-4 h-4 text-forest-700" />
          </div>

          <div className="space-y-3">
            {popularRecipes.map((r, i) => (
              <div
                key={r.name}
                className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-forest-100 text-forest-800 font-bold flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-charcoal-900">{r.name}</h4>
                    <span className="text-[10px] text-stone-500">
                      {r.cuisine} • {r.difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="font-bold text-charcoal-900 block">{r.cook_count} cooked</span>
                    <div className="flex items-center gap-0.5 text-amberFood-600 text-[11px] justify-end">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{r.avg_rating ? Number(r.avg_rating).toFixed(1) : '5.0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft">
        <h3 className="font-display font-bold text-base text-charcoal-900 mb-4">
          Recent Activity Feed
        </h3>
        <div className="space-y-3">
          {recentActivity.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-forest-600" />
                <span className="text-charcoal-900 font-medium">{act.text}</span>
              </div>
              <span className="text-stone-400 font-medium">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
