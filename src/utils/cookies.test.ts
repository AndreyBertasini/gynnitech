import { afterEach, describe, expect, test, vi } from 'vitest';
import { setPartitionedCookie } from './cookies.js';

describe('setPartitionedCookie', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockCookieDocument = () => {
    let cookieStore = '';

    return {
      document: {
        get cookie() {
          return cookieStore;
        },
        set cookie(value: string) {
          cookieStore = value;
        },
      },
      getCookieStore: () => cookieStore,
    };
  };

  test('sets a partitioned cookie correctly when document is defined', () => {
    const { document, getCookieStore } = mockCookieDocument();

    vi.stubGlobal('document', document);

    setPartitionedCookie('testName', 'testValue');

    expect(getCookieStore()).toBe('testName=testValue; Path=/; Secure; SameSite=None; Partitioned');
  });

  test('encodes cookie name and value', () => {
    const { document, getCookieStore } = mockCookieDocument();

    vi.stubGlobal('document', document);

    setPartitionedCookie('foo bar', 'baz=qux');

    expect(getCookieStore()).toBe('foo%20bar=baz%3Dqux; Path=/; Secure; SameSite=None; Partitioned');
  });

  test('does not throw when document is undefined', () => {
    vi.stubGlobal('document', undefined);

    expect(() => {
      setPartitionedCookie('any', 'value');
    }).not.toThrow();
  });
});
