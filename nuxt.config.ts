// nuxt.config.ts
import pkg from "./package.json";

export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: ["@vueuse/nuxt", "@nuxt/ui", "@nuxt/image", "notivue/nuxt", "@nuxtjs/i18n", "@nuxthub/core"],

    image: {
    provider: 'vercel',
    // 使用 domains 替代 remotePatterns（某些版本兼容性更好）
    domains: ['www.toppuer.top'],
    // 保留 remotePatterns 作为补充
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.toppuer.top',
      },
    ],
    // 屏幕断点配置（优化不同设备加载）
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  
  i18n: {
    defaultLocale: "cn",
    strategy: "prefix_except_default",
    langDir: "locales",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
      alwaysRedirect: false,
    },
    locales: [
      { code: "en", iso: "en-GB", file: "en-GB.json", name: "🇬🇧 English" },
      { code: "cn", iso: "zh-CN", file: "zh-CN.json", name: "中文" },
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
  '/': { prerender: true },
    '/product/**': { isr: 3600 },
    '/categories': { swr: 3600 },
    '/favorites': { swr: 3600 },
    '/cart': { ssr: false },
    '/checkout': { ssr: false },
    '/account/**': { ssr: false },
    // 关键：为 Vercel 图片优化添加路由规则
    '/_vercel/image/**': {
      swr: 86400, // 缓存24小时
    },
  },

  nitro: {
     // 关键：为 Vercel 环境添加图片优化的特定配置
    vercel: {
      // 允许外部图片优化
      external: true,
    },
    prerender: { 
      routes: ["/sitemap.xml", "/robots.txt"] 
    },
    // 确保图片请求不被缓存策略意外覆盖
    routeRules: {
      '/_vercel/image/**': {
        swr: 86400,
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      },
    },
  },


  compatibilityDate: "2025-01-01",
});
