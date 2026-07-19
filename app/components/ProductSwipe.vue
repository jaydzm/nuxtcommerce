<template>
  <div 
    class="swipe-wrapper" 
    @wheel="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @keydown="onKeyDown"
    tabindex="0"
  >
    <!-- 加载状态 -->
    <div v-if="loading && products.length === 0" class="loading-state">
      加载中...
    </div>
    
    <!-- 产品卡片 -->
    <div
      v-for="(product, index) in products"
      :key="product.id"
      class="product-card"
      :style="{ transform: `translateY(${(index - currentIndex) * 100}vh)` }"
    >
      <!-- 图片轮播区（左右滑动） -->
      <div 
        class="product-image-carousel"
        @touchstart="onImageTouchStart"
        @touchmove="onImageTouchMove"
        @touchend="onImageTouchEnd"
      >
        <div 
          class="image-track"
          :style="{ transform: `translateX(${-imageIndex * 100}%)` }"
        >
          <div 
            v-for="(image, imgIdx) in product.images" 
            :key="imgIdx"
            class="image-slide"
          >
            <img 
              :src="image.sourceUrl" 
              :alt="product.name" 
              loading="lazy"
            />
          </div>
        </div>
        
        <!-- 图片指示器 -->
        <div v-if="product.images.length > 1" class="image-dots">
          <span 
            v-for="(_, idx) in product.images" 
            :key="idx"
            class="dot"
            :class="{ active: idx === imageIndex }"
          ></span>
        </div>
        
        <!-- 左右箭头（电脑端） -->
        <button 
          v-if="product.images.length > 1" 
          class="arrow arrow-left"
          @click.stop="prevImage"
        >
          ‹
        </button>
        <button 
          v-if="product.images.length > 1" 
          class="arrow arrow-right"
          @click.stop="nextImage"
        >
          ›
        </button>
      </div>
      
      <!-- 产品信息 -->
      <div class="product-info">
        <h2>{{ product.name }}</h2>
        <p class="price">{{ product.price }}</p>
        <button 
          class="add-to-cart" 
          @click="addToCart(product)"
          :disabled="addingToCart"
        >
          {{ addingToCart ? '添加中...' : '加入购物车' }}
        </button>
      </div>
    </div>
    
    <!-- 加载更多 -->
    <div v-if="loading && products.length > 0" class="loading-more">
      加载更多...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCart } from '~~/composables/useCart'; // 根据你的项目实际路径调整

const props = defineProps({
  categorySlug: {
    type: String,
    default: ''
  }
});

// ========== 状态 ==========
const products = ref([]);
const currentIndex = ref(0);
const imageIndex = ref(0);
const loading = ref(false);
const hasMore = ref(true);
const after = ref(null);
const addingToCart = ref(false);

// ========== 购物车 ==========
const { addToCart: addToCartAction } = useCart();

const addToCart = async (product) => {
  if (addingToCart.value) return;
  addingToCart.value = true;
  
  try {
    // 获取产品变体ID（如果是简单产品则用产品ID）
    const productId = product.databaseId || product.id;
    await addToCartAction({ productId, quantity: 1 });
    // 可以加一个成功提示
    console.log('已添加到购物车');
  } catch (err) {
    console.error('添加到购物车失败:', err);
  } finally {
    addingToCart.value = false;
  }
};

// ========== 数据加载 ==========
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
    
    // 处理产品图片（确保是数组）
    const processedProducts = newProducts.map(p => ({
      ...p,
      images: p.images?.nodes || (p.image ? [p.image] : [])
    }));
    
    products.value = [...products.value, ...processedProducts];
    after.value = data.products.pageInfo?.endCursor || null;
    hasMore.value = data.products.pageInfo?.hasNextPage || false;
  } catch (err) {
    console.error('加载失败:', err);
  } finally {
    loading.value = false;
  }
};

// ========== 图片导航 ==========
const nextImage = () => {
  const currentProduct = products.value[currentIndex.value];
  if (currentProduct && imageIndex.value < currentProduct.images.length - 1) {
    imageIndex.value++;
  }
};

const prevImage = () => {
  if (imageIndex.value > 0) {
    imageIndex.value--;
  }
};

// ========== 预加载检查 ==========
const checkPreload = () => {
  if (currentIndex.value > products.value.length - 3 && hasMore.value && !loading.value) {
    fetchProducts();
  }
};

