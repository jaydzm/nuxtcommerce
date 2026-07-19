<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 1. 基础状态定义
const products = ref<any[]>([])
const afterCursor = ref<string | null>(null)
const hasNextPage = ref(true)
const isLoading = ref(false)
const activeIndex = ref(0)

// 模拟收藏状态，防止项目外部引用报错卡部署
const favList = ref<string[]>([])
function toggleFav(id: string) {
  if (favList.value.includes(id)) {
    favList.value = favList.value.filter(i => i !== id)
  } else {
    favList.value.push(id)
  }
}

// 【终极核心修复】：精准狙击你 WooCommerce 站点的真实的 images[0].url 数据结构
function getProductImage(product: any) {
  if (!product) return ''
  
  // 🎯 黄金准则：读取你后端返回的 images 数组第一张图的 url 字段
  if (product.images && product.images.length > 0) {
    return product.images[0].url || product.images[0].src || ''
  }
  
  // 银色备份：兼容单数 image 对象的各种情况
  if (product.image) {
    return product.image.url || 
           product.image.mediaItemUrl || 
           product.image.sourceUrl || 
           product.image.src || 
           ''
  }
  
  return ''
}

// 2. 纯客户端异步加载，确保 Vercel 编译 100% 畅通
async function fetchFeedData(isLoadMore = false) {
  if (isLoading.value || (!hasNextPage.value && isLoadMore)) return
  isLoading.value = true

  try {
    // 自动动态获取当前域名，防止线上跨域或 SSR 路由死锁
    const { origin } = useRequestURL()
    
    const data = await $fetch(`${origin}/api/products`, {
      query: {
        first: 5,
        after: isLoadMore ? afterCursor.value : null
      }
    })

    if (data && data.products) {
      if (isLoadMore) {
        // 过滤可能重复的 key，防止 Vue 渲染爆关键 key 冲突
        const newItems = data.products.filter(
          (item: any) => !products.value.some((p) => p.id === item.id)
        )
        products.value = [...products.value, ...newItems]
      } else {
        products.value = data.products
      }
      
      afterCursor.value = data.pageInfo?.endCursor || null
      hasNextPage.value = data.pageInfo?.hasNextPage || false
    }
  } catch (error) {
    console.error('Feed 核心接口请求失败，请检查 Vercel 环境变量 GQL_HOST:', error)
  } finally {
    isLoading.value = false
  }
}

// 3. 垂直滚动监听：一滑一屏与静默预加载下一页
function onScroll(event: Event) {
  const target = event.target as HTMLElement
  const currentItemIndex = Math.round(target.scrollTop / window.innerHeight)
  
  if (currentItemIndex !== activeIndex.value) {
    activeIndex.value = currentItemIndex
    
    // 当快滑到当前列表倒数第 2 条时，悄悄在后台拉取下一页
    if (currentItemIndex >= products.value.length - 2 && hasNextPage.value) {
      fetchFeedData(true)
    }
  }
}

const router = useRouter()

// 4. 点击抢购直接打通交易闭环，引流至详情页完成下单
function handleAddToCart(product: any) {
  if (product.slug) {
    // 自动适配你项目的详情页路径，如果根路径就是详情，请改为 `/${product.slug}`
    router.push(`/product/${product.slug}`) 
  }
}
</script>

