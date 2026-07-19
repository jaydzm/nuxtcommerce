<template>
  <div class="feed-wrap h-screen overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar" @scroll="handleScroll">
    <NuxtLink to="/" class="fixed top-6 left-6 z-50 p-2 bg-black/50 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#fff" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </NuxtLink>

    <div v-for="item in goodsList" :key="item.id" class="feed-item h-screen w-full snap-start relative flex items-center justify-center">
      <div class="absolute inset-0">
        <img v-if="getImg(item)" :src="getImg(item)" loading="lazy" class="w-full h-full object-cover scale-125 blur-2xl opacity-25 pointer-events-none">
        <img v-if="getImg(item)" :src="getImg(item)" :alt="item.name" loading="lazy" class="relative z-10 max-h-[70vh] max-w-full object-contain">
        <div v-else class="text-gray-400">暂无产品图片</div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
      </div>

      <div class="fixed right-4 bottom-36 flex flex-col gap-6 items-center z-20">
        <div class="w-12 h-12 rounded-full border-2 border-white/80 bg-emerald-600"></div>
        <button @click="toggleCollect(String(item.id))" class="flex flex-col items-center">
          <div class="p-3 rounded-full bg-black/40 backdrop-blur">
            <svg xmlns="http://www.w3.org/2000/svg" :fill="collectList.includes(String(item.id)) ? '#ef4444' : 'none'" viewBox="0 0 24 24" stroke-width="2" :stroke="collectList.includes(String(item.id)) ? '#ef4444' : '#ffffff'" class="w-7 h-7">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <span class="text-xs mt-1 text-gray-300">收藏</span>
        </button>
        <span class="text-white text-sm">商品卡片</span>
      </div>

      <div class="absolute left-4 right-20 bottom-6 z-20">
        <h2 class="text-xl font-bold text-white">{{ item.name }}</h2>
        <p class="text-2xl font-bold text-emerald-400 my-2">¥{{ item.price }}</p>
        <div class="w-full py-3.5 rounded-xl bg-emerald-500 text-center font-bold text-white">咨询选购</div>
      </div>
    </div>
    <div v-if="loading" class="py-6 text-center text-white">正在加载更多茶叶...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const collectList = ref<string[]>([])
const goodsList = ref<any[]>([])
const loading = ref(false)
const page = ref(0)

const getImg = (row: any) => {
  if (!row) return ''
  return row.images?.length ? row.images[0].src : ''
}

const toggleCollect = (id: string) => {
  const idx = collectList.value.indexOf(id)
  idx > -1 ? collectList.value.splice(idx, 1) : collectList.value.push(id)
}

const handleScroll = (e: Event) => {
  const dom = e.target as HTMLElement
  const reachBottom = dom.scrollTop + dom.clientHeight >= dom.scrollHeight - 150
  if (reachBottom && !loading.value) loadMore()
}

const loadMore = async () => {
  loading.value = true
  page.value++
  try {
    const apiRes = await $fetch('/api/getfeedproducts', { query: { page: page.value } })
    goodsList.value.push(...apiRes.list)
  } catch (e) {
    console.log('数据获取失败', e)
  }
  loading.value = false
}

onMounted(() => loadMore())
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
