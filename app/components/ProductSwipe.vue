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
    <div v-if="loading && products.length === 0" class="loading-state">
      加载中...
    </div>
    
    <!-- ===== 产品卡片（滑动区域） ===== -->
    <div
      v-for="(product, index) in products"
      :key="product.id"
      class="product-card"
      :style="{ transform: `translateY(${(index - currentIndex) * 100}vh)` }"
    >
      <!-- 全屏图片轮播 -->
      <div 
        class="product-image-carousel"
        @touchstart="onImageTouchStart"
        @touchmove="onImageTouchMove"
        @touchend="onImageTouchEnd"
        @touchcancel="onImageTouchEnd"
      >
        <div 
          class="image-track"
          :style="{ transform: `translateX(${-imageIndex * 100}%)` }"
        >
          <div 
            v-for="(image, imgIdx) in getProductImages(product)" 
            :key="imgIdx"
            class="image-slide"
          >
            <img 
              :src="image.sourceUrl || image.src" 
              :alt="product.name" 
              loading="lazy"
              draggable="false"
            />
          </div>
        </div>
        
        <!-- 图片指示器 -->
        <div v-if="getProductImages(product).length > 1" class="image-dots">
          <span 
            v-for="(_, idx) in getProductImages(product)" 
            :key="idx"
            class="dot"
            :class="{ active: idx === imageIndex }"
          ></span>
        </div>
        
        <!-- 左右箭头 -->
        <button 
          v-if="getProductImages(product).length > 1" 
          class="arrow arrow-left"
          @click.stop="prevImage"
        >
          ‹
        </button>
        <button 
          v-if="getProductImages(product).length > 1" 
          class="arrow arrow-right"
          @click.stop="nextImage"
        >
          ›
        </button>
      </div>
    </div>
    
    <!-- ===== 固定页脚（不随产品滑动） ===== -->
    <div class="footer-overlay">
      <div class="footer-info">
        <h2>{{ currentProduct?.name || '' }}</h2>
        <p class="price">{{ currentProduct?.price || '' }}</p>
        <button 
          class="add-to-cart" 
          @click="addToCart(currentProduct)"
          :disabled="addingToCart || !currentProduct"
        >
          {{ addingToCart ? '添加中...' : '加入购物车' }}
        </button>
      </div>
    </div>
    
    <div v-if="loading && products.length > 0" class="loading-more">
      加载更多...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

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

// ========== 当前产品 ==========
const currentProduct = computed(() => {
  return products.value[currentIndex.value] || null;
});

// ========== 获取产品图片 ==========
const getProductImages = (product) => {
  if (!product) return [];
  // 优先使用画廊图片（多张）
  if (product.galleryImages?.nodes && product.galleryImages.nodes.length > 0) {
    return product.galleryImages.nodes;
  }
  // 其次使用主图
  if (product.image) {
    return [product.image];
  }
  return [];
};

// ========== 添加到购物车 ==========
const addToCart = async (product) => {
  if (!product || addingToCart.value) return;
  addingToCart.value = true;
  
  try {
    const productId = product.databaseId || product.id;
    await $fetch('/api/cart/add', {
      method: 'POST',
      body: { productId, quantity: 1 }
    });
    console.log('已添加到购物车');
  } catch (err) {
    console.error('添加到购物车失败:', err);
  } finally {
    addingToCart.value = false;
  }
};

// ========== 加载产品数据 ==========
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
    
    // 调用独立的滑动产品 API
    const data = await $fetch(`/api/swipe-products?${query.toString()}`);
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

// ========== 图片导航 ==========
const nextImage = () => {
  const product = currentProduct.value;
  const images = getProductImages(product);
  if (imageIndex.value < images.length - 1) {
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

// ========== 图片水平滑动 ==========
let imageTouchStartX = 0;
let imageTouchStartY = 0;
let isImageSwiping = false;
let imageSwipeDirection = null;

const onImageTouchStart = (e) => {
  e.stopPropagation();
  const touch = e.touches[0];
  imageTouchStartX = touch.clientX;
  imageTouchStartY = touch.clientY;
  isImageSwiping = true;
  imageSwipeDirection = null;
};

const onImageTouchMove = (e) => {
  e.stopPropagation();
  if (!isImageSwiping) return;
  
  const touch = e.touches[0];
  const deltaX = imageTouchStartX - touch.clientX;
  const deltaY = imageTouchStartY - touch.clientY;
  
  if (imageSwipeDirection === null) {
    if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15) {
      imageSwipeDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    } else {
      return;
    }
  }
  
  if (imageSwipeDirection === 'vertical') {
    if (deltaY > 30 && currentIndex.value < products.value.length - 1) {
      currentIndex.value++;
      imageIndex.value = 0;
      isImageSwiping = false;
    } else if (deltaY < -30 && currentIndex.value > 0) {
      currentIndex.value--;
      imageIndex.value = 0;
      isImageSwiping = false;
    }
    checkPreload();
    return;
  }
  
  const images = getProductImages(currentProduct.value);
  if (!currentProduct.value || images.length === 0) return;
  
  if (deltaX > 30 && imageIndex.value < images.length - 1) {
    imageIndex.value++;
    isImageSwiping = false;
  } else if (deltaX < -30 && imageIndex.value > 0) {
    imageIndex.value--;
    isImageSwiping = false;
  }
};

const onImageTouchEnd = (e) => {
  e.stopPropagation();
  isImageSwiping = false;
  imageSwipeDirection = null;
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

// ========== 鼠标滚轮 ==========
const onWheel = (e) => {
  e.preventDefault();
  if (e.deltaY > 0 && currentIndex.value < products.value.length - 1) {
    currentIndex.value++;
    imageIndex.value = 0;
  } else if (e.deltaY < 0 && currentIndex.value > 0) {
    currentIndex.value--;
    imageIndex.value = 0;
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
  background: #000;
}

.product-image-carousel {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #000;
  touch-action: pan-y;
  width: 100%;
  height: 100%;
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
  background: #000;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* ===== 图片指示器 ===== */
.image-dots {
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(0,0,0,0.3);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  z-index: 5;
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

/* ===== 左右箭头 ===== */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.3);
  color: #fff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 28px;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s;
  display: none;
  backdrop-filter: blur(4px);
}

.arrow:hover {
  background: rgba(0,0,0,0.6);
}

.arrow-left {
  left: 12px;
}
.arrow-right {
  right: 12px;
}

@media (hover: hover) {
  .arrow {
    display: block;
  }
}

/* ===== 固定底部信息层 ===== */
.footer-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px 24px 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  pointer-events: none;
  z-index: 20;
}

.footer-overlay * {
  pointer-events: auto;
}

.footer-info {
  max-width: 500px;
  margin: 0 auto;
}

.footer-info h2 {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.footer-info .price {
  font-size: 26px;
  font-weight: bold;
  color: #ffd700;
  margin: 0 0 16px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.add-to-cart {
  width: 100%;
  max-width: 300px;
  padding: 16px;
  background: #b7903c;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  letter-spacing: 1px;
}

.add-to-cart:hover {
  background: #a07f30;
  transform: scale(1.02);
}

.add-to-cart:active {
  transform: scale(0.97);
}

.add-to-cart:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
