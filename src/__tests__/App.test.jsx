import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

describe('sereNEETy - App Routing & Login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login page by default when not authenticated', () => {
    render(<App />);
    expect(screen.getByText(/Start Your Academic Journey/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your email/i)).toBeInTheDocument();
  });

  it('allows user to login and redirects to dashboard', () => {
    render(<App />);
    
    // Fill in the login form
    const nameInput = screen.getByLabelText(/Enter your name/i);
    const emailInput = screen.getByLabelText(/Enter your email/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Student' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Sign in to your empathetic, always-available digital companion/i });
    fireEvent.click(submitButton);
    
    // Should now be on the dashboard
    expect(screen.getByText(/Hi, Test Student/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main navigation/i)).toBeInTheDocument();
  });
});
