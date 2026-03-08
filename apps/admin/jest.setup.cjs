require('@testing-library/jest-dom');

// react-i18next: global mock is applied via jest.config.cjs moduleNameMapper
// (see src/mocks/react-i18next.ts) to avoid "missing i18n instance" warning.
// https://react.i18next.com/misc/testing

// TanStack Router (and dependencies) may require TextEncoder/TextDecoder in jsdom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

