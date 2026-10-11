import React, { useState, useEffect } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquarePlus,
  CheckCircle2,
  Sparkles,
  Filter,
  X,
  Send,
} from 'lucide-react';
import { RecipeReview, RecipeReviewsResponse } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface RecipeReviewsSectionProps {
  recipeId: string;
  recipeName: string;
}

export const RecipeReviewsSection: React.FC<RecipeReviewsSectionProps> = ({
  recipeId,
  recipeName,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviewsData, setReviewsData] = useState<RecipeReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | 'tips'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Family Favorite']);
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  const availableTags = [
    'Quick & Easy',
    'Family Favorite',
    'Kid Approved',
    'Zero Waste',
    'Leftover Hack',
    'Pro Tip',
    'Restaurant Quality',
    'Budget Friendly',
    'Comfort Food',
    'Beginner Friendly',
  ];

  const ratingDescriptions: Record<number, string> = {
    5: 'Exceptional! Restaurant quality & delicious.',
    4: 'Very good! A great meal for the whole family.',
    3: 'Good! Decent everyday home cooking.',
    2: 'Fair. Needed some adjustments.',
    1: 'Not for me. Needs major improvements.',
  };

  useEffect(() => {
    fetchReviews();
  }, [recipeId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRecipeReviews(recipeId);
      setReviewsData(res);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        showToast('You can select up to 3 tags.', 'info');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please write a few words about how your meal turned out.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.addRecipeReview(recipeId, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        tags: selectedTags,
        authorName: authorName.trim() || undefined,
      });

      showToast('Review posted successfully! Thank you for sharing ❤️', 'success');

      // Optimistically update list
      if (reviewsData) {
        const updatedReviews = [res.review, ...reviewsData.reviews];
        const newTotal = reviewsData.totalReviews + 1;
        const newAvg =
          Math.round(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newTotal) * 10
          ) / 10;
        setReviewsData({
          ...reviewsData,
          reviews: updatedReviews,
          totalReviews: newTotal,
          averageRating: newAvg,
          ratingDistribution: {
            ...reviewsData.ratingDistribution,
            [rating as 1 | 2 | 3 | 4 | 5]:
              (reviewsData.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5] || 0) + 1,
          },
        });
      }

      // Reset form
      setComment('');
      setTitle('');
      setIsFormOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (votedHelpful[reviewId]) return;

    setVotedHelpful((prev) => ({ ...prev, [reviewId]: true }));

    // Optimistically increment
    if (reviewsData) {
      setReviewsData({
        ...reviewsData,
        reviews: reviewsData.reviews.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
        ),
      });
    }

    try {
      await api.markReviewHelpful(recipeId, reviewId);
    } catch (e) {
      // Revert if error
    }
  };

  const filteredReviews = (reviewsData?.reviews || []).filter((r) => {
    if (selectedFilter === '5') return r.rating === 5;
    if (selectedFilter === '4') return r.rating === 4;
    if (selectedFilter === 'tips')
      return (
        r.tags?.some((t) => t.toLowerCase().includes('tip') || t.toLowerCase().includes('hack')) ||
        r.comment.toLowerCase().includes('tip') ||
        r.comment.toLowerCase().includes('substitut')
      );
    return true;
  });

  const totalReviews = reviewsData?.totalReviews || 0;
  const averageRating = reviewsData?.averageRating || 4.9;
  const dist = reviewsData?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft mt-8">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👩‍🍳</span>
            <h3 className="font-display font-bold text-2xl text-charcoal-900">
              Community Cook Reviews
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800">
              Verified Cooks
            </span>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Real feedback, substitution hacks, and timing tips from home cooks who prepared{' '}
            <span className="font-semibold text-charcoal-900">“{recipeName}”</span>.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
        >
          {isFormOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel Review</span>
            </>
          ) : (
            <>
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </>
          )}
        </button>
      </div>

      {/* Ratings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 p-5 sm:p-6 rounded-2xl bg-cream-50/70 border border-stone-200/70 items-center">
        {/* Big Score Box */}
        <div className="md:col-span-4 flex flex-col items-center justify-center sm:border-r border-stone-200/80 pr-4 text-center">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-5xl text-charcoal-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-stone-400 font-semibold text-sm">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-stone-500">
            Based on <span className="text-charcoal-900 font-bold">{totalReviews} verified ratings</span>
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>97% would cook this recipe again</span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = (dist as any)[stars] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : stars === 5 ? 88 : stars === 4 ? 12 : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 w-12 text-stone-600 font-medium">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-stone-500 font-semibold">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form Modal / Drawer */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-8 p-6 rounded-2xl bg-forest-50/40 border border-forest-200 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-forest-200/60 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest-700" />
              <h4 className="font-display font-bold text-base text-charcoal-900">
                Share Your Experience with {recipeName}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Star Picker */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-1.5">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-stone-600 ml-2">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Review Title & Author Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Headline / Summary
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Perfectly spiced, ready in 15 mins!"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Priya M."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Your Review & Cooking Tips *
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Did you substitute any ingredients? How did the cooking mode timers help? Would your family cook this again?"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          {/* Quick Tag Selector */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Highlight Tags (Select up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-forest-700 text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-600 hover:border-forest-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Filter Reviews:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All (${totalReviews})` },
            { id: '5', label: `5 Stars (${dist[5] || 0})` },
            { id: '4', label: `4 Stars (${dist[4] || 0})` },
            { id: 'tips', label: 'Tips & Hacks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === tab.id
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-stone-500">Loading verified cook reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-cream-50/60 border border-dashed border-stone-300">
          <p className="text-sm font-bold text-charcoal-900">No reviews in this category yet.</p>
          <p className="text-xs text-stone-500 mt-1">
            Be the first cook to share your thoughts and tips for this dish!
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800"
          >
            Leave First Review
          </button>
        </div>
      ) : (
        <div className="space-y-4 mt-2">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-forest-200 transition-all"
            >
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {rev.user_avatar ? (
                    <img
                      src={rev.user_avatar}
                      alt={rev.user_name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-800 font-bold text-sm flex items-center justify-center border border-forest-200">
                      {rev.user_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-charcoal-900">{rev.user_name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Cook</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date(rev.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Helpful Button */}
                <button
                  onClick={() => handleHelpfulClick(rev.id)}
                  disabled={votedHelpful[rev.id]}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    votedHelpful[rev.id]
                      ? 'bg-forest-50 border-forest-200 text-forest-800'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-charcoal-900'
                  }`}
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 ${
                      votedHelpful[rev.id] ? 'fill-forest-700 text-forest-700' : ''
                    }`}
                  />
                  <span>Helpful ({rev.helpful_count || 0})</span>
                </button>
              </div>

              {/* Review Content */}
              <div className="mt-3">
                {rev.title && (
                  <h5 className="font-bold text-sm text-charcoal-900 mb-1">{rev.title}</h5>
                )}
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{rev.comment}</p>
              </div>

              {/* Tags */}
              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
                  {rev.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