<template>
  <!-- 全屏沉浸式容器 -->
  <div 
    class="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black text-white no-scrollbar select-none fixed inset-0 z-50"
    @scroll="onScroll"
  >
    <!-- 左上角返回首页按钮 -->
    <NuxtLink to="/" class="absolute top-6 left-6 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </NuxtLink>

    <!-- 商品单页滑动循环 -->
    <div 
      v-for="(product, index) in products" 
      :key="product.id" 
      class="w-full h-screen snap-start relative flex items-center justify-center overflow-hidden"
    >
      <!-- 高级视差大图层 -->
      <div class="absolute inset-0 w-full h-full bg-gray-950 flex items-center justify-center">
        
        <!-- 视觉方案 1: 背景毛玻璃，将原图放大、模糊、调暗，用来优雅填满手机两侧黑边 -->
        <img 
          v-if="Math.abs(index - activeIndex) <= 1 && getProductImage(product)"
          :src="getProductImage(product)" 
          class="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-25 select-none pointer-events-none"
        />

        <!-- 视觉方案 2: 前景高保真原图，保持商品原本比例，限制高度，绝不变形拉伸 -->
        <img 
          v-if="Math.abs(index - activeIndex) <= 1 && getProductImage(product)"
          :src="getProductImage(product)" 
          :alt="product.name" 
          class="relative max-w-full max-h-[70vh] object-contain z-10 animate-fade-in"
        />

        <!-- 视觉方案 3: 兜底 UI -->
        <div 
          v-if="!getProductImage(product)" 
          class="text-gray-600 flex flex-col items-center gap-2 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V6.75Zm.375 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0Z" />
          </svg>
          <span class="text-xs text-gray-500">图片资源正在同步...</span>
        </div>

        <!-- 视觉方案 4: 渐变光影蒙层，保证底部复杂的白字在任何背景下都能清晰可读 -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-15" />
      </div>

      <!-- 右侧浮动交互工具栏 -->
      <div class="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
        <!-- 商户头像/标志 -->
        <div class="w-12 h-12 rounded-full border-2 border-white/80 overflow-hidden shadow-lg bg-emerald-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.5a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
          </svg>
        </div>

        <!-- 收藏（点赞）红心 -->
        <button @click="toggleFav(product.id)" class="flex flex-col items-center">
          <div class="p-3 bg-black/40 backdrop-blur-md rounded-full active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" :fill="favList.includes(product.id) ? '#ef4444' : 'none'" viewBox="0 0 24 24" stroke-width="2" :stroke="favList.includes(product.id) ? '#ef4444' : 'currentColor'" class="w-7 h-7">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <span class="text-xs mt-1 text-gray-300">收藏</span>
        </button>

        <!-- 详情气泡链接 -->
        <NuxtLink :to="`/product/${product.slug}`" class="flex flex-col items-center">
          <div class="p-3 bg-black/40 backdrop-blur-md rounded-full active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <span class="text-xs mt-1 text-gray-300">详情</span>
        </NuxtLink>
      </div>

      <!-- 底部文案信息与核心抢购动作区 -->
      <div class="absolute left-4 bottom-6 right-20 z-20 max-w-lg">
        <!-- 商品标题 -->
        <h2 class="text-xl font-bold line-clamp-2 drop-shadow-md mb-1 text-white">{{ product.name }}</h2>
        <!-- 价格 -->
        <div class="text-2xl font-black text-emerald-400 drop-shadow-md mb-4">
          {{ product.price || '￥0.00' }}
        </div>

        <!-- 购买按钮 -->
        <button 
          @click="handleAddToCart(product)"
          class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-wide rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          立即抢购
        </button>
      </div>
    </div>

    <!-- 首屏全局加载状态 -->
    <div v-if="products.length === 0 && isLoading" class="w-full h-screen flex flex-col items-center justify-center bg-black">
      <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-gray-400 text-sm tracking-wide">为您加载精选好物...</p>
    </div>

    <!-- 全局空状态兜底 -->
    <div v-if="products.length === 0 && !isLoading" class="w-full h-screen flex flex-col items-center justify-center bg-gray-950 px-6 text-center">
      <p class="text-gray-400 mb-2">暂无推荐商品</p>
      <p class="text-xs text-gray-600">请检查 Vercel 环境变量中 GQL_HOST 的状态</p>
    </div>
  </div>
</template>

<style scoped>
/* 纯 CSS 机制隐藏系统默认的多边滚动条，保持全屏完整度 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.35s ease-out forwards;
}
</style>
