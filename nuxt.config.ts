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
   // 1. 静态首页：在构建时预渲染，速度最快
    '/': { prerender: true },

    // 2. 产品详情页：使用 ISR (增量静态再生)
    //    首次访问时生成HTML，之后1小时内直接提供缓存，1小时后后台更新[citation:4][citation:8]
    '/product/**': { isr: 3600 }, // 单位：秒

    // 3. 分类页面：使用 SWR (Stale-While-Revalidate)
    //    立即返回缓存（可能旧的），同时在后台更新新数据[citation:1][citation:4]
    '/categories': { swr: 3600 },
    '/favorites': { swr: 3600 },

    // 4. 动态和个性化页面：完全在客户端渲染，不进行服务端缓存
    '/cart': { ssr: false },
    '/checkout': { ssr: false },
    '/account/**': { ssr: false },
    // 你可以根据项目实际路由添加更多规则
  },

  nitro: {
    // preset: "cloudflare_pages",
    prerender: { routes: ["/sitemap.xml", "/robots.txt"] },
  },


  compatibilityDate: "2025-01-01",
});
