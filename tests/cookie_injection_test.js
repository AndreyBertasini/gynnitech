import { setPartitionedCookie } from '../src/utils/cookies.js';

// Mock document.cookie
global.document = {
  _cookie: '',
  get cookie() {
    return this._cookie;
  },
  set cookie(val) {
    this._cookie = val;
  }
};

function testCookieInjection() {
  console.log('Testing Cookie Injection...');

  // Scenario 1: Injecting an additional cookie
  const name1 = 'user';
  const value1 = 'alice; other_cookie=evil';
  setPartitionedCookie(name1, value1);
  console.log(`Result 1: ${global.document.cookie}`);
  if (global.document.cookie.includes('other_cookie=evil')) {
    console.error('❌ VULNERABLE: Additional cookie injected via value!');
  } else {
    console.log('✅ PASS: Additional cookie NOT injected via value.');
  }

  // Scenario 2: Injecting an additional attribute
  const name2 = 'session';
  const value2 = '123; SameSite=Lax';
  setPartitionedCookie(name2, value2);
  console.log(`Result 2: ${global.document.cookie}`);
  // In a real browser, the last SameSite might be ignored or overwrite the previous one.
  // Here we just check if the injected string is present as is.
  if (global.document.cookie.includes('SameSite=Lax') && global.document.cookie.includes('SameSite=None')) {
     console.log('⚠️ INFO: Multiple SameSite attributes present.');
  }

  // Scenario 3: Injecting via name
  const name3 = 'myCookie; HttpOnly';
  const value3 = 'val';
  setPartitionedCookie(name3, value3);
  console.log(`Result 3: ${global.document.cookie}`);
  if (global.document.cookie.includes('HttpOnly') && !global.document.cookie.endsWith('Partitioned')) {
      // This is a bit tricky to detect simply, but let's see if the name was encoded
  }
}

testCookieInjection();
