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
  <div class="product-list-container">
    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <p class="text-red-500">加载失败: {{ error.message }}</p>
      <button @click="resetAndFetch" class="retry-btn">重试</button>
    </div>

    <!-- 产品网格 -->
    <div 
      v-if="!error"
      class="product-grid"
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
          class="product-card skeleton-card"
        >
          <div class="skeleton-image-wrapper">
            <div class="skeleton-image"></div>
          </div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-desc"></div>
            <div class="skeleton-footer">
              <div class="skeleton-price"></div>
              <div class="skeleton-stats"></div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 加载更多触发器 -->
    <div 
      ref="loadMoreTrigger" 
      class="load-more-trigger"
      :class="{ 'has-more': pageInfo.hasNextPage }"
    >
      <!-- 加载更多时的加载指示器 -->
      <div v-if="loading && products.length > 0" class="loading-indicator">
        <div class="spinner"></div>
        <span class="text-sm text-gray-400">加载更多...</span>
      </div>
      
      <!-- 已加载全部 -->
      <span 
        v-else-if="!pageInfo.hasNextPage && products.length > 0" 
        class="text-sm text-gray-400"
      >
        — 已加载全部产品 —
      </span>
      
      <!-- 空状态 -->
      <span 
        v-else-if="!loading && products.length === 0" 
        class="text-gray-400"
      >
        暂无产品
      </span>
    </div>
  </div>
</template>

<style scoped>
.product-list-container {
  padding: 20px 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== 错误状态 ===== */
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 24px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #66b1ff;
}

/* ===== 产品网格 ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  min-height: 400px;
}

/* ===== 产品卡片 ===== */
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* ===== 图片容器 ===== */
.product-image-wrapper,
.skeleton-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 比例，适应更多商品图片 */
  background: #f5f7fa;
  overflow: hidden;
  flex-shrink: 0;
}

/* ===== 实际产品图片 ===== */
.product-image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== 骨架屏图片 ===== */
.skeleton-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

/* ===== 骨架屏内容 ===== */
.skeleton-content {
  padding: 12px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-content .skeleton-title {
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  width: 80%;
}

.skeleton-content .skeleton-desc {
  height: 14px;
  background: #f0f0f0;
  border-radius: 4px;
  width: 100%;
}

.skeleton-content .skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.skeleton-content .skeleton-price {
  height: 24px;
  width: 40%;
  background: #f0f0f0;
  border-radius: 4px;
}

.skeleton-content .skeleton-stats {
  height: 16px;
  width: 30%;
  background: #f0f0f0;
  border-radius: 4px;
}

/* ===== 加载动画 ===== */
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ===== 加载更多触发器 ===== */
.load-more-trigger {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
  min-height: 60px;
}

.load-more-trigger.has-more {
  min-height: 80px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f0f0f0;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .skeleton-content {
    padding: 8px 12px;
  }
  
  .skeleton-content .skeleton-title {
    height: 16px;
  }
  
  .skeleton-content .skeleton-desc {
    height: 12px;
  }
  
  .skeleton-content .skeleton-price {
    height: 20px;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1025px) {
  .product-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1280px) {
  .product-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (min-width: 1536px) {
  .product-grid {
    grid-template-columns: repeat(7, 1fr);
  }
}

/* ===== 暗色模式支持 ===== */
@media (prefers-color-scheme: dark) {
  .product-card {
    background: #1a1a1a;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
  
  .product-image-wrapper,
  .skeleton-image-wrapper {
    background: #2a2a2a;
  }
  
  .skeleton-image,
  .skeleton-content .skeleton-title,
  .skeleton-content .skeleton-desc,
  .skeleton-content .skeleton-price,
  .skeleton-content .skeleton-stats {
    background: #2a2a2a;
  }
  
  .skeleton-image {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  }
}
</style>
