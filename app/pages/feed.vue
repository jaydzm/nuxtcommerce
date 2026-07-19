<script setup lang="ts">
import { ref, onMounted, useRouter } from 'vue'

const router = useRouter()
// 商品数组，内置测试数据，可直接看到页面效果
const products = ref([
  {
    id: 1,
    name: "原生态古树普洱生茶",
    price: "368",
    slug: "gushu-puer",
    images: [{ src: "https://img0.baidu.com/it/u=3215612237,2647934211&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=800" }]
  },
  {
    id: 2,
    name: "春料勐库大叶种茶叶",
    price: "298",
    slug: "mengku-tea",
    images: [{ src: "https://img2.baidu.com/it/u=1996428722,3663912147&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=800" }]
  }
])
const activeIndex = ref(0)
const favList = ref<string[]>([])

// 收藏功能
const toggleFav = (id: string) => {
  favList.value.includes(id)
    ? favList.value = favList.value.filter(item => item !== id)
    : favList.value.push(id)
}

// 图片地址解析
const getProductImage = (item: any) => {
  if (!item) return ""
  if (item.images?.length) return item.images[0].src
  if (item.image) return item.image.src
  return ""
}

// 滚动切换索引
const onScrollHandle = (e: Event) => {
  const scrollDom = e.target as HTMLElement
  const index = Math.round(scrollDom.scrollTop / window.innerHeight)
  activeIndex.value = index
}

// 跳转详情页
const goDetail = (product: any) => {
  if (product.slug) router.push(`/product/${product.slug}`)
}

// 如需对接后端，把这里替换接口逻辑即可
onMounted(() => {
  // fetchFeedData()
})
</script>

<template>
<div class="page-wrap h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar fixed inset-0" @scroll="onScrollHandle">
  <!-- 返回首页按钮 -->
  <NuxtLink to="/" class="back-btn absolute top-6 left-6 z-50 p-2 bg-black/50 rounded-full">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  </NuxtLink>

  <!-- 商品单屏卡片 -->
  <div v-for="(product, idx) in products" :key="product.id" class="single-item w-full h-screen snap-start relative flex items-center justify-center">
    <div class="img-layer absolute inset-0 bg-gray-950">
      <!-- 虚化背景图 -->
      <img v-if="getProductImage(product)" :src="getProductImage(product)" loading="lazy"
           class="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-25 pointer-events-none">
      <!-- 展示主图 -->
      <img v-if="getProductImage(product)" :src="getProductImage(product)" :alt="product.name" loading="lazy"
           class="main-img relative max-w-full max-h-[70vh] object-contain animate-fade-in z-10">
      <!-- 无图占位 -->
      <div v-else class="empty-box flex flex-col items-center justify-center h-full text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V6.75Zm.375 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0Z" />
        </svg>
        <span class="mt-2">暂无产品图片</span>
      </div>
      <!-- 渐变遮罩 -->
      <div class="mask absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
    </div>

    <!-- 右侧操作按钮 -->
    <div class="right-bar absolute right-4 bottom-32 flex flex-col gap-6 items-center z-20">
      <div class="avatar w-12 h-12 rounded-full border-2 border-white/80 bg-emerald-600 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.5a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
        </svg>
      </div>
      <button @click="toggleFav(String(product.id))" class="btn-fav flex flex-col items-center">
        <div class="p-3 rounded-full bg-black/40 backdrop-blur active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" :fill="favList.includes(String(product.id)) ? '#ef4444' : 'none'" viewBox="0 0 24 24" stroke-width="2" :stroke="favList.includes(String(product.id)) ? '#ef4444' : '#fff'" class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <span class="text-xs mt-1 text-gray-300">收藏</span>
      </button>
      <NuxtLink :to="`/product/${product.slug}`" class="flex flex-col items-center">
        <div class="p-3 rounded-full bg-black/40 backdrop-blur active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <span class="text-xs mt-1 text-gray-300">详情</span>
      </NuxtLink>
    </div>

    <!-- 底部商品信息 -->
    <div class="info-box absolute left-4 bottom-6 right-20 z-20">
      <h2 class="text-xl font-bold text-white line-clamp-2">{{ product.name }}</h2>
      <p class="text-2xl font-black text-emerald-400 my-3">￥{{ product.price }}</p>
      <button @click="goDetail(product)" class="buy-btn w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold flex justify-center items-center gap-2 active:scale-[0.99]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        立即抢购
      </button>
    </div>
  </div>
</div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.35s ease forwards;
}
</style>
