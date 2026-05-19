import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined' && window.navigator) {
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText: () => {}, readText: () => {} },
    writable: true,
    configurable: true,
  });
}

if (typeof window !== 'undefined' && !window.alert) {
  window.alert = () => {};
}
