/* eslint-disable no-console */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

vi.mock('./utils/api.js');

const originalError = console.error.bind(console.error);

console.error = (msg, ...optionalParams) => {
  const msgStr = msg.toString();

  return (
    !msgStr.includes('Could not parse CSS stylesheet') &&
    originalError(msg, ...optionalParams)
  );
};

import.meta.env.REACT_APP_GIT_VERSION = '123';
import.meta.env.REACT_APP_FEEDBACK_URL = 'https://hel.fi';
import.meta.env.REACT_APP_API_URL = 'https://api.test.com';
import.meta.env.REACT_APP_API_VERSION = 'v1';
