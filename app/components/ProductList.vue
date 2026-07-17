<!-- app/components/ProductList.vue -->
<script setup>
import { useInfiniteScroll } from '@vueuse/core';
import { ref, onMounted, watch } from 'vue';

// Props
const props = defineProps({
  categorySlug: {
    type: String,
    default: ''
  }
});

// 状态
const products = ref([]);
const pageInfo = ref({ hasNextPage: false, endCursor: '' });
const loading = ref(false);
const error = ref(null);
const loadMoreTrigger = ref(null);

// 加载函数
const fetchProducts = async (after = null) => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const query = new URLSearchParams();
    if (after) query.append('after', after);
    if (props.categorySlug) query.append('category', props.categorySlug);
    
    const data = await $fetch(`/api/products?${query.toString()}`);
    
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

// 重置并重新加载（当分类变化时）
const resetAndFetch = async () => {
  products.value = [];
  pageInfo.value = { hasNextPage: false, endCursor: '' };
  await fetchProducts();
};

// 监听分类变化
watch(() => props.categorySlug, () => {
  resetAndFetch();
});

// 无限滚动
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

// 暴露方法给父组件
defineExpose({
  resetAndFetch,
  fetchProducts
});
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- 错误状态 -->
    <div v-if="error" class="text-center py-12">
      <p class="text-red-500 dark:text-red-400">加载失败: {{ error.message }}</p>
      <button 
        @click="resetAndFetch" 
        class="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        重试
      </button>
    </div>

    <!-- 产品网格 -->
    <div v-else>
      <div 
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
      >
        <!-- 实际产品卡片 -->
        <ProductCard 
          v-for="product in products" 
          :key="product.sku || product.id" 
          :products="[product]" 
        />
        
        <!-- 骨架屏占位（首次加载） -->
        <template v-if="loading && products.length === 0">
          <div
            v-for="n in 12"
            :key="'skeleton-' + n"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse"
          >
            <!-- 图片占位 - 4:3 比例 -->
            <div class="relative w-full pt-[75%] bg-gray-200 dark:bg-gray-700">
              <div class="absolute inset-0"></div>
            </div>
            <!-- 内容占位 -->
            <div class="p-4 space-y-3">
              <!-- 标题 -->
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <!-- 描述 -->
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <!-- 底部：价格和统计 -->
              <div class="flex justify-between items-center pt-2">
                <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div class="flex gap-3">
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 加载更多触发器 -->
      <div 
        ref="loadMoreTrigger" 
        class="flex justify-center items-center py-8 min-h-[60px]"
        :class="{ 'min-h-[80px]': pageInfo.hasNextPage }"
      >
        <!-- 加载更多时的加载指示器 -->
        <div v-if="loading && products.length > 0" class="flex flex-col items-center gap-2">
          <div class="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-400 dark:text-gray-500">加载更多...</span>
        </div>
        
        <!-- 已加载全部 -->
        <span 
          v-else-if="!pageInfo.hasNextPage && products.length > 0" 
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          — 已加载全部产品 —
        </span>
        
        <!-- 空状态 -->
        <span 
          v-else-if="!loading && products.length === 0" 
          class="text-gray-400 dark:text-gray-500"
        >
          暂无产品
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 保留容器样式，其他全部使用 Tailwind */
.container {
  max-width: 1400px;
}

/* 自定义滚动条（可选，与 Pinterest 风格匹配） */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 暗色模式滚动条 */
@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-track {
    background: #2d2d2d;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #555;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #666;
  }
}
</style>
