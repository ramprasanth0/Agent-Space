import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConversationToggle from '../../src/components/ConversationToggle';

describe('ConversationToggle component', () => {
  test('renders both one-liner and conversation icons with correct classes', () => {
    const mockSetMode = jest.fn();
    const { container } = render(<ConversationToggle mode="one-liner" setMode={mockSetMode} />);

    // Check images by alt text
    const oneLinerImg = screen.getByAltText(/one-liner mode/i);
    const conversationImg = screen.getByAltText(/conversation mode/i);

    expect(oneLinerImg).toBeInTheDocument();
    expect(conversationImg).toBeInTheDocument();

    // Check DaisyUI swap classes present
    expect(oneLinerImg).toHaveClass('swap-off');
    expect(conversationImg).toHaveClass('swap-on');

    // Checkbox presence
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  test('checkbox checked state matches mode prop', () => {
    const mockSetMode = jest.fn();

    const { rerender } = render(<ConversationToggle mode="one-liner" setMode={mockSetMode} />);
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox.checked).toBe(false);

    rerender(<ConversationToggle mode="conversation" setMode={mockSetMode} />);
    checkbox = screen.getByRole('checkbox');
    expect(checkbox.checked).toBe(true);
  });

  test('calls setMode with correct value when toggled', () => {
    const mockSetMode = jest.fn();

    // Initially mode is 'one-liner'
    const { rerender } = render(<ConversationToggle mode="one-liner" setMode={mockSetMode} />);
    const checkbox = screen.getByRole('checkbox');

    // Simulate checking the checkbox: mode changes to "conversation"
    fireEvent.click(checkbox);
    expect(mockSetMode).toHaveBeenCalledWith('conversation');

    // Simulate prop update: Reflect mode change in the component
    rerender(<ConversationToggle mode="conversation" setMode={mockSetMode} />);
    
    mockSetMode.mockClear(); // Reset mock calls before next click

    // Simulate unchecking the checkbox: mode changes back to "one-liner"
    fireEvent.click(checkbox);
    expect(mockSetMode).toHaveBeenCalledWith('one-liner');
  });

  test('label has tooltip attribute and class', () => {
    const mockSetMode = jest.fn();
    render(<ConversationToggle mode="one-liner" setMode={mockSetMode} />);

    const label = screen.getByRole('checkbox').parentElement;
    expect(label).toHaveClass('tooltip');
    expect(label).toHaveAttribute('data-tip', 'Switch mode');
  });
});
