// nuxt.config.ts
import pkg from "./package.json";

export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: ["@vueuse/nuxt", "@nuxt/ui", "@nuxt/image", "notivue/nuxt", "@nuxtjs/i18n"],

  i18n: {
    defaultLocale: "cn",
    strategy: "prefix_except_default",
    langDir: "locales",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
      alwaysRedirect: true,
    },
    locales: [
      { code: "cn", iso: "cn-GB", file: "cn-NL.json", name: "china" },
      { code: "en", iso: "en-GB", file: "en-GB.json", name: "🇬🇧 English" },
      { code: "nb", iso: "nb-NO", file: "nb-NO.json", name: "🇳🇴 Norsk (Bokmål)" },
      { code: "nl", iso: "nl-NL", file: "nl-NL.json", name: "🇳🇱 Nederlands" },
      { code: "de", iso: "de-DE", file: "de-DE.json", name: "🇩🇪 Deutsch" },
    ],
  },

  notivue: {
    position: "top-center",
    limit: 3,
    notifications: { global: { duration: 3000 } },
  },

  css: ["notivue/notification.css", "notivue/animations.css"],

  runtimeConfig: {
    gqlHost: process.env.GQL_HOST || "",
    public: {
      version: pkg.version,
    },
  },

  // ✅ 图片缓存配置
  image: {
    ipx: {
      maxAge: 31536000
    }
  },

  // ✅ 路由缓存规则
  routeRules: {
    "/": { prerender: true },
    "/categories": { swr: 3600 },
    "/favorites": { swr: 600 },
    "/_ipx/**": {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  },

  nitro: {
    preset: "vercel",
    prerender: { routes: ["/sitemap.xml", "/robots.txt"] },
  },

  compatibilityDate: "2025-01-01",
});
