import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup' | 'onboarding';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const { login, signup, quickDemoLogin, updateUserPreferences, user } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'onboarding'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Onboarding state
  const [dietType, setDietType] = useState('Vegetarian');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [allergiesInput, setAllergiesInput] = useState('');
  const [cookingPrefs, setCookingPrefs] = useState<string[]>(['Quick meals']);
  const [budget, setBudget] = useState(500);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await login(email, password);
      showToast('Welcome back to NALA AI!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await signup({ name, email, password });
      setMode('onboarding');
      showToast('Account created! Tell us what you love to eat.', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardingSubmit = async () => {
    setIsSubmitting(true);
    try {
      const parsedAllergies = allergiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateUserPreferences({
        diet_type: dietType,
        dietary_restrictions: restrictions,
        allergies: parsedAllergies,
        cooking_preferences: cookingPrefs,
        budget,
      });

      showToast('Preferences saved! Personalizing your kitchen...', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to save preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRestriction = (item: string) => {
    setRestrictions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleCookingPref = (item: string) => {
    setCookingPrefs((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 my-8 text-charcoal-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-charcoal-900 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-forest-700 text-white flex items-center justify-center text-xl shadow-food">
            🍽️
          </div>
          <div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
              {mode === 'login'
                ? 'Welcome back'
                : mode === 'signup'
                ? 'Join NALA AI'
                : 'Personalize Your Cooking'}
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              {mode === 'onboarding'
                ? 'Step 2 of 2: Dial in your dietary filters'
                : '“Turn What You Have Into What You’ll Love.”'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* 1. Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Login Option */}
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={async () => {
                  await quickDemoLogin();
                  showToast('Signed in with Demo Account!', 'success');
                  onSuccess();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-forest-300 bg-forest-50/70 hover:bg-forest-100 text-forest-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amberFood-600 fill-amberFood-600" />
                <span>One-Click Demo Login (demo@nala.ai)</span>
              </button>
            </div>

            <p className="text-center text-xs text-stone-500 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-forest-700 hover:underline"
              >
                Create one free
              </button>
            </p>
          </form>
        )}

        {/* 2. Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Creating account...' : 'Continue to Preferences'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-stone-500 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-forest-700 hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* 3. Onboarding Questionnaire */}
        {mode === 'onboarding' && (
          <div className="space-y-6">
            {/* Diet Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                What kind of food do you prefer?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'].map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setDietType(diet)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
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
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Dietary Restrictions (Select all that apply)
              </label>
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
                      onClick={() => toggleRestriction(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-forest-700 text-white border-forest-700'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergies Avoidance */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Allergies (Strictly Blocked)
              </label>
              <input
                type="text"
                value={allergiesInput}
                onChange={(e) => setAllergiesInput(e.target.value)}
                placeholder="e.g. Peanuts, Shellfish, Soy (comma separated)"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-forest-600"
              />
              <p className="text-[11px] text-stone-600 mt-1">
                Recipes with these items will be completely excluded by the scoring engine.
              </p>
            </div>

            {/* Cooking Preferences */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Cooking Goals
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Quick meals',
                  'Healthy meals',
                  'Budget meals',
                  'High protein',
                  'Family meals',
                  'Beginner friendly',
                ].map((pref) => {
                  const selected = cookingPrefs.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => toggleCookingPref(pref)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-amberFood-600 text-white border-amberFood-600'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Onboarding */}
            <button
              type="button"
              onClick={handleOnboardingSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Saving...' : 'Complete Setup & Open Kitchen'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
