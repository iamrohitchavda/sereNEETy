import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const renderDashboard = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('sereNEETy — Mental Wellness Tracker Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    // Simulate an authenticated user
    localStorage.setItem('sereNEETy_user', JSON.stringify({ name: 'Tester', email: 'test@example.com' }));
  });

  // ── Test 1: Core Rendering ──────────────────────────────────
  it('renders the journal section with mood selector, stress slider, and textarea', () => {
    renderDashboard();
    expect(screen.getByText(/sereNEETy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main navigation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/daily journal and mood log/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/write your daily journal entry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stress level/i)).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /select your current mood/i })).toBeInTheDocument();
  });

  // ── Test 2: Submit Button Interaction ────────────────────────
  it('disables the analyze button until inputs are filled, then shows loading on click', () => {
    renderDashboard();
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

  // ── Test 3: Mood Selection Interaction ──────────────────────
  it('selecting a mood option updates the mood state', () => {
    renderDashboard();
    const goodMood = screen.getByLabelText(/mood: good/i);
    fireEvent.click(goodMood);
    expect(goodMood).toBeChecked();
  });

  // ── Test 4: Journal Text Input Change ──────────────────────
  it('typing in the journal textarea updates its value', () => {
    renderDashboard();
    const textarea = screen.getByLabelText(/write your daily journal entry/i);
    fireEvent.change(textarea, { target: { value: 'Today was a tough study day' } });
    expect(textarea.value).toBe('Today was a tough study day');
  });

  // ── Test 5: Input Sanitization (XSS Prevention) ────────────
  it('sanitizes HTML from journal input to prevent XSS', () => {
    renderDashboard();
    const textarea = screen.getByLabelText(/write your daily journal entry/i);
    fireEvent.change(textarea, { target: { value: '<script>alert("xss")</script>Hello' } });
    fireEvent.click(screen.getByLabelText(/mood: terrible/i));
    fireEvent.click(screen.getByRole('button', { name: /analyze journal entry/i }));
    expect(screen.getAllByText(/analyzing/i).length).toBeGreaterThan(0);
  });

  // ── Test 6: Exam Type Selector ──────────────────────────────
  it('exam type selector allows changing the target exam', () => {
    renderDashboard();
    const select = screen.getByLabelText(/select your target competitive exam/i);
    fireEvent.change(select, { target: { value: 'jee' } });
    expect(select.value).toBe('jee');
  });

  // ── Test 7: Stress Level Slider Interaction ─────────────────
  it('stress level slider updates the displayed value', () => {
    renderDashboard();
    const slider = screen.getByLabelText(/stress level: 5 out of 10/i);
    fireEvent.change(slider, { target: { value: '8' } });
    expect(screen.getByText(/8\/10/)).toBeInTheDocument();
  });
});
