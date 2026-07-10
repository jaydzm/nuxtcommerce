// plugins/tj.client.ts

export default defineNuxtPlugin(() => {
  // 在客户端动态加载 51la 脚本
  const script = document.createElement('script')
  script.src = '/js/tj.js' // 对应 public/js/tj.js 文件
  script.defer = true
  document.head.appendChild(script)
})
