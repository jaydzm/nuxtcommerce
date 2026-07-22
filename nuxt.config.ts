// nuxt.config.ts
import pkg from "./package.json";

export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: ["@vueuse/nuxt", "@nuxt/ui", "@nuxt/image", "notivue/nuxt", "@nuxtjs/i18n", "@nuxthub/core"],

    image: {
    provider: 'vercel', 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',  // 替换成你的图片域名
        pathname: '/**',
      },
    ],
  },

  
  i18n: {
    defaultLocale: "en",
    strategy: "prefix_except_default",
    langDir: "locales",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
      alwaysRedirect: true,
    },
    locales: [
      { code: "en", iso: "en-GB", file: "en-GB.json", name: "🇬🇧 English" },
      { code: "nl", iso: "nl-NL", file: "nl-NL.json", name: "🇳🇱 Nederlands" },
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

  routeRules: {
    "/": { prerender: true },
    "/categories": { swr: 10000 },
    "/favorites": { swr: 6000 },
  },

  nitro: {
    // preset: "cloudflare_pages",
    prerender: { routes: ["/sitemap.xml", "/robots.txt"] },
  },


   ui: {
    primary: 'green',
    gray: 'neutral',
  },
  

  compatibilityDate: "2025-01-01",
});
