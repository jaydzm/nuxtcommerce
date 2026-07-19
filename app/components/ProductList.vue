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

// 状态
const productPages = ref([]);
const pageInfo = ref({ hasNextPage: false, endCursor: '' });
const loading = ref(false);
const error = ref(null);
const loadMoreTrigger = ref(null);

// ============ 随机种子管理 ============
const SEED_KEY = 'woo_random_seed';

// 获取或生成种子（存储在 sessionStorage，关闭页面后失效）
const getSeed = () => {
  let seed = sessionStorage.getItem(SEED_KEY);
  if (!seed) {
    seed = String(Math.floor(Math.random() * 99999) + 1);
    sessionStorage.setItem(SEED_KEY, seed);
  }
  return seed;
};

// 重置种子（分类切换时调用）
const resetSeed = () => {
  sessionStorage.removeItem(SEED_KEY);
};

// ============ 计算属性：合并所有页面 ============
const products = computed(() => {
  return productPages.value.flat();
});

// ============ 加载函数 ============
const fetchProducts = async (after = null) => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const query = new URLSearchParams();
    if (after) query.append('after', after);
    if (props.categorySlug) query.append('category', props.categorySlug);
    
    // ⭐ 关键修复：传递随机种子到后端
    const seed = getSeed();
    query.append('seed', seed);
    
    console.log(`[fetchProducts] 使用种子: ${seed}, after: ${after || '首次加载'}`);
    
    const data = await $fetch(`/api/products?${query.toString()}`);
    
    const newProducts = data.products.nodes || [];
    
    if (after) {
      productPages.value = [...productPages.value, newProducts];
    } else {
      productPages.value = [newProducts];
    }
    pageInfo.value = data.products.pageInfo;
  } catch (err) {
    error.value = err;
    console.error('加载产品失败:', err);
  } finally {
    loading.value = false;
  }
};

// ============ 重置并重新加载 ============
const resetAndFetch = async () => {
  resetSeed(); // 重置种子，生成新的随机顺序
  productPages.value = [];
  pageInfo.value = { hasNextPage: false, endCursor: '' };
  await fetchProducts();
};

// ============ 监听分类变化 ============
watch(() => props.categorySlug, () => {
  resetAndFetch();
});

// ============ 无限滚动 ============
useInfiniteScroll(
  loadMoreTrigger,
  async () => {
    if (pageInfo.value.hasNextPage && !loading.value) {
      await fetchProducts(pageInfo.value.endCursor);
    }
  },
  { distance: 100 }
);

// ============ 首次加载 ============
onMounted(() => {
  fetchProducts();
});

// ============ 暴露方法给父组件 ============
defineExpose({
  resetAndFetch,
  fetchProducts,
  resetSeed,
  getCurrentSeed: getSeed
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
        <template v-if="loading && productPages.length === 0">
          <div
            v-for="n in 12"
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
        :class="{ 'min-h-[80px]': pageInfo.hasNextPage }"
      >
        <!-- 加载更多时的加载指示器 -->
        <div v-if="loading && productPages.length > 0" class="flex flex-col items-center gap-2">
          <div class="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-400 dark:text-gray-500">加载更多...</span>
        </div>
        
        <!-- 已加载全部 -->
        <span 
          v-else-if="!pageInfo.hasNextPage && productPages.length > 0" 
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          — 已加载全部产品 ({{ productPages.reduce((acc, page) => acc + page.length, 0) }}件) —
        </span>
        
        <!-- 空状态 -->
        <span 
          v-else-if="!loading && productPages.length === 0" 
          class="text-gray-400 dark:text-gray-500"
        >
          口感快车高端茶样
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
