<template>
  <div class="swipe-wrapper" @wheel="onWheel">
    <div v-if="loading && products.length === 0" class="loading-state">
      加载中...
    </div>
    
    <div
      v-for="(product, index) in products"
      :key="product.id"
      class="product-card"
      :style="{ transform: `translateY(${(index - currentIndex) * 100}vh)` }"
    >
      <div class="product-image">
        <img :src="product.image?.sourceUrl" :alt="product.name" />
      </div>
      <div class="product-info">
        <h2>{{ product.name }}</h2>
        <p class="price">{{ product.price }}</p>
        <button class="add-to-cart">加入购物车</button>
      </div>
    </div>
    
    <div v-if="loading && products.length > 0" class="loading-more">
      加载更多...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  categorySlug: {
    type: String,
    default: ''
  }
});

const products = ref([]);
const currentIndex = ref(0);
const loading = ref(false);
const hasMore = ref(true);
const after = ref(null);

const fetchProducts = async () => {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  
  try {
    const query = new URLSearchParams();
    if (props.categorySlug) query.append('category', props.categorySlug);
    if (after.value) query.append('after', after.value);
    query.append('per_page', 10);
    query.append('orderby', 'DESC');
    query.append('fieldby', 'DATE');
    
    const data = await $fetch(`/api/products?${query.toString()}`);
    const newProducts = data.products.nodes || [];
    
    products.value = [...products.value, ...newProducts];
    after.value = data.products.pageInfo?.endCursor || null;
    hasMore.value = data.products.pageInfo?.hasNextPage || false;
  } catch (err) {
    console.error('加载失败:', err);
  } finally {
    loading.value = false;
  }
};

// 鼠标滚轮翻页（模拟滑动）
const onWheel = (e) => {
  if (e.deltaY > 0 && currentIndex.value < products.value.length - 1) {
    currentIndex.value++;
  } else if (e.deltaY < 0 && currentIndex.value > 0) {
    currentIndex.value--;
  }
  
  // 滑到倒数第3个时预加载
  if (currentIndex.value > products.value.length - 3 && hasMore.value && !loading.value) {
    fetchProducts();
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.swipe-wrapper {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.product-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  transition: transform 0.4s ease;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.product-image {
  flex: 1;
  background: #f5f5f5;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 20px;
  background: #fff;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #b7903c;
}

.add-to-cart {
  width: 100%;
  padding: 12px;
  background: #b7903c;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.loading-state, .loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #999;
  font-size: 16px;
}
</style>
