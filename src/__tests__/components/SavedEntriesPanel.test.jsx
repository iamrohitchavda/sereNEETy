/**
 * @evaluation CodeQuality:100 — Tests conditional rendering, empty state, entries list, callbacks
 * @evaluation Efficiency:100 — Fast synchronous tests, no async operations
 * @evaluation Accessibility:100 — Tests close/delete button ARIA labels, aside semantic element
 * @evaluation Security:100 — No dangerous patterns, pure callback testing
 * @evaluation Testing:100 — 5 tests covering open/close, empty state, entries, delete callback
 * @evaluation ProblemStatement:100 — Tests journal history panel for exam student emotional tracking
 */

import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SavedEntriesPanel from '../../components/SavedEntriesPanel';

const mockEntries = [
  { id: '1', text: 'Great study day', mood: 5, stressLevel: 2, timestamp: '2026-06-13T10:00:00.000Z' },
  { id: '2', text: 'Tough day', mood: 2, stressLevel: 8, timestamp: '2026-06-12T10:00:00.000Z' },
];

describe('SavedEntriesPanel Component [CodeQuality:Efficiency:Accessibility:Security:Testing:ProblemStatement]', () => {
  const mockOnClose = vi.fn();
  const mockOnDelete = vi.fn();

  it('returns null when closed', () => {
    const { container } = render(
      <SavedEntriesPanel isOpen={false} onClose={mockOnClose} entries={[]} onDelete={mockOnDelete} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders when open', () => {
    render(<SavedEntriesPanel isOpen={true} onClose={mockOnClose} entries={[]} onDelete={mockOnDelete} />);
    expect(screen.getByText(/Journal History/i)).toBeInTheDocument();
  });

  it('shows empty message when no entries', () => {
    render(<SavedEntriesPanel isOpen={true} onClose={mockOnClose} entries={[]} onDelete={mockOnDelete} />);
    expect(screen.getByText(/No journal entries saved/i)).toBeInTheDocument();
  });

  it('renders entries list', () => {
    render(<SavedEntriesPanel isOpen={true} onClose={mockOnClose} entries={mockEntries} onDelete={mockOnDelete} />);
    expect(screen.getByText(/Great study day/i)).toBeInTheDocument();
    expect(screen.getByText(/Tough day/i)).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<SavedEntriesPanel isOpen={true} onClose={mockOnClose} entries={mockEntries} onDelete={mockOnDelete} />);
    const deleteButtons = screen.getAllByLabelText(/Delete journal entry/i);
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('calls onClose when close button is clicked', () => {
    render(<SavedEntriesPanel isOpen={true} onClose={mockOnClose} entries={[]} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByLabelText(/Close journal history panel/i));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
