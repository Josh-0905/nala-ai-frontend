import React from 'react';
import { Sparkles, Camera, BookOpen, ShoppingBag, Heart, User, LogOut, ShieldAlert, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, logout, quickDemoLogin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'scan', label: 'Scan Ingredients', icon: Camera, highlight: true },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'shopping-list', label: 'Shopping List', icon: ShoppingBag },
    { id: 'food-waste', label: 'Save Waste', icon: Leaf },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <>
      {/* Top Desktop Navigation */}
      <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-forest-700 flex items-center justify-center text-white shadow-food group-hover:scale-105 transition-transform">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl tracking-tight text-charcoal-900 group-hover:text-forest-700 transition-colors">
                  NALA <span className="text-forest-700">AI</span>
                </span>
                <span className="hidden lg:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-forest-100 text-forest-800">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-charcoal-800/70 hidden sm:block font-medium">
                Turn What You Have Into What You’ll Love.
              </p>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    item.highlight
                      ? 'bg-forest-700 text-white shadow-sm hover:bg-forest-800'
                      : isActive
                      ? 'bg-forest-50 text-forest-800 font-bold border border-forest-200'
                      : 'text-charcoal-800 hover:text-forest-700 hover:bg-stone-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-forest-700' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action / Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Admin button if admin */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      currentView === 'admin'
                        ? 'bg-amberFood-500 text-white border-amberFood-600'
                        : 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                    }`}
                    title="Admin Dashboard"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                {/* Profile Link */}
                <button
                  onClick={() => onNavigate('profile')}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all ${
                    currentView === 'profile'
                      ? 'border-forest-600 bg-forest-50 text-forest-800'
                      : 'border-stone-200 hover:border-stone-300 bg-white/70'
                  }`}
                >
                  <img
                    src={user.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200"
                  />
                  <span className="text-sm font-semibold text-charcoal-900 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={quickDemoLogin}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-forest-800 bg-forest-100 hover:bg-forest-200 transition-colors"
                  title="Instant Demo Access"
                >
                  <span>⚡ Quick Demo</span>
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-charcoal-800 hover:text-forest-700 transition-colors"
                >
                  Sign In
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold shadow-sm transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Section 31 Requirement) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/80 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            currentView === 'dashboard' || currentView === 'landing'
              ? 'text-forest-700 font-bold'
              : 'text-stone-500 hover:text-charcoal-900'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[11px]">Home</span>
        </button>

        <button
          onClick={() => onNavigate('scan')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentView === 'scan'
              ? 'bg-forest-700 text-white font-bold -translate-y-2 shadow-food'
              : 'text-forest-700 font-semibold'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[11px]">Scan</span>
        </button>

        <button
          onClick={() => onNavigate('recipes')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            currentView === 'recipes'
              ? 'text-forest-700 font-bold'
              : 'text-stone-500 hover:text-charcoal-900'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px]">Recipes</span>
        </button>

        <button
          onClick={() => onNavigate('shopping-list')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            currentView === 'shopping-list'
              ? 'text-forest-700 font-bold'
              : 'text-stone-500 hover:text-charcoal-900'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px]">List</span>
        </button>

        <button
          onClick={() => (user ? onNavigate('profile') : onOpenAuth('login'))}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            currentView === 'profile'
              ? 'text-forest-700 font-bold'
              : 'text-stone-500 hover:text-charcoal-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px]">{user ? 'Profile' : 'Sign In'}</span>
        </button>
      </nav>
    </>
  );
};
