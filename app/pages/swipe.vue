<template>
  <div class="swipe-container">
    <ProductSwipe :category-slug="categorySlug" />
  </div>
</template>

<script setup>
// 从 URL 参数获取分类，如果没有则显示全部
const route = useRoute();
const categorySlug = route.query.category || '';
</script>

<style scoped>
.swipe-container {
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style>
