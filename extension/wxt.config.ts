import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ["activeTab", "storage", "contextMenus"],
    host_permissions: ["http://localhost:3000/*", "https://*/*", "http://*/*"],
  }
});
