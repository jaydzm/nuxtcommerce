<script setup lang="ts">
import { onMounted } from 'vue'

const { site } = useAppConfig()
const { name, description } = site

useHead({
  htmlAttrs: { lang: 'cn' },
  titleTemplate: (chunk?: string) => (chunk ? `${chunk} - ${name}` : name),
})

useSeoMeta({
  description,
  ogType: 'website',
  ogSiteName: name,
  ogLocale: 'en_US',
  ogImage: 'https://www.toptea.top/social-card.jpg',
  twitterImage: 'https://www.toptea.top/social-card.jpg',
  keywords: `${name}, 茶样, 古树茶, 高端茶`,
  charset: 'utf-8',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
})

// 添加这部分 → 51LA 统计代码
onMounted(() => {
  // 加载 51LA SDK
  const script = document.createElement('script')
  script.src = 'https://sdk.51.la/js-sdk-pro.min.js'
  script.id = 'LA_COLLECT'
  script.async = true
  script.setAttribute('charset', 'UTF-8')
  document.head.appendChild(script)

  // 配置 51LA
  const config = {
    id: '3QWESqerv71jwMMn',
    ck: '3QWESqerv71jwMMn'
  }
  
  // 初始化
  if (!window.LA) {
    window.LA = { ids: [] }
  }
  window.LA.ids.push(config)
})
</script>

<template>
  <AppHeader />
  <main class="pt-[72px] lg:pt-20 min-h-[calc(100vh-72px)]">
    <NuxtPage />
  </main>
  <AppFooter />
  <Notivue v-slot="item">
    <Notification :item="item" :theme="materialTheme" />
  </Notivue>
   <Script src="https://cloud.umami.is/script.js" data-website-id="eb7e1d43-b80b-4bc8-937f-b238d8a749a8" async />
</template>

<style lang="postcss">
.dark {
  @apply bg-black text-neutral-100;
  color-scheme: dark;
}
.dropdown-enter-active {
  @apply transition duration-200 ease-out;
}
.dropdown-enter-from,
.dropdown-leave-to {
  @apply translate-y-5 opacity-0;
}
.dropdown-enter-to,
.dropdown-leave-from {
  @apply transform opacity-100;
}
.dropdown-leave-active {
  @apply transition duration-150 ease-in;
}
</style>
