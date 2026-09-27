const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadSource(file, imports = {}, globals = {}) {
  const filename = path.join(__dirname, '..', file);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, require: (name) => imports[name] ?? require(name),
    process, Headers, AbortController, setTimeout, clearTimeout, ...globals,
  }, { filename });
  return exports;
}

function setup(responder) {
  const calls = [];
  const api = loadSource('src/services/api.ts', {}, {
    fetch: async (url, options) => { calls.push({ url, options }); return responder(url, options); },
  });
  const { authApi } = loadSource('src/services/auth-api.ts', { './api': api });
  return { api, authApi, calls };
}

test('register sends confirmation; login never sends a previous session token', async () => {
  const { api, authApi, calls } = setup(() => Response.json({ token: 'issued', user: { role: 'reader' } }));
  api.setApiToken('old-session');
  await authApi.register('Reader', 'reader@example.com', 'password', 'password');
  await authApi.login('reader@example.com', 'password');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    name: 'Reader', email: 'reader@example.com', password: 'password', password_confirmation: 'password',
  });
  assert.equal(calls[0].options.headers.has('Authorization'), false);
  assert.equal(calls[1].options.headers.has('Authorization'), false);
  assert.ok(calls[1].url.endsWith('/login'));
});

test('protected requests attach token and logout accepts HTTP 204', async () => {
  const { api, authApi, calls } = setup(() => new Response(null, { status: 204 }));
  api.setApiToken('active');
  await api.apiRequest('/books/1', { method: 'DELETE' });
  assert.equal(calls[0].options.headers.get('Authorization'), 'Bearer active');
  assert.equal(await authApi.logout('active'), undefined);
  assert.ok(calls[1].url.endsWith('/logout'));
});

test('validation errors remain readable and retain field details', async () => {
  const { authApi } = setup(() => Response.json({ errors: { email: ['Email đã được đăng ký.'] } }, { status: 422 }));
  await assert.rejects(authApi.login('a@b.com', 'password'), (error) => {
    assert.equal(error.status, 422);
    assert.equal(error.message, 'Email đã được đăng ký.');
    assert.equal(error.errors.email[0], error.message);
    return true;
  });
});

test('401 invalidates only the current session and stops sending its token', async () => {
  const { api, calls } = setup(() => Response.json({ message: 'Unauthenticated.' }, { status: 401 }));
  let invalidations = 0;
  api.onUnauthorized(() => invalidations++);
  api.setApiToken('current');
  await assert.rejects(api.apiRequest('/me', { token: 'old' }));
  assert.equal(invalidations, 0);
  await assert.rejects(api.apiRequest('/me'));
  assert.equal(invalidations, 1);
  await assert.rejects(api.apiRequest('/me'));
  assert.equal(calls[2].options.headers.has('Authorization'), false);
});

test('403 keeps the session and reports the permission error', async () => {
  const { api, calls } = setup(() => Response.json({ message: 'Không có quyền.' }, { status: 403 }));
  let invalidations = 0;
  api.onUnauthorized(() => invalidations++);
  api.setApiToken('reader');
  await assert.rejects(api.apiRequest('/books', { method: 'POST' }), { message: 'Không có quyền.' });
  await assert.rejects(api.apiRequest('/books', { method: 'POST' }));
  assert.equal(invalidations, 0);
  assert.equal(calls[1].options.headers.get('Authorization'), 'Bearer reader');
});

test('network and non-JSON server errors produce user-facing messages', async () => {
  const offline = setup(() => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(offline.authApi.login('a@b.com', 'password'), /Không thể kết nối máy chủ/);
  const server = setup(() => new Response('<html>Internal server error</html>', { status: 500 }));
  await assert.rejects(server.authApi.login('a@b.com', 'password'), /Máy chủ đang gặp sự cố/);
  const limited = setup(() => new Response('', { status: 429 }));
  await assert.rejects(limited.authApi.login('a@b.com', 'password'), /thử lại sau một phút/);
});

test('native storage persists and deletes token through SecureStore', async () => {
  const values = new Map();
  const storage = loadSource('src/services/token-storage.ts', {
    'react-native': { Platform: { OS: 'android' } },
    'expo-secure-store': {
      getItemAsync: async (key) => values.get(key) ?? null,
      setItemAsync: async (key, value) => { values.set(key, value); },
      deleteItemAsync: async (key) => { values.delete(key); },
    },
  }).tokenStorage;
  assert.equal(await storage.get(), null);
  await storage.set('native-token');
  assert.equal(await storage.get(), 'native-token');
  await storage.remove();
  assert.equal(await storage.get(), null);
});

test('web does not persist tokens or invoke native storage', async () => {
  const storage = loadSource('src/services/token-storage.ts', {
    'react-native': { Platform: { OS: 'web' } },
    'expo-secure-store': {},
  }).tokenStorage;
  await storage.set('web-token');
  assert.equal(await storage.get(), null);
  await storage.remove();
});
