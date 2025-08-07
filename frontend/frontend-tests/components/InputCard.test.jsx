import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputCard from '../../src/components/InputCard';

describe('InputCard', () => {
  it('renders the input and button', () => {
    render(
      <InputCard
        input=""
        loading={false}
        setInput={() => {}}
        handleClick={() => {}}
      />
    );
    // The label and input are present
    expect(screen.getByText(/Your Unhinged Queries/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Is gravity real?")).toBeInTheDocument();
    // Button renders
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls setInput when typing', () => {
    const setInput = jest.fn();
    render(
      <InputCard
        input=""
        loading={false}
        setInput={setInput}
        handleClick={() => {}}
      />
    );
    const input = screen.getByPlaceholderText("Is gravity real?");
    fireEvent.change(input, { target: { value: "Test query" } });
    expect(setInput).toHaveBeenCalledWith("Test query");
  });

  it('disables the button if loading', () => {
    render(
      <InputCard
        input="Some value"
        loading={true}
        setInput={() => {}}
        handleClick={() => {}}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it('disables the button if input is empty or only spaces', () => {
    const { rerender } = render(
      <InputCard
        input=""
        loading={false}
        setInput={() => {}}
        handleClick={() => {}}
      />
    );
    let button = screen.getByRole("button");
    expect(button).toBeDisabled();

    rerender(
      <InputCard
        input="    "
        loading={false}
        setInput={() => {}}
        handleClick={() => {}}
      />
    );
    button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls handleClick when button is pressed', () => {
    const handleClick = jest.fn(e => e && e.preventDefault());
    render(
      <InputCard
        input="abc"
        loading={false}
        setInput={() => {}}
        handleClick={handleClick}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('calls handleClick when pressing Enter in input (if input not empty)', () => {
    const handleClick = jest.fn();
    render(
      <InputCard
        input="the sky"
        loading={false}
        setInput={() => {}}
        handleClick={handleClick}
      />
    );
    const input = screen.getByPlaceholderText("Is gravity real?");
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(handleClick).toHaveBeenCalled();
  });

  it("does NOT call handleClick when pressing Enter if loading", () => {
    const handleClick = jest.fn();
    render(
      <InputCard
        input="the sky"
        loading={true}
        setInput={() => {}}
        handleClick={handleClick}
      />
    );
    const input = screen.getByPlaceholderText("Is gravity real?");
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does NOT call handleClick when pressing Enter if input is empty", () => {
    const handleClick = jest.fn();
    render(
      <InputCard
        input=""
        loading={false}
        setInput={() => {}}
        handleClick={handleClick}
      />
    );
    const input = screen.getByPlaceholderText("Is gravity real?");
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(handleClick).not.toHaveBeenCalled();
  });
});