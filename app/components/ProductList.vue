<!-- app/components/ProductList.vue -->
<script setup>
import { useInfiniteScroll } from '@vueuse/core';
import { ref, onMounted, watch, computed } from 'vue';

// Props
const props = defineProps({
  categorySlug: {
    type: String,
    default: ''
  }
});

// ============ 状态 ============
const allProducts = ref([]);
const loading = ref(false);
const error = ref(null);
const displayCount = ref(4); // 当前显示数量，每次加载+4
const loadMoreTrigger = ref(null);

// ============ 计算属性 ============
// 当前显示的产品（前 N 个）
const products = computed(() => {
  return allProducts.value.slice(0, displayCount.value);
});

// 是否还有更多
const hasMore = computed(() => {
  return displayCount.value < allProducts.value.length;
});

// 总产品数
const totalCount = computed(() => {
  return allProducts.value.length;
});

// 已加载数量
const loadedCount = computed(() => {
  return products.value.length;
});

// ============ 加载函数 ============
const fetchProducts = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const query = new URLSearchParams();
    if (props.categorySlug) query.append('category', props.categorySlug);
    query.append('per_page', 100);
    
    const data = await $fetch(`/api/products?${query.toString()}`);
    
    allProducts.value = data.products.nodes || [];
    displayCount.value = 4; // 初始显示4个
  } catch (err) {
    error.value = err;
    console.error('加载产品失败:', err);
  } finally {
    loading.value = false;
  }
};

// ============ 加载更多（追加4个） ============
const loadMore = () => {
  if (!hasMore.value || loading.value) return;
  displayCount.value += 4; // 每次追加4个
};

// ============ 重置 ============
const resetAndFetch = async () => {
  allProducts.value = [];
  displayCount.value = 4;
  await fetchProducts();
};

// ============ 监听分类变化 ============
watch(() => props.categorySlug, () => {
  resetAndFetch();
});

// ============ 无限滚动 ============
useInfiniteScroll(
  loadMoreTrigger,
  () => {
    if (hasMore.value && !loading.value) {
      loadMore();
    }
  },
  { distance: 100 }
);

// ============ 首次加载 ============
onMounted(() => {
  fetchProducts();
});

// ============ 暴露方法 ============
defineExpose({
  resetAndFetch,
  fetchProducts,
  loadMore
});
</script>

<template>
  <div class="container mx-auto">
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
      <!-- 显示加载进度 -->
      <div v-if="totalCount > 0" class="flex justify-between items-center mb-4">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ totalCount }} 件商品
        </span>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          已加载 {{ loadedCount }}/{{ totalCount }}
        </span>
      </div>

      <div 
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <!-- 实际产品卡片 -->
        <ProductCard 
          v-for="product in products" 
          :key="product.sku || product.id" 
          :products="[product]" 
        />
        
        <!-- 骨架屏占位（首次加载） -->
        <template v-if="loading && allProducts.length === 0">
          <div
            v-for="n in 4"
            :key="'skeleton-' + n"
            class="group select-none"
          >
            <div class="cursor-pointer transition ease-[ease] duration-300">
              <div class="relative pb-[133%] rounded-2xl overflow-hidden dark:shadow-[0_8px_24px_rgba(0,0,0,.5)] animate-pulse">
                <div class="absolute h-full w-full dark:bg-neutral-800 bg-neutral-200"></div>
              </div>
              <div class="grid gap-0.5 pt-3 pb-4 px-1.5">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 加载更多触发器 -->
      <div 
        ref="loadMoreTrigger" 
        class="flex justify-center items-center py-8 min-h-[60px]"
        :class="{ 'min-h-[80px]': hasMore }"
      >
        <!-- 加载更多时的加载指示器 -->
        <div v-if="loading && allProducts.length > 0" class="flex flex-col items-center gap-2">
          <div class="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-400 dark:text-gray-500">加载更多...</span>
        </div>
        
        <!-- 已加载全部 -->
        <span 
          v-else-if="!hasMore && totalCount > 0" 
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          — 已加载全部 {{ totalCount }} 件产品 —
        </span>
        
        <!-- 空状态 -->
        <span 
          v-else-if="!loading && totalCount === 0" 
          class="text-gray-400 dark:text-gray-500"
        >
          暂无产品
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}

/* 美化滚动条 - Pinterest 风格 */
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
