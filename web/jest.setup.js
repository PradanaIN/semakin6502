/* global global */
import '@testing-library/jest-dom';
import { TextEncoder } from 'util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