// ========== 垂直滑动（产品切换） ==========
const onWheel = (e) => {
  e.preventDefault();
  if (e.deltaY > 0 && currentIndex.value < products.value.length - 1) {
    currentIndex.value++;
    imageIndex.value = 0; // 切换产品时重置图片索引
  } else if (e.deltaY < 0 && currentIndex.value > 0) {
    currentIndex.value--;
    imageIndex.value = 0;
  }
  checkPreload();
};

// ========== 触摸滑动（产品切换） ==========
let touchStartY = 0;
let isSwiping = false;

const onTouchStart = (e) => {
  touchStartY = e.touches[0].clientY;
  isSwiping = true;
};

const onTouchMove = (e) => {
  if (!isSwiping) return;
  const deltaY = touchStartY - e.touches[0].clientY;
  
  if (deltaY > 50 && currentIndex.value < products.value.length - 1) {
    currentIndex.value++;
    imageIndex.value = 0;
    isSwiping = false;
  } else if (deltaY < -50 && currentIndex.value > 0) {
    currentIndex.value--;
    imageIndex.value = 0;
    isSwiping = false;
  }
  checkPreload();
};

const onTouchEnd = () => {
  isSwiping = false;
};

// ========== 图片左右滑动（触摸） ==========
let imageTouchStartX = 0;
let isImageSwiping = false;

const onImageTouchStart = (e) => {
  // 阻止事件冒泡，避免影响产品切换
  e.stopPropagation();
  imageTouchStartX = e.touches[0].clientX;
  isImageSwiping = true;
};

const onImageTouchMove = (e) => {
  if (!isImageSwiping) return;
  e.stopPropagation();
  const deltaX = imageTouchStartX - e.touches[0].clientX;
  const currentProduct = products.value[currentIndex.value];
  if (!currentProduct) return;
  
  if (deltaX > 50 && imageIndex.value < currentProduct.images.length - 1) {
    imageIndex.value++;
    isImageSwiping = false;
  } else if (deltaX < -50 && imageIndex.value > 0) {
    imageIndex.value--;
    isImageSwiping = false;
  }
};

const onImageTouchEnd = () => {
  isImageSwiping = false;
};

// ========== 键盘支持 ==========
const onKeyDown = (e) => {
  if (e.key === 'ArrowDown' && currentIndex.value < products.value.length - 1) {
    e.preventDefault();
    currentIndex.value++;
    imageIndex.value = 0;
  } else if (e.key === 'ArrowUp' && currentIndex.value > 0) {
    e.preventDefault();
    currentIndex.value--;
    imageIndex.value = 0;
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    nextImage();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevImage();
  }
  checkPreload();
};

// ========== 生命周期 ==========
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.swipe-wrapper {
  position: relative;
  height: 100vh;
  overflow: hidden;
  outline: none;
  background: #000;
}

/* ===== 产品卡片 ===== */
.product-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* ===== 图片轮播 ===== */
.product-image-carousel {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.image-track {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
}

.image-slide {
  min-width: 100%;
  height: 100%;
}

.image-slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f5f5f5;
}

/* ===== 图片指示器 ===== */
.image-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(0,0,0,0.3);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transition: all 0.3s;
}

.dot.active {
  background: #fff;
  width: 20px;
  border-radius: 4px;
}

/* ===== 箭头按钮（电脑端） ===== */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.4);
  color: #fff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s;
  display: none;
}

.arrow:hover {
  background: rgba(0,0,0,0.7);
}

.arrow-left {
  left: 10px;
}
.arrow-right {
  right: 10px;
}

/* 电脑端显示箭头 */
@media (hover: hover) {
  .arrow {
    display: block;
  }
}

/* ===== 产品信息 ===== */
.product-info {
  padding: 20px 24px 30px;
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
}

.product-info h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #1a1a1a;
}

.price {
  font-size: 22px;
  font-weight: bold;
  color: #b7903c;
  margin: 0 0 12px;
}

.add-to-cart {
  width: 100%;
  padding: 14px;
  background: #b7903c;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-to-cart:hover {
  background: #a07f30;
}

.add-to-cart:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== 加载状态 ===== */
.loading-state, .loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #999;
  font-size: 16px;
}
</style>
