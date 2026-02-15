const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadBrowserModule(modulePath, exportKey, overrides = {}) {
  const absolutePath = path.resolve(modulePath);
  const code = fs.readFileSync(absolutePath, 'utf8');

  const window = overrides.window || {};
  const context = {
    console,
    setTimeout,
    clearTimeout,
    Date,
    Math,
    navigator: overrides.navigator || {},
    document: overrides.document || {},
    window,
    ...overrides,
  };

  context.window = window;
  context.window.window = window;
  context.globalThis = context;

  vm.runInNewContext(code, context, { filename: absolutePath });

  const exported = context.window[exportKey];
  if (!exported) {
    throw new Error(`Module ${modulePath} did not expose window.${exportKey}`);
  }
  return exported;
}

module.exports = {
  loadBrowserModule,
};
