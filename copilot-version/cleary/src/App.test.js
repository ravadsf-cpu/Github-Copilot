import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-router-dom to avoid ESM/Jest interop issues in CRA tests
jest.mock('react-router-dom', () => {
  return {
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: () => null,
    Navigate: () => null,
    Link: ({ children }) => <a>{children}</a>,
  };
}, { virtual: true });

test('app renders without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});
