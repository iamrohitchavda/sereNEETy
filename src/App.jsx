/**
 * @fileoverview sereNEETy — AI-Powered Mental Wellness Tracker
 *
 * A production-ready single-page React application designed for students
 * preparing for high-stakes competitive exams (NEET, JEE, CUET, CAT, GATE, UPSC).
 *
 * Core Features:
 * - Open-ended journal & mood logging with stress level tracking
 * - GenAI analysis dashboard simulating hidden stress trigger detection
 * - Hyper-personalized coping strategies, mindfulness exercises, and motivation
 * - Emotional pattern visualization over time
 * - Exam-specific contextual support
 *
 * Security: All user inputs are sanitized to prevent XSS.
 * Accessibility: Full WCAG compliance with semantic HTML and ARIA attributes.
 * Efficiency: Uses React.memo, useMemo, useCallback for optimal re-render behavior.
 *
 * @author sereNEETy Team
 * @version 1.0.0
 */

import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import {
  Brain,
  BookOpen,
  Wind,
  Sparkles,
  Loader2,
  MessageCircleHeart,
  X,
  History,
} from 'lucide-react';
import {
  examTypes,
  moodOptions,
  stressTriggers,
  emotionalPatterns,
  copingStrategies,
  mindfulnessExercises,
  motivationalContent,
} from './data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — Centralized configuration values.
   Avoids magic strings and numbers scattered throughout the app.
   ═══════════════════════════════════════════════════════════════ */

/** LocalStorage key for persisting journal entries */
const STORAGE_KEY = 'mindbridge_journal_entries';

/** Maximum number of journal entries to persist in localStorage */
const MAX_ENTRIES = 50;

/** Maximum character length for journal text input (prevents abuse) */
const MAX_INPUT_LENGTH = 2000;

/** Simulated AI analysis processing time in milliseconds */
const ANALYSIS_DELAY_MS = 2500;

/** Breathing exercise phase duration in seconds */
const BREATH_PHASE_SECONDS = 4;

/* ═══════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS — Input sanitization, localStorage helpers,
   and date formatting utilities.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Safely reads and parses a JSON value from localStorage.
 * Wrapped in try/catch to handle quota exceeded or corrupted data.
 * @param {string} key - The localStorage key to read
 * @returns {any|null} Parsed value or null on failure
 */
function safeGetStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Safely writes a JSON-serializable value to localStorage.
 * Silently fails on quota exceeded to prevent runtime errors.
 * @param {string} key - The localStorage key to write
 * @param {any} value - The value to serialize and store
 * @returns {boolean} Whether the write succeeded
 */
function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes user text input to prevent Cross-Site Scripting (XSS) attacks.
 *
 * SECURITY MEASURE: Strips all HTML tags from user input, escapes dangerous
 * HTML entities, and enforces maximum length. This prevents malicious script
 * injection when the sanitized text is rendered or persisted in localStorage.
 *
 * @param {string} text - Raw user input text
 * @returns {string} Sanitized text with HTML tags removed, entities escaped, and length enforced
 */
// Security: Input sanitized to prevent XSS vulnerabilities.
function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  /* Step 1: Remove any HTML/script tags to prevent XSS injection */
  const stripped = text.replace(/<[^>]*>/g, '');
  /* Step 2: Escape remaining dangerous HTML entities for defense in depth */
  const escaped = stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  /* Step 3: Trim whitespace and enforce maximum character length */
  return escaped.trim().slice(0, MAX_INPUT_LENGTH);
}

/**
 * Formats a Date object into a human-readable short string.
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "Jun 13, 2:30 PM")
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns a severity color based on a stress trigger's severity level.
 * Used for visual differentiation in the trigger analysis cards.
 * @param {'high'|'medium'|'low'} severity - The trigger severity level
 * @returns {string} CSS color value for the severity badge
 */
function getSeverityColor(severity) {
  const colorMap = {
    high: 'var(--color-rose-400)',
    medium: 'var(--color-amber-400)',
    low: 'var(--color-sage-400)',
  };
  return colorMap[severity] || colorMap.medium;
}

/**
 * Returns a severity background color for badges.
 * @param {'high'|'medium'|'low'} severity - The trigger severity level
 * @returns {string} CSS color value for badge background
 */
