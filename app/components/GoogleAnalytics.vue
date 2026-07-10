<!-- components/GoogleAnalytics.vue -->
<template>
  <ClientOnly>
    <div style="display: none;">
      <script async :src="`https://www.googletagmanager.com/gtag/js?id=${gaId}`"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', '{{ gaId }}');
      </script>
    </div>
  </ClientOnly>
</template>

<script setup>
const gaId = 'G-Q6SH4F3C8Q' // 👈 换成你自己的
</script>
