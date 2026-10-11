import {
  User,
  UserPreferences,
  DetectedIngredient,
  ScoredRecipe,
  Recipe,
  ShoppingListResponse,
  PantryItem,
  AdminAnalytics,
  RecipeReview,
  RecipeReviewsResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('nala_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('nala_token', token);
    } else {
      localStorage.removeItem('nala_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'An unexpected error occurred');
    }

    return data;
  }

  // --- Auth APIs ---
  public async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  public async signup(payload: {
    name: string;
    email: string;
    password: string;
    preferences?: Partial<UserPreferences>;
  }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        ...payload.preferences,
      }),
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  public async updatePreferences(preferences: Partial<UserPreferences>): Promise<any> {
    return this.request('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // --- Scanner APIs ---
  public async analyzeImage(payload: {
    file?: File;
    preset?: string;
    fileName?: string;
    apiKey?: string;
    apiProvider?: 'gemini' | 'openai';
    dishHint?: string;
  }): Promise<{
    scanId: string;
    ingredients: DetectedIngredient[];
    lowConfidenceFound: boolean;
    source: string;
    message: string;
  }> {
    const savedKey = payload.apiKey || localStorage.getItem('nala_ai_key') || undefined;
    const provider = payload.apiProvider || (localStorage.getItem('nala_ai_provider') as any) || 'gemini';

    if (payload.file) {
      const formData = new FormData();
      formData.append('image', payload.file);
      if (savedKey) formData.append('apiKey', savedKey);
      formData.append('apiProvider', provider);
      if (payload.dishHint) formData.append('dishHint', payload.dishHint);
      return this.request('/scanner/analyze', {
        method: 'POST',
        body: formData,
      });
    } else {
      return this.request('/scanner/analyze', {
        method: 'POST',
        body: JSON.stringify({
          preset: payload.preset,
          fileName: payload.fileName,
          apiKey: savedKey,
          apiProvider: provider,
          dishHint: payload.dishHint,
        }),
      });
    }
  }

  public async confirmIngredients(scanId: string, confirmedIngredients: string[]): Promise<any> {
    return this.request('/scanner/confirm', {
      method: 'POST',
      body: JSON.stringify({ scanId, confirmedIngredients }),
    });
  }

  public async parseMessageIngredients(message: string): Promise<{
    ingredients: DetectedIngredient[];
    count: number;
    message: string;
  }> {
    return this.request('/scanner/parse-message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // --- Recipe APIs ---
  public async getRecommendations(filters: {
    ingredients: string[];
    cuisine?: string;
    mealType?: string;
    dietType?: string;
    allergies?: string[];
    maxCookingTime?: number;
    difficulty?: string;
    budget?: number;
    servings?: number;
  }): Promise<{
    total: number;
    recommendations: ScoredRecipe[];
    readyToCook?: ScoredRecipe[];
    extraWithMissingItems?: ScoredRecipe[];
    readyToCookCount?: number;
    extraCount?: number;
  }> {
    return this.request('/recipes/recommend', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  public async getAllRecipes(params?: {
    search?: string;
    cuisine?: string;
    dietType?: string;
  }): Promise<{ recipes: Recipe[] }> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.cuisine) q.append('cuisine', params.cuisine);
    if (params?.dietType) q.append('dietType', params.dietType);
    return this.request(`/recipes?${q.toString()}`);
  }

  public async getRecipeById(id: string, userIngredients?: string[]): Promise<ScoredRecipe> {
    const query = userIngredients?.length ? `?ingredients=${encodeURIComponent(userIngredients.join(','))}` : '';
    return this.request<ScoredRecipe>(`/recipes/${id}${query}`);
  }

  public async toggleFavorite(recipeId: string): Promise<{ saved: boolean; message: string }> {
    return this.request(`/recipes/${recipeId}/favorite`, { method: 'POST' });
  }

  public async logCooked(recipeId: string, rating: number, notes?: string): Promise<any> {
    return this.request(`/recipes/${recipeId}/cook`, {
      method: 'POST',
      body: JSON.stringify({ rating, notes }),
    });
  }

  public async getFavorites(): Promise<{ favorites: Recipe[] }> {
    return this.request('/recipes/user/favorites');
  }

  public async getHistory(): Promise<{ history: Recipe[] }> {
    return this.request('/recipes/user/history');
  }

  public async getRecipeReviews(recipeId: string): Promise<RecipeReviewsResponse> {
    return this.request<RecipeReviewsResponse>(`/recipes/${recipeId}/reviews`);
  }

  public async addRecipeReview(
    recipeId: string,
    payload: {
      rating: number;
      title?: string;
      comment: string;
      tags?: string[];
      authorName?: string;
    }
  ): Promise<{ message: string; review: RecipeReview }> {
    return this.request(`/recipes/${recipeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async markReviewHelpful(
    recipeId: string,
    reviewId: string
  ): Promise<{ success: boolean; helpfulCount: number }> {
    return this.request(`/recipes/${recipeId}/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  // --- Shopping List APIs ---
  public async getShoppingList(): Promise<ShoppingListResponse> {
    return this.request('/shopping-list');
  }

  public async addShoppingItem(item: {
    name?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    items?: Array<{ name: string; quantity: number; unit: string; category?: string }>;
  }): Promise<any> {
    return this.request('/shopping-list/add', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  public async toggleItemPurchased(itemId: string, purchased: boolean): Promise<any> {
    return this.request(`/shopping-list/item/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ purchased }),
    });
  }

  public async deleteShoppingItem(itemId: string): Promise<any> {
    return this.request(`/shopping-list/item/${itemId}`, {
      method: 'DELETE',
    });
  }

  public async clearPurchasedItems(): Promise<any> {
    return this.request('/shopping-list/clear-purchased', {
      method: 'POST',
    });
  }

  // --- Food Waste APIs ---
  public async getFoodWasteData(): Promise<{ items: PantryItem[]; recipes: ScoredRecipe[] }> {
    return this.request('/food-waste');
  }

  public async addPantryItem(item: {
    ingredient_name: string;
    category?: string;
    days_until_expiry: number;
    quantity?: number;
    unit?: string;
  }): Promise<any> {
    return this.request('/food-waste/add', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  public async deletePantryItem(id: string): Promise<any> {
    return this.request(`/food-waste/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Admin Analytics ---
  public async getAdminAnalytics(): Promise<AdminAnalytics> {
    return this.request('/admin/analytics');
  }
}

export const api = new ApiService();
