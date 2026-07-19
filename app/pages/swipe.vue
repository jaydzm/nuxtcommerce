<!-- app/pages/swipe.vue -->
<template>
  <div class="swipe-page">
    <ProductSwipe :category-slug="categorySlug" />
  </div>
</template>

<script setup>
const route = useRoute();
const categorySlug = route.query.category || '';

// 页面进入时禁止滚动，离开时恢复
onMounted(() => {
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
});
</script>

<style scoped>
.swipe-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background: #000;
}
</style>
