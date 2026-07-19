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
    
    <div
      v-for="(product, index) in products"
      :key="product.id"
      class="product-card"
      :style="{ transform: `translateY(${(index - currentIndex) * 100}vh)` }"
    >
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
            v-for="(image, imgIdx) in getProductImages(product)" 
            :key="imgIdx"
            class="image-slide"
          >
            <img 
              :src="image.sourceUrl || image.src" 
              :alt="product.name" 
              loading="lazy"
            />
          </div>
        </div>
        
        <div v-if="getProductImages(product).length > 1" class="image-dots">
          <span 
            v-for="(_, idx) in getProductImages(product)" 
            :key="idx"
            class="dot"
            :class="{ active: idx === imageIndex }"
          ></span>
        </div>
        
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
const imageIndex = ref(0);
const loading = ref(false);
const hasMore = ref(true);
const after = ref(null);
const addingToCart = ref(false);

const getProductImages = (product) => {
  if (product.galleryImages?.nodes && product.galleryImages.nodes.length > 0) {
    return product.galleryImages.nodes;
  }
  if (product.image) {
    return [product.image];
  }
  return [];
};

const addToCart = async (product) => {
  if (addingToCart.value) return;
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

const nextImage = () => {
  const currentProduct = products.value[currentIndex.value];
  const images = getProductImages(currentProduct);
  if (imageIndex.value < images.length - 1) {
    imageIndex.value++;
  }
};

const prevImage = () => {
  if (imageIndex.value > 0) {
    imageIndex.value--;
  }
};

const checkPreload = () => {
  if (currentIndex.value > products.value.length - 3 && hasMore.value && !loading.value) {
    fetchProducts();
  }
};

// ========== 垂直滑动（产品切换） ==========
let touchStartY = 0;
let isSwiping = false;

const onTouchStart = (e) => {
  const target = e.target.closest('.product-image-carousel');
  if (target) return;
  
  touchStartY = e.touches[0].clientY;
  isSwiping = true;
};

const onTouchMove = (e) => {
  const target = e.target.closest('.product-image-carousel');
  if (target) return;
  
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

// ========== 图片水平滑动（修复版） ==========
let imageTouchStartX = 0;
let imageTouchStartY = 0;
let isImageSwiping = false;

const onImageTouchStart = (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const touch = e.touches[0];
  imageTouchStartX = touch.clientX;
  imageTouchStartY = touch.clientY;
  isImageSwiping = true;
};

const onImageTouchMove = (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!isImageSwiping) return;
  
  const touch = e.touches[0];
  const deltaX = imageTouchStartX - touch.clientX;
  const deltaY = imageTouchStartY - touch.clientY;
  
  if (Math.abs(deltaX) < 30 || Math.abs(deltaX) < Math.abs(deltaY)) {
    return;
  }
  
  const currentProduct = products.value[currentIndex.value];
  const images = getProductImages(currentProduct);
  if (!currentProduct || images.length === 0) return;
  
  if (deltaX > 30 && imageIndex.value < images.length - 1) {
    imageIndex.value++;
    isImageSwiping = false;
  } else if (deltaX < -30 && imageIndex.value > 0) {
    imageIndex.value--;
    isImageSwiping = false;
  }
};

const onImageTouchEnd = (e) => {
  e.preventDefault();
  e.stopPropagation();
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

.product-image-carousel {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  touch-action: none;
}

.image-track {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
  touch-action: none;
}

.image-slide {
  min-width: 100%;
  height: 100%;
  touch-action: none;
}

.image-slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f5f5f5;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

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

@media (hover: hover) {
  .arrow {
    display: block;
  }
}

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

.loading-state, .loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #999;
  font-size: 16px;
}
</style>
