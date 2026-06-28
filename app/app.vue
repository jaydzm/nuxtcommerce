<template>
  <div style="padding: 20px; background: #fff3cd; color: #856404; border: 1px solid #ffeeba; margin: 20px; font-family: monospace; z-index: 9999; position: relative;">
    <h3>🔌 调试看板</h3>
    <p><strong>Vercel 传给前端的后端地址是：</strong> <span style="color: red;">{{ config.public.graphqlTarget || ' 或者是空的/没读到' }}</span></p >
    <p><strong>Apollo 客户端状态：</strong> {{ pending ? '正在尝试连接...' : '连接尝试结束' }}</p >
    <p v-if="error" style="color: red;"><strong>报错信息：</strong> {{ error.message }}</p >
  </div>
</template>




<script setup lang="ts">  
const { site } = useAppConfig();
const { name, description } = site;

useHead({
  htmlAttrs: { lang: 'en' },
  titleTemplate: (chunk?: string) => (chunk ? `${chunk} - ${name}` : name),
});

useSeoMeta({
  description,
  ogType: 'website',
  ogSiteName: name,
  ogLocale: 'en_US',
  ogImage: 'https://commerce.nuxt.dev/social-card.jpg',
  twitterCard: 'summary_large_image',
  twitterSite: '@zhatlen',
  twitterCreator: '@zhatlen',
  twitterImage: 'https://commerce.nuxt.dev/social-card.jpg',
  keywords: `${name}, ecommerce, nuxt, woocommerce`,
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
});
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
