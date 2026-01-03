import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the image imports
jest.mock('./assets/house.jpeg', () => 'mocked-header-image');

describe('Property Hub Application Tests', () => {

  // TEST 1: Check if the app renders without crashing
  test('1. App renders successfully with main heading', () => {
    render(<App />);
    
    // Check if the navbar logo is present (there are two instances)
    const logos = screen.getAllByText('PROPERTY HUB');
    expect(logos.length).toBeGreaterThan(0);
    
    // Check if the main section heading is present
    const heading = screen.getByText(/Available Properties/i);
    expect(heading).toBeInTheDocument();
  });

  // TEST 2: Check if properties are displayed on initial load
  test('2. Properties are displayed on initial render', () => {
    render(<App />);
    
    // Should display property cards with "Bedrooms" text
    const bedroomTexts = screen.getAllByText(/Bedrooms/i);
    expect(bedroomTexts.length).toBeGreaterThan(0);
    
    // Should show favourites section
    const favouritesHeading = screen.getByText(/My Favourites/i);
    expect(favouritesHeading).toBeInTheDocument();
  });

  // TEST 3: Filter properties by type using placeholder
  test('3. Filter properties by type (House)', () => {
    render(<App />);
    
    // Get all select elements and find the one for property type
    const selects = screen.getAllByRole('combobox');
    const typeSelect = selects[0]; // First select is Property Type
    
    // Get initial count
    const initialCards = screen.getAllByText(/Bedrooms/i);
    const initialCount = initialCards.length;
    
    // Change to "House"
    fireEvent.change(typeSelect, { target: { value: 'House' } });
    
    // After filtering, should show fewer or equal properties
    const filteredCards = screen.getAllByText(/Bedrooms/i);
    expect(filteredCards.length).toBeLessThanOrEqual(initialCount);
    expect(filteredCards.length).toBeGreaterThan(0);
  });

  // TEST 4: Filter by minimum price
  test('4. Filter properties by minimum price', () => {
    render(<App />);
    
    // Get all number inputs
    const numberInputs = screen.getAllByPlaceholderText(/100,000|500,000|1|5/);
    const minPriceInput = screen.getByPlaceholderText('100,000');
    
    // Set minimum price
    fireEvent.change(minPriceInput, { target: { value: '600000' } });
    
    // Get filtered results
    const filteredCards = screen.getAllByText(/Bedrooms/i);
    
    // Should show fewer properties (some are filtered out)
    expect(filteredCards.length).toBeGreaterThan(0);
  });

  // TEST 5: Add property to favourites
  test('5. Add property to favourites', () => {
    render(<App />);
    
    // Initially, favourites count should be 0
    expect(screen.getByText(/My Favourites \(0\)/i)).toBeInTheDocument();
    
    // Find all favourite buttons
    const favouriteButtons = screen.getAllByRole('button');
    const favButton = favouriteButtons.find(btn => 
      btn.textContent.includes('♡ Favourite')
    );
    
    // Click to add to favourites
    fireEvent.click(favButton);
    
    // Now favourites count should be 1
    expect(screen.getByText(/My Favourites \(1\)/i)).toBeInTheDocument();
  });

  // TEST 6: Clear all filters button works
  test('6. Clear all filters resets the form', () => {
    render(<App />);
    
    // Get the select and input
    const typeSelect = screen.getAllByRole('combobox')[0];
    const minPriceInput = screen.getByPlaceholderText('100,000');
    
    // Set some filters
    fireEvent.change(typeSelect, { target: { value: 'House' } });
    fireEvent.change(minPriceInput, { target: { value: '500000' } });
    
    // Verify filters are set
    expect(typeSelect.value).toBe('House');
    expect(minPriceInput.value).toBe('500000');
    
    // Click "Clear All Filters" button
    const clearButton = screen.getByText(/Clear All Filters/i);
    fireEvent.click(clearButton);
    
    // Verify filters are reset
    expect(typeSelect.value).toBe('any');
    expect(minPriceInput.value).toBe('');
  });

});