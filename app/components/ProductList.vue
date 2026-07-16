<!-- app/components/ProductList.vue -->
<script setup>
import { useInfiniteScroll } from '@vueuse/core';

// 状态
const products = ref([]);
const pageInfo = ref({ hasNextPage: false, endCursor: '' });
const loading = ref(false);
const error = ref(null);

// 加载函数
const fetchProducts = async (after = null) => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const data = await $fetch('/api/products', {
      query: { after, category: props.categorySlug } // 关键：支持分类筛选
    });
    
    if (after) {
      products.value = [...products.value, ...data.products.nodes];
    } else {
      products.value = data.products.nodes;
    }
    pageInfo.value = data.products.pageInfo;
  } catch (err) {
    error.value = err;
    console.error('加载产品失败:', err);
  } finally {
    loading.value = false;
  }
};

// 无限滚动：监听列表底部元素
const loadMoreTrigger = ref(null);
useInfiniteScroll(
  loadMoreTrigger,
  async () => {
    if (pageInfo.value.hasNextPage && !loading.value) {
      await fetchProducts(pageInfo.value.endCursor);
    }
  },
  { distance: 100 }
);

// 首次加载
onMounted(() => {
  fetchProducts();
});

// 支持从父组件传入分类
const props = defineProps({
  categorySlug: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div>
    <!-- 产品网格 -->
    <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-4">
      <ProductCard v-for="product in products" :key="product.sku" :product="[product]" />
    </div>

    <!-- 加载状态 -->
    <ProductsSkeleton v-if="loading && products.length === 0" />
    
    <!-- 触发加载更多的占位元素 -->
    <div ref="loadMoreTrigger" class="h-10 flex justify-center items-center py-8">
      <UIcon v-if="loading && products.length > 0" name="i-svg-spinners-90-ring-with-bg" size="24" class="text-gray-400" />
      <span v-else-if="!pageInfo.hasNextPage && products.length > 0" class="text-sm text-gray-400">
        已加载全部产品
      </span>
    </div>
  </div>
</template>
