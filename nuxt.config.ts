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
      { code: "en", iso: "en-GB", file: "en-GB.json", name: "🇬🇧 English" },
      { code: "cn", iso: "zh-CN", file: "zh-CN.json", name: "中文" },
      { code: "nb", iso: "nb-NO", file: "nb-NO.json", name: "🇳🇴 Norsk (Bokmål)" },
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


  // app.config.ts
export default defineAppConfig({
  umami: {
    host: 'https://cloud.umami.is', // Umami Cloud 的官方地址
    id: 'eb7e1d43-b80b-4bc8-937f-b238d8a749a8', // 替换成刚才在 Umami Cloud 获取的 ID
    autoTrack: true, // 开启后会自动追踪页面浏览和路由切换
  },
})

  

  compatibilityDate: "2025-01-01",
});
