// nuxt.config.ts
import pkg from "./package.json";

export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: ["@vueuse/nuxt", "@nuxt/ui", "@nuxt/image", "notivue/nuxt", "@nuxtjs/i18n", "@nuxthub/core"],

  // ========== 图片配置：改为使用 static 提供者 ==========
  image: {
    // 从 'vercel' 改为 'static'，直接使用源站图片
    provider: 'static',
    
    // 配置允许的域名
    domains: ['www.toppuer.top'],
    
    // 远程图片模式配置
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.toppuer.top',
        port: '',
        pathname: '/**',
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
    
    
    // 图片格式配置
    formats: ['webp', 'avif', 'jpg'],
  },

  // ========== 国际化配置 ==========
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

  // ========== Notivue 通知配置 ==========
  notivue: {
    position: "top-center",
    limit: 3,
    notifications: { global: { duration: 3000 } },
  },

  // ========== CSS 配置 ==========
  css: ["notivue/notification.css", "notivue/animations.css"],

  // ========== 运行时配置 ==========
  runtimeConfig: {
    gqlHost: process.env.GQL_HOST || "",
    public: {
      version: pkg.version,
    },
  },

  // ========== 路由规则配置 ==========
  routeRules: {
    '/': { prerender: true },
    '/product/**': { isr: 3600 },
    '/categories': { swr: 3600 },
    '/favorites': { swr: 3600 },
    '/cart': { ssr: true },
    '/checkout': { ssr: true },
    '/account/**': { ssr: true },
    // 已删除 Vercel 图片缓存路由规则
    // '/_vercel/image/**': { swr: 86400 },
  },

  // ========== Nitro 服务器配置 ==========
  nitro: {
    // 已删除 Vercel 特定配置
    // vercel: {
    //   external: true,
    // },
    
    prerender: { 
      routes: ["/sitemap.xml", "/robots.txt"] 
    },
    
    // 已删除 Vercel 图片路由规则
    routeRules: {
      // '/_vercel/image/**': {
      //   swr: 86400,
      //   headers: {
      //     'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      //   },
      // },
    },
  },

  compatibilityDate: "2025-01-01",
});
