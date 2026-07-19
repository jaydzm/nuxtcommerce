<!-- app/pages/swipe.vue -->
<template>
  <div class="swipe-page">
    <ProductSwipe :category-slug="categorySlug" />
  </div>
</template>

<script setup>
const route = useRoute();
const categorySlug = route.query.category || '';
</script>

<style>
/* 全局重置：禁止页面滚动 */
html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
  width: 100%;
}
</style>

<style scoped>
.swipe-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  background: #000;
}
</style>
