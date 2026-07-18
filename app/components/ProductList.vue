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
const allProducts = ref([]); // 存储所有已加载的产品
const loading = ref(false);
const error = ref(null);
const loadMoreTrigger = ref(null);
const hasMore = ref(true);
const currentPage = ref(1);
const totalPages = ref(0);

// ============ 随机种子 ============
const RANDOM_SEED_KEY = 'product_random_seed';

const getRandomSeed = () => {
  let seed = localStorage.getItem(RANDOM_SEED_KEY);
  if (!seed) {
    seed = String(Math.floor(Math.random() * 99999) + 1);
    localStorage.setItem(RANDOM_SEED_KEY, seed);
  }
  return parseInt(seed);
};

// 使用种子打乱数组（可复现的随机）
const shuffleWithSeed = (array, seed) => {
  const shuffled = [...array];
  let m = shuffled.length;
  let t, i;
  
  // 使用种子初始化伪随机数生成器
  let s = seed;
  const nextRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  
  while (m) {
    i = Math.floor(nextRandom() * m--);
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }
  
  return shuffled;
};

// ============ 加载函数 ============
const fetchProducts = async (page = 1) => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const query = new URLSearchParams();
    query.append('page', page);
    query.append('per_page', 30); // 一次多加载一些
    
    if (props.categorySlug) {
      query.append('category', props.categorySlug);
    }
    
    const data = await $fetch(`/api/products?${query.toString()}`);
    
    // 获取所有产品
    const newProducts = data.products?.nodes || data.products || [];
    totalPages.value = data.products?.pageInfo?.totalPages || 0;
    
    // 存储所有产品
    allProducts.value = [...allProducts.value, ...newProducts];
    hasMore.value = page < totalPages.value;
    currentPage.value = page;
    
  } catch (err) {
    error.value = err;
    console.error('加载产品失败:', err);
  } finally {
    loading.value = false;
  }
};

// ============ 计算打乱后的产品列表 ============
const products = computed(() => {
  const seed = getRandomSeed();
  return shuffleWithSeed(allProducts.value, seed);
});

// ============ 重置 ============
const resetAndFetch = async () => {
  allProducts.value = [];
  currentPage.value = 1;
  hasMore.value = true;
  await fetchProducts(1);
};

// ============ 加载更多 ============
const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  await fetchProducts(currentPage.value + 1);
};

// 监听分类变化
watch(() => props.categorySlug, () => {
  // 分类变化时重置种子
  localStorage.removeItem(RANDOM_SEED_KEY);
  resetAndFetch();
});

// 无限滚动
useInfiniteScroll(
  loadMoreTrigger,
  loadMore,
  { distance: 100 }
);

// 首次加载
onMounted(() => {
  fetchProducts(1);
});

// 暴露方法
defineExpose({
  resetAndFetch,
  getCurrentSeed: getRandomSeed,
  resetRandomSeed: () => {
    localStorage.removeItem(RANDOM_SEED_KEY);
  }
});
</script>

<template>
  <!-- 模板保持不变，但使用 products computed -->
  <div class="container mx-auto">
    <div v-if="error" class="text-center py-12">
      <p class="text-red-500 dark:text-red-400">加载失败: {{ error.message }}</p>
      <button 
        @click="resetAndFetch" 
        class="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
      >
        重试
      </button>
    </div>

    <div v-else>
      <div v-if="allProducts.length > 0" class="flex justify-end mb-4">
        <button 
          @click="() => { localStorage.removeItem(RANDOM_SEED_KEY); resetAndFetch(); }"
          class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          🔀 换一批
        </button>
      </div>

      <div 
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
      >
        <ProductCard 
          v-for="product in products" 
          :key="product.sku || product.id" 
          :products="[product]" 
        />
        
        <!-- 骨架屏 -->
        <template v-if="loading && allProducts.length === 0">
          <div v-for="n in 12" :key="'skeleton-' + n" class="group select-none">
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

      <!-- 加载更多 -->
      <div 
        ref="loadMoreTrigger" 
        class="flex justify-center items-center py-8 min-h-[60px]"
        :class="{ 'min-h-[80px]': hasMore }"
      >
        <div v-if="loading && allProducts.length > 0" class="flex flex-col items-center gap-2">
          <div class="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-400 dark:text-gray-500">加载更多...</span>
        </div>
        
        <span 
          v-else-if="!hasMore && allProducts.length > 0" 
          class="text-sm text-gray-400 dark:text-gray-500"
        >
          — 已加载全部产品 —
        </span>
        
        <span 
          v-else-if="!loading && allProducts.length === 0" 
          class="text-gray-400 dark:text-gray-500"
        >
          口感快车高端茶样
        </span>
      </div>
    </div>
  </div>
</template>
