<script setup lang="ts">

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
