import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  List,
  Star,
  Timer as TimerIcon,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe } from '../types';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface CookingModeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onFinishedCooking?: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose,
  onFinishedCooking,
}) => {
  const { showToast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Completion states
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = recipe.instructions || [];
  const currentStep = steps[currentStepIndex];

  // Auto-set timer if step contains timerMinutes
  useEffect(() => {
    if (currentStep?.timerMinutes) {
      setTimerSeconds(currentStep.timerMinutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }

    // Stop speaking when step changes
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentStepIndex, currentStep]);

  // Timer tick effect
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            playBeepSound();
            showToast(`Timer finished for Step ${currentStepIndex + 1}!`, 'info');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerSeconds, currentStepIndex]);

  // Audio beep using Web Audio API
  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('AudioContext not available');
    }
  };

  // Text to speech voice synthesis
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported on this browser', 'info');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Step ${currentStep.step}. ${currentStep.instruction}`
      );
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleFinish = () => {
    setIsCompleted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleSaveCookLog = async () => {
    setIsSubmitting(true);
    try {
      await api.logCooked(recipe.id, rating, notes);
      showToast('Cooking completed! Logged to your recipe history.', 'success');
      if (onFinishedCooking) onFinishedCooking();
      onClose();
    } catch (err: any) {
      // If not logged in, gracefully close
      showToast('Recipe completed! Sign in to permanently save your history.', 'info');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-950 text-cream-100 flex flex-col justify-between overflow-y-auto">
      {/* Top Bar */}
      <div className="border-b border-stone-800 bg-charcoal-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-800/80 flex items-center justify-center text-forest-300 font-bold">
            🍳
          </div>
          <div>
            <h2 className="text-base font-bold text-white line-clamp-1">{recipe.name}</h2>
            <p className="text-xs text-stone-400">Cooking Mode • Distraction-free</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showIngredients
                ? 'bg-forest-700 text-white border-forest-600'
                : 'border-stone-700 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Ingredients</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-800 h-1.5">
        <div
          className="bg-forest-500 h-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col justify-center items-center text-center">
        {!isCompleted ? (
          <div className="w-full">
            {/* Step Counter Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800/90 border border-stone-700 text-forest-400 text-sm font-bold mb-4">
              <span>Step {currentStep?.step} of {steps.length}</span>
            </div>

            {/* Step Title if available */}
            {currentStep?.title && (
              <h2 className="text-forest-400 text-lg sm:text-xl font-bold uppercase tracking-wider mb-3">
                {currentStep.title}
              </h2>
            )}

            {/* Step Instruction Text (Large & readable from counter) */}
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-cream-50 leading-tight sm:leading-snug max-w-3xl mx-auto">
              {currentStep?.instruction}
            </h1>

            {/* Pro Chef Tip Callout */}
            {currentStep?.tip && (
              <div className="mt-5 max-w-xl mx-auto px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm font-medium">
                💡 Pro Tip: {currentStep.tip}
              </div>
            )}

            {/* Voice Readout Button */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={toggleSpeech}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-forest-600 text-white border-forest-500 animate-pulse'
                    : 'border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Stop Voice' : 'Read Instruction Aloud'}</span>
              </button>
            </div>

            {/* Step Timer Section */}
            {timerSeconds > 0 || currentStep?.timerMinutes ? (
              <div className="mt-8 p-6 rounded-3xl bg-stone-900 border border-stone-800 max-w-md mx-auto shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-semibold mb-2">
                  <TimerIcon className="w-4 h-4 text-amberFood-500" />
                  <span>Step Kitchen Timer</span>
                </div>

                <div className="font-display font-mono text-5xl font-bold tracking-wider text-forest-400 my-2">
                  {formatTimer(timerSeconds)}
                </div>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest-600 hover:bg-forest-500 text-white font-bold text-sm shadow-md transition-all"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds((currentStep?.timerMinutes || 0) * 60);
                    }}
                    className="p-2.5 rounded-2xl border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* Finished State */
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-forest-900/60 border border-forest-600 flex items-center justify-center mx-auto text-forest-400 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Bon Appétit!</h2>
            <p className="text-stone-400 text-sm mt-1">
              You just cooked <span className="text-forest-400 font-semibold">{recipe.name}</span> with NALA AI.
            </p>

            {/* Rating Stars */}
            <div className="mt-6">
              <label className="text-xs font-semibold text-stone-300 block mb-2">How did it turn out?</label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amberFood-500 fill-amberFood-500'
                          : 'text-stone-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="mt-4 text-left">
              <input
                type="text"
                placeholder="Any personal tweaks or notes? (e.g., added extra garlic)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-forest-500"
              />
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleSaveCookLog}
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-forest-600 hover:bg-forest-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save to Cooking History</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-stone-400 hover:text-white text-xs font-semibold transition-colors"
              >
                Close without saving
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Ingredients Drawer */}
      {showIngredients && (
        <div className="fixed bottom-24 right-6 w-80 bg-stone-900 border border-stone-700 rounded-3xl p-5 shadow-2xl z-50 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h4 className="text-sm font-bold text-white">Recipe Ingredients</h4>
            <button
              onClick={() => setShowIngredients(false)}
              className="text-stone-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <div className="mt-3 max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
            {recipe.instructions ? (
              // If recipe has ingredients mapped
              <div className="text-stone-300">
                <p className="font-semibold text-forest-400 mb-1">Items needed:</p>
                <ul className="space-y-1 list-disc list-inside text-stone-300">
                  <li>Check your prepped ingredients before heating</li>
                  <li>Follow the step sequence for optimal flavor extraction</li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Bottom Step Controls */}
      {!isCompleted && (
        <div className="border-t border-stone-800 bg-charcoal-900/90 backdrop-blur-md px-6 py-5 flex items-center justify-between max-w-4xl w-full mx-auto">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border transition-all ${
              currentStepIndex === 0
                ? 'border-stone-800 text-stone-600 cursor-not-allowed'
                : 'border-stone-700 text-stone-200 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStepIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest-600 hover:bg-forest-500 text-white text-sm font-bold shadow-lg transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 text-sm font-black shadow-lg transition-all transform hover:scale-105"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Finish Cooking</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
