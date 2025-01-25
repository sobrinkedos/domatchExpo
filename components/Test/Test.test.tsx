import React from 'react';
import { render } from '@testing-library/react-native';
import { Test } from './Test';

describe('Test', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<Test />);
    // Add your test cases here
  });
});
