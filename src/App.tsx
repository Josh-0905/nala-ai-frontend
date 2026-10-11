import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanPage } from './pages/ScanPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { FoodWastePage } from './pages/FoodWastePage';
import { FavoritesHistoryPage } from './pages/FavoritesHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthModal } from './pages/AuthModal';

export const App: React.FC = () => {
  const { user } = useAuth();

  // Navigation views: 'landing' | 'dashboard' | 'scan' | 'recipes' | 'recipe-detail' | 'shopping-list' | 'food-waste' | 'favorites' | 'profile' | 'admin'
  const [currentView, setCurrentView] = useState<string>(user ? 'dashboard' : 'landing');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [currentIngredients, setCurrentIngredients] = useState<string[]>([]);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'onboarding'>('login');

  const handleOpenAuth = (mode: 'login' | 'signup' | 'onboarding') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIngredientsConfirmed = (ingredients: string[]) => {
    setCurrentIngredients(ingredients);
    handleNavigate('recipes');
  };

  const handleSelectRecipe = (id: string, ingredients?: string[]) => {
    setSelectedRecipeId(id);
    if (ingredients) {
      setCurrentIngredients(ingredients);
    }
    handleNavigate('recipe-detail');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between text-charcoal-900 pb-16 md:pb-0">
      {/* Top and Mobile Bottom Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStart={() => {
              if (user) {
                handleNavigate('scan');
              } else {
                handleOpenAuth('signup');
              }
            }}
            onExploreRecipes={() => handleNavigate('recipes')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            onOpenScan={() => handleNavigate('scan')}
            onSelectRecipe={handleSelectRecipe}
            onNavigate={handleNavigate}
            onSetIngredientsAndSearch={(items) => {
              setCurrentIngredients(items);
              handleNavigate('recipes');
            }}
          />
        )}

        {currentView === 'scan' && (
          <ScanPage
            initialIngredients={currentIngredients}
            onIngredientsConfirmed={handleIngredientsConfirmed}
          />
        )}

        {currentView === 'recipes' && (
          <RecipesPage
            initialIngredients={currentIngredients}
            onSelectRecipe={handleSelectRecipe}
            onOpenScan={() => handleNavigate('scan')}
          />
        )}

        {currentView === 'recipe-detail' && selectedRecipeId && (
          <RecipeDetailPage
            recipeId={selectedRecipeId}
            userIngredients={currentIngredients}
            onBack={() => handleNavigate('recipes')}
            onOpenShoppingList={() => handleNavigate('shopping-list')}
          />
        )}

        {currentView === 'shopping-list' && <ShoppingListPage />}

        {currentView === 'food-waste' && (
          <FoodWastePage onSelectRecipe={handleSelectRecipe} />
        )}

        {currentView === 'favorites' && (
          <FavoritesHistoryPage onSelectRecipe={handleSelectRecipe} />
        )}

        {currentView === 'profile' && <ProfilePage />}

        {currentView === 'admin' && <AdminDashboardPage />}
      </main>

      {/* Auth & Onboarding Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          handleNavigate('dashboard');
        }}
      />
    </div>
  );
};
export default App;
