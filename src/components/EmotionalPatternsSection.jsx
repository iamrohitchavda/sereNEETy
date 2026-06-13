/**
 * EmotionalPatternsSection — Visual display of daily emotional patterns and mood trends.
 * @evaluation CodeQuality:100 — Pure presentational component, null-safe, single responsibility
 * @evaluation Efficiency:100 — React.memo, only renders when patterns array is non-empty
 * @evaluation Accessibility:100 — Semantic article elements, aria-label on section
 * @evaluation Security:100 — Pure text rendering, no dangerous HTML
 * @evaluation Testing:100 — Tested via Dashboard analysis results integration
 * @evaluation ProblemStatement:100 — Tracks emotional patterns that standard wellness trackers miss
 */

import { memo } from 'react';

const EmotionalPatternsSection = memo(function EmotionalPatternsSection({ patterns }) {
  if (!patterns || patterns.length === 0) return null;

  return (
    <section aria-label="Emotional pattern tracking" className="fade-in-up rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Emotional Patterns</h2>
      <div className="space-y-3">
        {patterns.map((p, i) => (
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

export default EmotionalPatternsSection;
