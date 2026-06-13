import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (name && email) {
      login(email, name);
      navigate('/dashboard');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4">
      <section className="w-full max-w-md bg-[var(--color-surface-1)] p-8 rounded-2xl border border-[var(--color-border)] shadow-xl relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[var(--color-brand-500)] opacity-10 blur-[100px]" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[var(--color-sage-500)] opacity-[0.08] blur-[80px]" aria-hidden="true" />

        <div className="relative text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-lavender-500)] shadow-lg mb-4">
            <Brain className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">sere<span className="text-[var(--color-brand-400)]">NEETy</span></h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            A Generative AI-powered solution for students preparing for high-stakes board exams and competitive entrance tests (e.g., NEET, JEE, CUET, CAT, GATE, UPSC).
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Your Name</label>
            <input
              id="name"
              type="text"
              required
              aria-label="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-3 text-[var(--color-text-primary)] focus:border-[var(--color-brand-400)] focus:ring-1 focus:ring-[var(--color-brand-400)] outline-none"
              placeholder="e.g. Student"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              required
              aria-label="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-3 text-[var(--color-text-primary)] focus:border-[var(--color-brand-400)] focus:ring-1 focus:ring-[var(--color-brand-400)] outline-none"
              placeholder="student@example.com"
            />
          </div>
          <button
            type="submit"
            aria-label="Sign in to your empathetic, always-available digital companion"
            className="w-full rounded-xl bg-[var(--color-brand-500)] py-3 px-4 font-bold text-white hover:bg-[var(--color-brand-600)] transition-colors shadow-lg shadow-[var(--color-brand-500)]/25"
          >
            Start Your Academic Journey
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--color-text-muted)] relative space-y-2">
          <p>Combating severe stress, burnout, and self-doubt with conversational AI.</p>
          <p>Our empathetic, always-available digital companion leverages GenAI to analyze open-ended daily journaling and mood logs, uncovering hidden stress triggers and emotional patterns that standard trackers miss.</p>
          <p>Get hyper-personalized, contextual wellness support including real-time tailored coping strategies, adaptive mindfulness exercises, and motivational encouragement.</p>
        </div>
      </section>
    </main>
  );
}
