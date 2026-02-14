import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { setPartitionedCookie } from './cookies.js';

describe('setPartitionedCookie', () => {
  let originalDocument;

  beforeEach(() => {
    // Save the original document global if it exists
    if (typeof global.document !== 'undefined') {
      originalDocument = global.document;
    }
  });

  afterEach(() => {
    // Restore the original document global
    if (originalDocument) {
      global.document = originalDocument;
    } else {
      // @ts-ignore
      delete global.document;
    }
  });

  test('sets a partitioned cookie correctly when document is defined', () => {
    let cookieStore = '';

    // Mock the document object with a cookie setter
    const mockDocument = {
      get cookie() {
        return cookieStore;
      },
      set cookie(value) {
        cookieStore = value;
      }
    };

    // Assign mock to global.document
    // @ts-ignore: simplified mock
    global.document = mockDocument;

    setPartitionedCookie('testName', 'testValue');

    expect(cookieStore).toBe('testName=testValue; Path=/; Secure; SameSite=None; Partitioned');
  });

  test('encodes cookie name and value', () => {
    let cookieStore = '';

    const mockDocument = {
      get cookie() {
        return cookieStore;
      },
      set cookie(value) {
        cookieStore = value;
      }
    };

    // @ts-ignore: simplified mock
    global.document = mockDocument;

    setPartitionedCookie('foo bar', 'baz=qux');

    expect(cookieStore).toBe('foo%20bar=baz%3Dqux; Path=/; Secure; SameSite=None; Partitioned');
  });

  test('does not throw when document is undefined', () => {
    // Ensure document is undefined
    // @ts-ignore
    delete global.document;

    expect(() => {
      setPartitionedCookie('any', 'value');
    }).not.toThrow();
  });
});