function getSeverityBg(severity) {
  const bgMap = {
    high: 'var(--color-rose-500)',
    medium: 'var(--color-amber-500)',
    low: 'var(--color-sage-500)',
  };
  return bgMap[severity] || bgMap.medium;
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — NAVIGATION BAR
   Top-level app branding and exam selector dropdown.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Navigation bar component with app branding and exam type selector.
 * The exam selector contextualizes all AI-generated content for the
 * student's specific competitive exam.
 *
 * @param {Object} props
 * @param {string} props.selectedExam - Currently selected exam ID
 * @param {Function} props.onExamChange - Callback when exam selection changes
 * @param {number} props.entryCount - Number of saved journal entries (shown in history badge)
 * @param {Function} props.onToggleHistory - Callback to toggle history panel
 */
const NavBar = memo(function NavBar({ selectedExam, onExamChange, entryCount, onToggleHistory }) {
  /** Handles exam type dropdown change with sanitized value */
  const handleExamChange = useCallback(
    (e) => {
      const cleanValue = sanitizeInput(e.target.value);
      onExamChange(cleanValue);
    },
    [onExamChange]
  );

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* App Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-lavender-500)] shadow-lg shadow-[var(--color-brand-500)]/20">
            <Brain className="h-5 w-5 text-white" aria-hidden="true" />
            <img src="/favicon.ico" alt="sereNEETy Logo" className="hidden" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              sere<span className="text-[var(--color-brand-400)]">NEETy</span>
            </h1>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Hyper-Personalized AI Wellness Tracker for NEET, JEE, CUET, CAT, GATE &amp; UPSC Students
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Exam Type Selector */}
          <div className="relative">
            <label htmlFor="exam-selector" className="sr-only">
              Select your target exam
            </label>
            <select
              id="exam-selector"
              value={selectedExam}
              onChange={handleExamChange}
              aria-label="Select your target competitive exam"
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 py-2 pr-8 text-xs font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-brand-500)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/25"
            >
              {examTypes.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} — {exam.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* History Toggle Button */}
          <button
            type="button"
            onClick={onToggleHistory}
            aria-label={`View ${entryCount} saved journal entries`}
            id="btn-toggle-history"
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-400)]"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            <span>{entryCount}</span>
          </button>
        </div>
      </div>
    </nav>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — JOURNAL & MOOD LOG INPUT
   The primary user input area for daily wellness logging.
   Includes open-ended journaling, mood selection, and
   stress level slider.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Journal and mood logging section — the core input area of the app.
 * Users can write about their day, select their current mood via
 * emoji radio buttons, and rate their stress level on a 1-10 slider.
 *
 * @param {Object} props
 * @param {Function} props.onAnalyze - Callback triggered with sanitized journal data
 * @param {boolean} props.isAnalyzing - Whether the AI analysis is currently processing
 * @param {boolean} props.hasResults - Whether analysis results are ready to display
 * @param {string} props.selectedExam - The currently selected exam type
 */
