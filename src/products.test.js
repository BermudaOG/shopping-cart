import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Products from './Products';

const mock = new MockAdapter(axios);

describe('Products Component', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should fetch and display data from the mock API', async () => {
    const mockData = [
      { name: 'TestProduct', country: 'TestCountry', cost: 5, instock: 10 },
    ];
    mock.onGet('http://localhost:1337/api/products').reply(200, mockData);

    const { getByText, getByTestId } = render(<Products />);

    await waitFor(() => {
      expect(getByText('TestProduct:5')).toBeInTheDocument();
    });
  });
});
