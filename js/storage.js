/**
 * SIAKAD Cakrawala — localStorage Wrapper
 * Simpan data demo dengan prefix siakad-demo-
 * Fallback ke in-memory jika localStorage tidak tersedia
 */

const PREFIX = 'siakad-demo-';
const _mem = {};

function _isAvailable() {
  try { localStorage.setItem('__test__', '1'); localStorage.removeItem('__test__'); return true; }
  catch { return false; }
}

const _storage = _isAvailable() ? localStorage : {
  getItem: k => _mem[k] ?? null,
  setItem: (k, v) => { _mem[k] = v; },
  removeItem: k => { delete _mem[k]; },
  clear: () => { Object.keys(_mem).forEach(k => delete _mem[k]); },
  key: i => Object.keys(_mem)[i] ?? null,
  get length() { return Object.keys(_mem).length; },
};

export const Storage = {
  get(key) {
    try {
      const raw = _storage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key, value) {
    try { _storage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch (e) { console.warn('[Storage] set failed:', e); return false; }
  },

  remove(key) {
    try { _storage.removeItem(PREFIX + key); }
    catch { /* noop */ }
  },

  has(key) { return _storage.getItem(PREFIX + key) !== null; },

  clearAll() {
    const keys = [];
    for (let i = 0; i < _storage.length; i++) {
      const k = _storage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach(k => _storage.removeItem(k));
  },

  keys() {
    const out = [];
    for (let i = 0; i < _storage.length; i++) {
      const k = _storage.key(i);
      if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
    }
    return out;
  },
};
