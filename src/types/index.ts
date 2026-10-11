export interface UserPreferences {
  diet_type: string; // Vegetarian, Non-Vegetarian, Vegan, Eggetarian
  dietary_restrictions: string[]; // Gluten-free, Dairy-free, Low-carb, Low-sugar, High-protein, Jain, Nut-free
  cuisine_preferences: string[]; // Indian, South Indian, North Indian, Chinese, Italian, Mexican, Continental
  cooking_preferences: string[]; // Quick meals, Healthy meals, Budget meals, High protein, Family meals, Beginner friendly
  allergies: string[];
  budget: number; // in INR
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_image?: string;
  preferences?: UserPreferences;
}

export interface DetectedIngredient {
  name: string;
  confidence: number;
  category: string;
  confirmed?: boolean;
  image?: string;
}

export interface RecipeInstruction {
  step: number;
  title?: string;
  instruction: string;
  timerMinutes?: number;
  tip?: string;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  meal_type: string;
  diet_type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  preparation_time: number;
  cooking_time: number;
  total_time: number;
  servings: number;
  instructions: RecipeInstruction[];
  nutrition_data: NutritionData;
  estimated_cost: number;
  image_url: string;
  tags?: string[];
  saved_at?: string;
  cooked_at?: string;
  rating?: number;
  reviewCount?: number;
  notes?: string;
}

export interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  matchPercentage: number;
  is100PercentMatch?: boolean;
  missingCount?: number;
  ingredientStatus: {
    available: { name: string; quantity: number; unit: string }[];
    missing: { name: string; quantity: number; unit: string }[];
  };
  scoreBreakdown?: {
    ingredientMatchScore: number;
    dietCompatibilityScore: number;
    userPreferencesScore: number;
    cookingTimeScore: number;
    difficultyScore: number;
    nutritionBudgetScore: number;
  };
  isSaved?: boolean;
}

export interface ShoppingItem {
  id: string;
  shopping_list_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  created_at: string;
}

export interface ShoppingListResponse {
  listId: string;
  items: ShoppingItem[];
  grouped: Record<string, ShoppingItem[]>;
  totalItems: number;
  purchasedCount: number;
}

export interface PantryItem {
  id: string;
  ingredient_name: string;
  category: string;
  days_until_expiry: number;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface AdminAnalytics {
  metrics: {
    totalUsers: number;
    totalRecipes: number;
    totalScans: number;
    totalCooked: number;
    totalSaved: number;
    totalShoppingItems: number;
  };
  popularRecipes: Array<{
    name: string;
    cuisine: string;
    difficulty: string;
    cook_count: number;
    avg_rating: number;
  }>;
  topIngredients: Array<{
    name: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: number;
    type: string;
    text: string;
    time: string;
  }>;
}

export interface RecipeReview {
  id: string;
  recipe_id: string;
  user_id?: string | null;
  user_name: string;
  user_avatar?: string | null;
  rating: number;
  title?: string;
  comment: string;
  tags?: string[];
  helpful_count?: number;
  created_at: string;
}

export interface RecipeReviewsResponse {
  reviews: RecipeReview[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

