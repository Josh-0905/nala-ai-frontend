import React from 'react';
import { NutritionData } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface NutritionCardProps {
  nutrition: NutritionData;
  servings?: number;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ nutrition, servings = 2 }) => {
  const items = [
    { label: 'Calories', value: `${nutrition.calories}`, unit: 'kcal', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Protein', value: `${nutrition.protein}`, unit: 'g', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: 'Carbs', value: `${nutrition.carbs}`, unit: 'g', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { label: 'Fat', value: `${nutrition.fat}`, unit: 'g', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { label: 'Fiber', value: `${nutrition.fiber}`, unit: 'g', color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { label: 'Sodium', value: `${nutrition.sodium}`, unit: 'mg', color: 'text-stone-700 bg-stone-50 border-stone-200' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-charcoal-900">
            Estimated Nutrition
          </h3>
          <p className="text-xs text-stone-600">Calculated per serving (serves {servings})</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
          <span>AI Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${item.color}`}
          >
            <span className="text-xs font-semibold opacity-75">{item.label}</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-bold font-display">{item.value}</span>
              <span className="text-xs font-medium opacity-80">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-start gap-2 text-[11px] text-stone-600 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-stone-600 mt-0.5 flex-shrink-0" />
        <span>
          Disclaimer: AI nutritional estimates are generated for general culinary guidance and should not be treated as clinical or dietary medical advice.
        </span>
      </div>
    </div>
  );
};
