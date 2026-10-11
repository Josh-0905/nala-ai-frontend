import React, { useState } from 'react';
import { User, ShieldCheck, Check, Save, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUserPreferences, logout } = useAuth();
  const { showToast } = useToast();

  const prefs = user?.preferences;

  const [dietType, setDietType] = useState(prefs?.diet_type || 'Vegetarian');
  const [restrictions, setRestrictions] = useState<string[]>(prefs?.dietary_restrictions || []);
  const [allergiesText, setAllergiesText] = useState((prefs?.allergies || []).join(', '));
  const [cuisines, setCuisines] = useState<string[]>(prefs?.cuisine_preferences || ['Indian']);
  const [cookingPrefs, setCookingPrefs] = useState<string[]>(prefs?.cooking_preferences || ['Quick meals']);
  const [budget, setBudget] = useState(prefs?.budget || 500);
  const [isSaving, setIsSaving] = useState(false);

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedAllergies = allergiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateUserPreferences({
        diet_type: dietType,
        dietary_restrictions: restrictions,
        allergies: parsedAllergies,
        cuisine_preferences: cuisines,
        cooking_preferences: cookingPrefs,
        budget,
      });

      showToast('Profile & preferences updated successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to update preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-charcoal-900">
          Please sign in to view and edit your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* User Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={user.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-forest-600 shadow-md"
          />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display font-bold text-2xl text-charcoal-900">{user.name}</h1>
              <span className="px-2 py-0.5 rounded-md bg-forest-100 text-forest-800 text-[11px] font-bold">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cream-200 text-charcoal-800">
                {dietType}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cream-200 text-charcoal-800">
                Budget: ₹{budget}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-stone-200 hover:border-red-300 text-xs font-bold text-stone-600 hover:text-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Diet Type */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft">
          <h3 className="font-display font-bold text-base text-charcoal-900 mb-1">
            Food Preference
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            How would you describe your standard diet?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'].map((diet) => (
              <button
                key={diet}
                type="button"
                onClick={() => setDietType(diet)}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                  dietType === diet
                    ? 'border-forest-600 bg-forest-50 text-forest-800 shadow-sm'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{diet}</span>
                {dietType === diet && <Check className="w-4 h-4 text-forest-700" />}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft">
          <h3 className="font-display font-bold text-base text-charcoal-900 mb-1">
            Dietary Restrictions
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Select items you actively avoid.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Gluten-free',
              'Dairy-free',
              'Low-carb',
              'Low-sugar',
              'High-protein',
              'Jain',
              'Nut-free',
            ].map((item) => {
              const selected = restrictions.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(restrictions, setRestrictions, item)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selected
                      ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Allergies Avoidance */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-base text-charcoal-900">
              Allergies (Strict Block)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
              Zero Tolerance
            </span>
          </div>
          <p className="text-xs text-stone-500 mb-3">
            NALA AI will automatically exclude any recipes containing these ingredients.
          </p>
          <input
            type="text"
            placeholder="e.g. Peanuts, Shellfish, Soy, Mustard"
            value={allergiesText}
            onChange={(e) => setAllergiesText(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-forest-600"
          />
        </div>

        {/* Cuisines & Goals */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="font-display font-bold text-base text-charcoal-900 mb-1">
              Favorite Cuisines
            </h3>
            <p className="text-xs text-stone-500 mb-3">Priority flavor profiles</p>
            <div className="flex flex-wrap gap-1.5">
              {['Indian', 'North Indian', 'South Indian', 'Italian', 'Chinese', 'Mexican', 'Continental'].map(
                (c) => {
                  const selected = cuisines.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleItem(cuisines, setCuisines, c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-amberFood-600 text-white border-amberFood-600'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {c}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-base text-charcoal-900 mb-1">
              Cooking Goals
            </h3>
            <p className="text-xs text-stone-500 mb-3">Style of cooking</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Quick meals',
                'Healthy meals',
                'Budget meals',
                'High protein',
                'Family meals',
                'Beginner friendly',
              ].map((g) => {
                const selected = cookingPrefs.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleItem(cookingPrefs, setCookingPrefs, g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-forest-700 text-white border-forest-700'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Budget Setting */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft">
          <h3 className="font-display font-bold text-base text-charcoal-900 mb-1">
            Default Meal Budget Target
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Expected estimated grocery cost per meal preparation.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[100, 250, 500, 1000].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                  budget === b
                    ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                ₹{b}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-food transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Preferences'}</span>
        </button>
      </form>
    </div>
  );
};