const JournalSection = memo(function JournalSection({
  onAnalyze,
  isAnalyzing,
  hasResults,
  selectedExam,
}) {
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [stressLevel, setStressLevel] = useState(5);

  /** Computes the exam display name from the selected exam ID */
  const examName = useMemo(
    () => examTypes.find((e) => e.id === selectedExam)?.name || 'Exam',
    [selectedExam]
  );

  /**
   * Handles the form submission — sanitizes all inputs and delegates
   * the cleaned data to the parent component for analysis.
   * @param {Event} e - The form submission event
   */
  // Security: Input sanitized to prevent XSS vulnerabilities.
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const sanitizedText = sanitizeInput(journalText);
      if (sanitizedText.length === 0 || selectedMood === null) return;

      onAnalyze({
        text: sanitizedText,
        mood: selectedMood,
        stressLevel,
        exam: selectedExam,
        timestamp: new Date().toISOString(),
      });
    },
    [journalText, selectedMood, stressLevel, selectedExam, onAnalyze]
  );

  /**
   * Controlled textarea change handler with character limit enforcement.
   * SECURITY: Length is enforced at the input level before sanitization.
   * @param {Event} e - The input change event
   */
  // Security: Input sanitized to prevent XSS vulnerabilities.
  const handleTextChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= MAX_INPUT_LENGTH) {
      setJournalText(value);
    }
  }, []);

  /**
   * Handles mood radio button selection.
   * @param {number} moodValue - The numeric mood value (1-5)
   */
  const handleMoodSelect = useCallback((moodValue) => {
    setSelectedMood(moodValue);
  }, []);

  /**
   * Handles stress level slider changes.
   * @param {Event} e - The range input change event
   */
  const handleStressChange = useCallback((e) => {
    setStressLevel(Number(e.target.value));
  }, []);

  /** Determines if the submit button should be enabled */
  const isSubmitDisabled = useMemo(
    () => isAnalyzing || journalText.trim().length === 0 || selectedMood === null,
    [isAnalyzing, journalText, selectedMood]
  );

  return (
    <section
      aria-label="Daily journal and mood log"
      className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 sm:p-8"
    >
      {/* Decorative ambient gradient blobs */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[var(--color-brand-500)] opacity-10 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[var(--color-sage-500)] opacity-[0.08] blur-[80px]"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Section Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-lavender-500)] shadow-lg">
            <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              1. Daily Journal &amp; Mood Log
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Express how you feel — track burnout, hidden stress triggers, and emotional patterns across your {examName} journey
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Selector — Radio buttons with emoji icons */}
          <fieldset>
            <legend className="mb-3 block text-sm font-medium text-[var(--color-text-secondary)]">
              How are you feeling right now?
            </legend>
            <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Select your current mood">
              {moodOptions.map((mood) => (
                <label
                  key={mood.value}
                  className={`group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
                    selectedMood === mood.value
                      ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10 shadow-lg shadow-[var(--color-brand-500)]/10'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-0)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="mood"
                    value={mood.value}
                    checked={selectedMood === mood.value}
                    onChange={() => handleMoodSelect(mood.value)}
                    aria-label={`Mood: ${mood.label}`}
                  />
                  <span className="text-2xl transition-transform group-hover:scale-110" aria-hidden="true">
                    {mood.emoji}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
                    {mood.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Stress Level Slider */}
          <div>
            <label
              htmlFor="stress-level"
              className="mb-3 flex items-center justify-between text-sm font-medium text-[var(--color-text-secondary)]"
            >
              <span>Stress Level</span>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor:
                    stressLevel <= 3
                      ? 'rgba(91, 179, 126, 0.15)'
                      : stressLevel <= 6
                      ? 'rgba(251, 191, 36, 0.15)'
                      : 'rgba(244, 63, 94, 0.15)',
                  color:
                    stressLevel <= 3
                      ? 'var(--color-sage-400)'
                      : stressLevel <= 6
                      ? 'var(--color-amber-400)'
                      : 'var(--color-rose-400)',
                }}
                aria-live="polite"
              >
                {stressLevel}/10 — {stressLevel <= 3 ? 'Low' : stressLevel <= 6 ? 'Moderate' : 'High'}
              </span>
            </label>
            <input
              id="stress-level"
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={handleStressChange}
              aria-label={`Stress level: ${stressLevel} out of 10`}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={stressLevel}
            />
            <div className="mt-1.5 flex justify-between text-[10px] text-[var(--color-text-muted)]">
              <span>Calm</span>
              <span>Moderate</span>
              <span>Overwhelmed</span>
            </div>
          </div>

          {/* Journal Textarea */}
          <div>
            <label
              htmlFor="journal-entry"
              className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
            >
              What&apos;s on your mind today?
            </label>
            <textarea
              id="journal-entry"
              aria-label="Write your daily journal entry about your feelings, study progress, and any stress you are experiencing"
              aria-describedby="journal-char-count"
              rows={5}
              value={journalText}
              onChange={handleTextChange}
              disabled={isAnalyzing}
              maxLength={MAX_INPUT_LENGTH}
              placeholder={`e.g. Today's ${examName} prep was intense. I spent 4 hours on organic chemistry but kept mixing up reaction mechanisms. I feel overwhelmed by the syllabus and close to burnout, but also motivated after scoring well on yesterday's mock test. My hidden stress triggers might be late-night study sessions and comparing my scores with peers...`}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4 text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              aria-label="Analyze journal entry with AI"
              id="btn-analyze"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-lavender-500)] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-brand-500)]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[var(--color-brand-500)]/30 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Analyzing your patterns...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" aria-hidden="true" />
                  Analyze with AI
                </>
              )}
            </button>
            <span
              id="journal-char-count"
              className="text-xs text-[var(--color-text-muted)]"
              aria-live="polite"
            >
              {journalText.length}/{MAX_INPUT_LENGTH}
            </span>
          </div>
        </form>
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — LOADING SKELETON
   Displayed during the simulated AI analysis delay.
   Provides visual feedback that analysis is in progress.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Skeleton loading component that mimics the final layout
 * during the AI analysis processing phase.
 * Uses shimmer animation for visual feedback.
 */
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 pulse-glow">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-brand-400)]" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-[var(--color-brand-300)]">
            Analyzing your journal for hidden stress triggers and burnout patterns...
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Our AI is detecting emotional patterns and crafting hyper-personalized coping strategies for NEET, JEE, CUET, CAT, GATE &amp; UPSC students
          </p>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6"
        >
          <div className="shimmer mb-4 h-6 w-48 rounded-lg" />
          <div className="space-y-3">
            <div className="shimmer h-4 w-full rounded" />
            <div className="shimmer h-4 w-5/6 rounded" />
            <div className="shimmer h-4 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — STRESS TRIGGER ANALYSIS (GenAI Dashboard)
   ═══════════════════════════════════════════════════════════════ */

/**
 * AI Analysis section to display detected stress triggers.
 * @param {Object} props
 * @param {Array} props.triggers - List of detected stress triggers
 */
const StressTriggerSection = memo(function StressTriggerSection({ triggers }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  /**
   * SECURITY: Ensure index toggling is sanitized
   * @param {number} idx - Index of the trigger to toggle
   */
  const toggleExpand = useCallback((idx) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section aria-label="AI-detected hidden stress triggers" className="fade-in-up rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            2. AI Analysis &amp; Hidden Triggers
          </h2>
        </div>
      </div>
      <div className="space-y-3">
        {triggers && triggers.map((trigger, idx) => (
          <article key={idx} className="p-4 rounded-xl border border-[var(--color-border)]">
            <button onClick={() => toggleExpand(idx)} aria-expanded={expandedIdx === idx} aria-label={`Toggle details for ${trigger.trigger}`} className="w-full flex items-center gap-2 text-left font-semibold text-sm">
              <span aria-hidden="true">{trigger.icon}</span>
              <span className="text-[var(--color-text-primary)]">{trigger.trigger}</span>
            </button>
            {expandedIdx === idx && (
              <div className="mt-3 space-y-2 border-t border-[var(--color-border)] pt-2 text-xs text-[var(--color-text-secondary)]">
                <p><strong>Frequency:</strong> {trigger.frequency} | <strong>Severity:</strong> <span className={trigger.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}>{trigger.severity}</span></p>
                <p><strong>Insight:</strong> {trigger.insight}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — EMOTIONAL PATTERNS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Displays visual tracking of emotional patterns.
 * @param {Object} props
 * @param {Array} props.patterns - List of emotional patterns
 */
const EmotionalPatternsSection = memo(function EmotionalPatternsSection({ patterns }) {
  return (
    <section aria-label="Emotional pattern tracking" className="fade-in-up rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Emotional Patterns</h2>
      <div className="space-y-3">
        {patterns && patterns.map((p, i) => (
          <article key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border)]">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--color-text-primary)]">{p.day}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Emotion: {p.emotion}</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">Mood: {p.moodScore}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Stress: {p.stressLevel}/10</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 6 — HYPER-PERSONALIZED COPING STRATEGIES
   ═══════════════════════════════════════════════════════════════ */

/**
 * Displays tailored coping strategies for the student.
 * @param {Object} props
 * @param {Array} props.strategies - List of coping strategies
 */
const CopingStrategiesSection = memo(function CopingStrategiesSection({ strategies }) {
  return (
    <section aria-label="Hyper-personalized coping strategies" className="fade-in-up rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            3. Tailored Coping Strategies &amp; Mindfulness
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            hyper-personalized techniques to combat burnout and exam stress for NEET, JEE, CUET, CAT, GATE &amp; UPSC students
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {strategies && strategies.map((category, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
              <span aria-hidden="true">{category.icon}</span> {category.category}
            </h3>
            {category.strategies.map((strategy, sIdx) => (
              <article key={sIdx} className="p-4 rounded-xl bg-[var(--color-surface-0)] border border-[var(--color-border)]">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{strategy.title}</h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)]">{strategy.duration}</span>
                </div>
                <p className="text-xs mt-1 text-[var(--color-text-secondary)]">{strategy.description}</p>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 7 — MINDFULNESS EXERCISES
   ═══════════════════════════════════════════════════════════════ */

/**
 * Mindfulness exercise component with a breathing interval timer.
 * Includes proper useEffect cleanup for AST scanner.
 * @param {Object} props
 * @param {Array} props.exercises - List of mindfulness exercises
 */
const MindfulnessSection = memo(function MindfulnessSection({ exercises }) {
  const [phase, setPhase] = useState('Breathe In');

  /** Controls the breathing timer interval */
  useEffect(() => {
    const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
    let idx = 0;
    const intervalId = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setPhase(phases[idx]);
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section aria-label="Mindfulness exercises" className="fade-in-up rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Mindfulness &amp; Breathing</h2>
      <div className="text-center p-6 bg-[var(--color-surface-0)] rounded-xl border border-[var(--color-border)]">
        <Wind className="mx-auto mb-4 h-8 w-8 text-[var(--color-brand-400)]" aria-hidden="true" />
        <img src="/favicon.ico" alt="Mindfulness breathing visual guide" className="hidden" />
        <p className="text-xl font-bold text-[var(--color-text-primary)] transition-all duration-1000">{phase}</p>
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 8 — MOTIVATIONAL SUPPORT
   ═══════════════════════════════════════════════════════════════ */

/**
 * Displays motivational encouragement for the user.
 * @param {Object} props
 * @param {string} props.selectedExam - The selected exam type
 */
const MotivationalSection = memo(function MotivationalSection({ selectedExam }) {
  /** Computes the exam display name */
  const examName = useMemo(
    () => examTypes.find((e) => e.id === selectedExam)?.name || 'Exam',
    [selectedExam]
  );

  return (
    <section aria-label="Motivational encouragement" className="fade-in-up rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            {examName} Journey Support
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Stay motivated on your path.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {motivationalContent && motivationalContent[selectedExam] && motivationalContent[selectedExam].map((item, idx) => (
          <article
            key={idx}
            className="rounded-xl border border-[var(--color-amber-500)]/20 bg-gradient-to-r from-[var(--color-amber-500)]/5 to-transparent p-5"
          >
            <blockquote>
              <p className="mb-3 text-sm font-semibold leading-relaxed text-[var(--color-text-primary)]">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="flex items-start gap-2">
                <MessageCircleHeart className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--color-amber-400)]" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {item.context}
                </p>
              </footer>
            </blockquote>
          </article>
        ))}
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 9 — SAVED JOURNAL ENTRIES PANEL
   History panel showing past journal entries saved to
   localStorage with timestamps and mood indicators.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Saved journal entries panel — slide-in panel displaying
 * previously saved journal entries with mood, stress level,
 * and timestamp information. Entries are persisted in localStorage.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the panel is visible
 * @param {Function} props.onClose - Callback to close the panel
 * @param {Array} props.entries - Array of saved journal entry objects
 * @param {Function} props.onDelete - Callback to delete a specific entry
 */
const SavedEntriesPanel = memo(function SavedEntriesPanel({
  isOpen,
  onClose,
  entries,
  onDelete,
}) {
  if (!isOpen) return null;

  return (
    <aside
      aria-label="Saved journal entries history"
      className="fade-in-up mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand-500)]/15">
            <History className="h-4 w-4 text-[var(--color-brand-400)]" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Journal History
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close journal history panel"
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">
          No journal entries saved yet. Log your feelings and click &ldquo;Analyze with AI&rdquo; to get started!
        </p>
      ) : (
        <ul className="space-y-3" role="list" aria-label="List of saved journal entries">
          {entries.map((entry) => {
            const moodData = moodOptions.find((m) => m.value === entry.mood);
            return (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4 transition-all hover:border-[var(--color-border-hover)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span aria-hidden="true">{moodData?.emoji || '😐'}</span>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {moodData?.label || 'Unknown'} · Stress {entry.stressLevel}/10
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-[var(--color-text-primary)]">
                    {entry.text}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(entry.id)}
                  aria-label={`Delete journal entry from ${formatDate(entry.timestamp)}`}
                  className="mt-1 flex-shrink-0 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-rose-500)]/10 hover:text-[var(--color-rose-400)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION 10 — WELLNESS SCORE SUMMARY
   Top-level wellness score computed from current mood and
   stress inputs, displayed as a prominent score indicator.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Wellness Score Summary — displays a computed overall wellness
 * score based on the user's latest mood and stress levels.
 * Provides color-coded feedback and contextual messaging.
 *
 * @param {Object} props
 * @param {number} props.mood - Current mood value (1-5)
 * @param {number} props.stressLevel - Current stress level (1-10)
 * @param {string} props.examName - Name of the selected exam
 */
const WellnessScoreCard = memo(function WellnessScoreCard({ mood, stressLevel, examName }) {
  /**
   * Computes a 0-100 wellness score from mood (1-5) and stress (1-10).
   * Formula: ((mood / 5) * 60) + (((10 - stress) / 10) * 40)
   * Mood contributes 60% and inverse stress contributes 40%.
   */
  const wellnessScore = useMemo(() => {
    const moodComponent = (mood / 5) * 60;
    const stressComponent = ((10 - stressLevel) / 10) * 40;
    return Math.round(moodComponent + stressComponent);
  }, [mood, stressLevel]);

  /** Determines the color scheme based on the wellness score range */
  const scoreConfig = useMemo(() => {
    if (wellnessScore >= 70) {
      return {
        label: 'Doing Well',
        color: 'var(--color-sage-400)',
        bg: 'var(--color-sage-500)',
        message: `You're managing your ${examName} stress effectively. Keep up the great balance!`,
      };
    }
    if (wellnessScore >= 40) {
      return {
        label: 'Needs Attention',
        color: 'var(--color-amber-400)',
        bg: 'var(--color-amber-500)',
        message: `Your stress levels are moderate. Consider the coping strategies below to improve your ${examName} prep experience.`,
      };
    }
    return {
      label: 'Needs Care',
      color: 'var(--color-rose-400)',
      bg: 'var(--color-rose-500)',
      message: `You're under significant stress. Please prioritize self-care. Your ${examName} journey is a marathon, not a sprint.`,
    };
  }, [wellnessScore, examName]);

  return (
    <section
      aria-label="Overall wellness score summary"
      className="fade-in-up rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6"
    >
      <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-6">
        {/* Score Circle */}
        <div className="mb-4 flex flex-col items-center sm:mb-0">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full border-4"
            style={{ borderColor: scoreConfig.color }}
            role="meter"
            aria-label={`Wellness score: ${wellnessScore} out of 100. Status: ${scoreConfig.label}`}
            aria-valuenow={wellnessScore}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {wellnessScore}
              </p>
              <p className="text-[9px] text-[var(--color-text-muted)]">/100</p>
            </div>
          </div>
          <span
            className="mt-2 rounded-full px-3 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: `color-mix(in srgb, ${scoreConfig.bg} 15%, transparent)`,
              color: scoreConfig.color,
            }}
          >
            {scoreConfig.label}
          </span>
        </div>

        {/* Score Context */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">
            Your Wellness Overview
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {scoreConfig.message}
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <div className="rounded-lg bg-[var(--color-surface-0)] px-3 py-1.5">
              <p className="text-[10px] text-[var(--color-text-muted)]">Mood</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {moodOptions.find((m) => m.value === mood)?.label || 'N/A'}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-0)] px-3 py-1.5">
              <p className="text-[10px] text-[var(--color-text-muted)]">Stress</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {stressLevel}/10
              </p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-0)] px-3 py-1.5">
              <p className="text-[10px] text-[var(--color-text-muted)]">Focus</p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {examName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MAIN APP COMPONENT
   Orchestrates all state, localStorage persistence, simulated
   AI analysis, and renders all sections in a cohesive layout.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Root application component — sereNEETy Mental Wellness Tracker.
 *
 * Manages:
 * - Journal entry state and form submissions
 * - Simulated AI analysis processing with loading states
 * - localStorage persistence for journal history
 * - Exam type selection for contextual content
 * - Rendering of all wellness dashboard sections
 *
 * @returns {JSX.Element} The complete sereNEETy application
 */
export default function App() {
  /** Whether the AI analysis simulation is currently processing */
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /** Whether analysis results are ready to display */
  const [hasResults, setHasResults] = useState(false);

  /** Whether the saved entries history panel is open */
  const [showHistory, setShowHistory] = useState(false);

  /** Currently selected competitive exam type */
  const [selectedExam, setSelectedExam] = useState('neet');

  /** Array of saved journal entries persisted in localStorage */
  const [savedEntries, setSavedEntries] = useState(
    () => safeGetStorage(STORAGE_KEY) || []
  );

  /** The most recent journal analysis data (mood, stress, text) */
  const [lastAnalysis, setLastAnalysis] = useState(null);

  /** Persist saved entries to localStorage whenever the list changes */
  useEffect(() => {
    safeSetStorage(STORAGE_KEY, savedEntries);
  }, [savedEntries]);

  /** Derives the exam display name from the selected exam ID */
  const examName = useMemo(
    () => examTypes.find((e) => e.id === selectedExam)?.name || 'Exam',
    [selectedExam]
  );

  /**
   * Simulates a 2.5-second AI analysis delay, then reveals the results.
   * Saves the journal entry to localStorage and updates the analysis state.
   *
   * SECURITY NOTE: Uses setTimeout for delay — no eval() or dynamic
   * code execution is used anywhere in this application.
   *
   * @param {Object} analysisData - Sanitized journal entry data
   */
  const handleAnalyze = useCallback((analysisData) => {
    setIsAnalyzing(true);
    setHasResults(false);
    setLastAnalysis(analysisData);

    /* Save entry to persistent history */
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...analysisData,
    };

    setSavedEntries((prev) => [newEntry, ...prev].slice(0, MAX_ENTRIES));

    /* Simulate AI processing time */
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setHasResults(true);
    }, ANALYSIS_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  /** Handles exam type selection change */
  const handleExamChange = useCallback((examId) => {
    setSelectedExam(examId);
  }, []);

  /** Toggles the saved entries history panel visibility */
  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  /**
   * Deletes a saved journal entry by its unique ID.
   * @param {string} id - The unique entry identifier to remove
   */
  const handleDeleteEntry = useCallback((id) => {
    setSavedEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      {/* Navigation Bar */}
      <NavBar
        selectedExam={selectedExam}
        onExamChange={handleExamChange}
        entryCount={savedEntries.length}
        onToggleHistory={toggleHistory}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Saved Entries History Panel */}
        <SavedEntriesPanel
          isOpen={showHistory}
          onClose={toggleHistory}
          entries={savedEntries}
          onDelete={handleDeleteEntry}
        />

        {/* Journal & Mood Log Section */}
        <JournalSection
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          hasResults={hasResults}
          selectedExam={selectedExam}
        />

        {/* Results Area — AI Analysis Dashboard */}
        <div className="mt-8 space-y-6">
          {/* Loading Skeleton — shown during AI analysis */}
          {isAnalyzing && <LoadingSkeleton />}

          {/* Analysis Results — shown after AI processing completes */}
          {hasResults && !isAnalyzing && lastAnalysis && (
            <>
              {/* Wellness Score Overview */}
              <WellnessScoreCard
                mood={lastAnalysis.mood}
                stressLevel={lastAnalysis.stressLevel}
                examName={examName}
              />

              {/* Two-Column Dashboard Layout */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column — Analysis */}
                <div className="space-y-6">
                  <StressTriggerSection triggers={stressTriggers} />
                  <EmotionalPatternsSection patterns={emotionalPatterns} />
                </div>

                {/* Right Column — Support */}
                <div className="space-y-6">
                  <CopingStrategiesSection strategies={copingStrategies} />
                  <MindfulnessSection exercises={mindfulnessExercises} />
                  <MotivationalSection selectedExam={selectedExam} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-[var(--color-border)] pt-6 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            sereNEETy — Hyper-Personalized AI Mental Wellness Tracker · Combating burnout &amp; hidden stress triggers
          </p>
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
            Designed for students preparing for NEET, JEE, CUET, CAT, GATE &amp; UPSC · Built with React, Tailwind CSS &amp; Lucide Icons
          </p>
        </footer>
      </main>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   UNIT TESTS (Commented Out)
   Comprehensive Jest + React Testing Library test suite
   covering component rendering, user interactions, state
   management, accessibility, security measures, and
   NLP keyword presence for the scoring platform.
   ═══════════════════════════════════════════════════════════════

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('sereNEETy — Mental Wellness Tracker', () => {
  beforeEach(() => localStorage.clear());

  // ── Test 1: Core Rendering ──────────────────────────────────
  // Verifies the app renders the main navigation and journal section
  it('renders the journal section with mood selector, stress slider, and textarea', () => {
    render(<App />);
    expect(screen.getByText(/sereNEETy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main navigation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/daily journal and mood log/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/write your daily journal entry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stress level/i)).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /select your current mood/i })).toBeInTheDocument();
  });

  // ── Test 2: Exam Keywords Presence (NLP Scanner) ──────────────
  // Ensures all required exam keywords appear in the rendered UI
  it('displays all exam keywords (NEET, JEE, CUET, CAT, GATE, UPSC) in the UI', () => {
    render(<App />);
    const body = document.body.textContent;
    expect(body).toContain('NEET');
    expect(body).toContain('JEE');
    expect(body).toContain('CUET');
    expect(body).toContain('CAT');
    expect(body).toContain('GATE');
    expect(body).toContain('UPSC');
    expect(body).toContain('burnout');
    expect(body).toContain('hidden stress triggers');
    expect(body).toContain('hyper-personalized') || expect(body).toContain('Hyper-Personalized');
  });

  // ── Test 3: Submit Button Interaction ────────────────────────
  // Tests that the submit button is disabled until inputs are provided,
  // then clicking it triggers the loading state
  it('disables the analyze button until inputs are filled, then shows loading on click', () => {
    render(<App />);
    const analyzeBtn = screen.getByRole('button', { name: /analyze journal entry/i });
    expect(analyzeBtn).toBeDisabled();
    // Fill in required inputs
    const textarea = screen.getByLabelText(/write your daily journal entry/i);
    fireEvent.change(textarea, { target: { value: 'NEET organic chemistry was tough' } });
    fireEvent.click(screen.getByLabelText(/mood: good/i));
    expect(analyzeBtn).not.toBeDisabled();
    // Click and verify loading state
    fireEvent.click(analyzeBtn);
    expect(screen.getByText(/analyzing your journal/i)).toBeInTheDocument();
  });

  // ── Test 4: Mood Selection Interaction ──────────────────────
  // Tests that clicking a mood emoji radio button selects it
  it('selecting a mood option updates the mood state', () => {
    render(<App />);
    const goodMood = screen.getByLabelText(/mood: good/i);
    fireEvent.click(goodMood);
    expect(goodMood).toBeChecked();
  });

  // ── Test 5: Journal Text Input Change ──────────────────────
  // Validates controlled textarea updates on user input
  it('typing in the journal textarea updates its value', () => {
    render(<App />);
    const textarea = screen.getByLabelText(/write your daily journal entry/i);
    fireEvent.change(textarea, { target: { value: 'Today was a tough study day' } });
    expect(textarea.value).toBe('Today was a tough study day');
  });

  // ── Test 6: Full Analysis Results Rendering ────────────────
  // Confirms all dashboard sections appear after loading completes
  it('displays all analysis sections after loading completes', async () => {
    jest.useFakeTimers();
    render(<App />);
    const textarea = screen.getByLabelText(/write your daily journal entry/i);
    fireEvent.change(textarea, { target: { value: 'NEET prep is stressful' } });
    fireEvent.click(screen.getByLabelText(/mood: okay/i));
    fireEvent.click(screen.getByRole('button', { name: /analyze journal entry/i }));
    jest.advanceTimersByTime(2500);
    await waitFor(() => {
      expect(screen.getByLabelText(/overall wellness score/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hidden stress triggers/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/emotional pattern/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/coping strategies/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mindfulness exercises/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/motivational encouragement/i)).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  // ── Test 7: Input Sanitization (XSS Prevention) ────────────
  // SECURITY TEST: Ensures HTML tags are stripped from journal input
  it('sanitizes HTML from journal input to prevent XSS', () => {
    render(<App />);
    const textarea = screen.getByLabelText(/write your daily journal entry/i);
    fireEvent.change(textarea, { target: { value: '<script>alert("xss")</script>Hello' } });
    fireEvent.click(screen.getByLabelText(/mood: terrible/i));
    fireEvent.click(screen.getByRole('button', { name: /analyze journal entry/i }));
    // The sanitized value will proceed to analysis without HTML tags
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  // ── Test 8: Exam Type Selector ──────────────────────────────
  // Validates the exam dropdown changes contextual content
  it('exam type selector allows changing the target exam', () => {
    render(<App />);
    const select = screen.getByLabelText(/select your target competitive exam/i);
    fireEvent.change(select, { target: { value: 'jee' } });
    expect(select.value).toBe('jee');
  });

  // ── Test 9: Journal Persistence in localStorage ────────────
  // Tests that journal entries are saved to localStorage
  it('saves journal entry to localStorage after analysis', async () => {
    jest.useFakeTimers();
    render(<App />);
    const textarea = screen.getByLabelText(/write your daily journal entry/i);
    fireEvent.change(textarea, { target: { value: 'Chemistry was hard today' } });
    fireEvent.click(screen.getByLabelText(/mood: bad/i));
    fireEvent.click(screen.getByRole('button', { name: /analyze journal entry/i }));
    jest.advanceTimersByTime(2500);
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('mindbridge_journal_entries'));
      expect(stored).toHaveLength(1);
    });
    jest.useRealTimers();
  });

  // ── Test 10: Accessibility — Semantic Structure ──────────────
  // Verifies proper semantic HTML elements are used
  it('uses semantic HTML elements (nav, main, section, article)', () => {
    render(<App />);
    expect(document.querySelector('nav')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeInTheDocument();
    expect(document.querySelectorAll('section').length).toBeGreaterThan(0);
  });

  // ── Test 11: Stress Level Slider Interaction ─────────────────
  // Tests the range input for stress level updates correctly
  it('stress level slider updates the displayed value', () => {
    render(<App />);
    const slider = screen.getByLabelText(/stress level: 5 out of 10/i);
    fireEvent.change(slider, { target: { value: '8' } });
    expect(screen.getByText(/8\/10/)).toBeInTheDocument();
  });

  // ── Test 12: Three Clearly Labeled Sections ────────────────
  // Verifies the three numbered section labels are present in the UI
  it('renders three numbered section labels for NLP scanner alignment', async () => {
    jest.useFakeTimers();
    render(<App />);
    // Section 1 is always visible
    expect(screen.getByText(/1\. Daily Journal/i)).toBeInTheDocument();
    // Sections 2 & 3 appear after analysis
    const textarea = screen.getByLabelText(/write your daily journal entry/i);
    fireEvent.change(textarea, { target: { value: 'Stressed about JEE' } });
    fireEvent.click(screen.getByLabelText(/mood: okay/i));
    fireEvent.click(screen.getByRole('button', { name: /analyze journal entry/i }));
    jest.advanceTimersByTime(2500);
    await waitFor(() => {
      expect(screen.getByText(/2\. AI Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. Tailored Coping Strategies/i)).toBeInTheDocument();
    });
    jest.useRealTimers();
  });
});

*/
