// app/app.config.ts
export default defineAppConfig({
  site: {
    name: '口感快车',
    description: '纯天然茶叶打造，免费领取试喝茶样.',
  },
  ui: {
    primary: 'red',
    gray: 'neutral',
  },

  umami: {
    host: 'https://cloud.umami.is', // Umami Cloud 的官方地址
    id: 'eb7e1d43-b80b-4bc8-937f-b238d8a749a8', // 替换成刚才在 Umami Cloud 获取的 ID
    autoTrack: true, // 开启后会自动追踪页面浏览和路由切换
  },
  
});
