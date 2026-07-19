    <script setup lang="ts">
import { ref, computed } from 'vue'

// 1. 安全引入你的全局逻辑（加个 input 保护，防止报错阻塞页面）
let addToCart = (id: any, qty: number) => { console.log('加购', id) }
let isInWishlist = (id: any) => false
let addToWishlist = (p: any) => {}
let removeFromWishlist = (id: any) => {}

try {
  const cart = useCart()
  if (cart && cart.addToCart) addToCart = cart.addToCart
  
  // 如果你的项目收藏夹叫 useFavorites，请解开下面这行并注释掉 useWishlist
  // const wishlist = useFavorites()
  const wishlist = useWishlist()
  if (wishlist) {
    isInWishlist = wishlist.isInWishlist || isInWishlist
    addToWishlist = wishlist.addToWishlist || addToWishlist
    removeFromWishlist = wishlist.removeFromWishlist || removeFromWishlist
  }
} catch (e) {
  console.warn('项目 Composable 载入跳过，不影响列表渲染:', e)
}

// 2. 状态定义
const activeIndex = ref(0)
const afterCursor = ref<string | null>(null)
const products = ref<any[]>([])

// 3. 改用 Nuxt 4 官方首选的 useFetch 响应式抓取
const { data, pending, error } = await useFetch('/api/products', {
  query: {
    first: 6,
    after: afterCursor
  },
  // 阻止重复的无谓序列化
  lazy: true
})

// 监听 useFetch 的数据返回并追加到列表
watch(data, (newData) => {
  if (newData?.products) {
    // 过滤掉重复数据，防止 key 冲突
    const newItems = newData.products.filter(
      (item: any) => !products.value.some((p) => p.id === item.id)
    )
    products.value = [...products.value, ...newItems]
  }
}, { immediate: true })

// 4. 滚动监听与无限加载
function onScroll(event: Event) {
  const target = event.target as HTMLElement
  const currentItemIndex = Math.round(target.scrollTop / window.innerHeight)
  
  if (currentItemIndex !== activeIndex.value) {
    activeIndex.value = currentItemIndex
    
    // 快到底时自动更新游标，触发 useFetch 的响应式依赖重新拉取
    if (currentItemIndex >= products.value.length - 2 && data.value?.pageInfo?.hasNextPage) {
      afterCursor.value = data.value.pageInfo.endCursor
    }
  }
}
</script>








  <template>
  <!-- 全屏沉浸式容器：隐藏滚动条，开启 CSS 吸附 -->
  <div 
    class="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black text-white no-scrollbar select-none"
    @scroll="onScroll"
  >
    <!-- 返回按钮，方便用户退出 Feed -->
    <NuxtLink to="/" class="absolute top-6 left-6 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white">
      <UIcon name="i-heroicons-arrow-left" class="w-6 h-6" />
    </NuxtLink>

    <!-- 商品单页循环 -->
    <div 
      v-for="(product, index) in products" 
      :key="product.id" 
      class="w-full h-screen snap-start relative flex items-center justify-center overflow-hidden"
    >
      <!-- 背景主视觉：可以是全屏大图（先用项目已有的图片充当视频） -->
      <div class="absolute inset-0 w-full h-full bg-gray-950 flex items-center justify-center">
        <!-- 性能优化：只有在当前屏、上一屏、下一屏的图片才真正渲染，其余懒加载 -->
        <img 
          v-if="Math.abs(index - activeIndex) <= 1 && product.image?.sourceUrl"
          :src="product.image.sourceUrl" 
          :alt="product.name" 
          class="w-full h-full object-cover opacity-90"
        />
        <!-- 蒙层：让底部文字看得更清楚 -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      <!-- 右侧互动工具栏（浮动在图像之上） -->
      <div class="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
        <!-- 品牌/商家头像（这里可以放个占位，或者取你的供应商数据） -->
        <div class="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg bg-gray-800 flex items-center justify-center">
          <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6 text-primary" />
        </div>

        <!-- 收藏/红心按钮（联动你项目的收藏状态） -->
        <button 
          @click="isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)"
          class="flex flex-col items-center group"
        >
          <div class="p-3 bg-black/40 backdrop-blur-md rounded-full transition-transform active:scale-95">
            <UIcon 
              :name="isInWishlist(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" 
              class="w-7 h-7 transition-colors"
              :class="isInWishlist(product.id) ? 'text-red-500' : 'text-white'"
            />
          </div>
          <span class="text-xs mt-1 text-gray-300">收藏</span>
        </button>

        <!-- 分享按钮 -->
        <button class="flex flex-col items-center">
          <div class="p-3 bg-black/40 backdrop-blur-md rounded-full active:scale-95">
            <UIcon name="i-heroicons-share" class="w-7 h-7 text-white" />
          </div>
          <span class="text-xs mt-1 text-gray-300">分享</span>
        </button>
      </div>

      <!-- 底部商品信息与购买操作区 -->
      <div class="absolute left-4 bottom-6 right-20 z-20 max-w-lg">
        <!-- 商品标题与价格 -->
        <h2 class="text-xl font-bold line-clamp-2 drop-shadow-md mb-1">{{ product.name }}</h2>
        <div class="text-2xl font-black text-primary drop-shadow-md mb-3">
          {{ product.price || '免费' }}
        </div>
        
        <!-- 商品简介 -->
        <p class="text-sm text-gray-300 line-clamp-2 mb-4 drop-shadow-sm">
          {{ product.description || '探索这款精心挑选的独家好物，点击下方直接抢购。' }}
        </p>

        <!-- 抖音精髓：超大“一键加购/结账”按钮 -->
        <div class="flex gap-2">
          <UButton 
            size="xl" 
            block 
            color="primary" 
            class="font-bold tracking-wide rounded-xl shadow-lg shadow-primary/20"
            @click="addToCart(product.databaseId || product.id, 1)"
          >
            <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 mr-2" />
            加入购物车
          </UButton>
          
          <NuxtLink :to="`/product/${product.slug}`" class="block">
            <UButton size="xl" variant="soft" color="white" class="rounded-xl">
              详情
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 首屏全局全屏加载状态 -->
    <div v-if="products.length === 0 && isLoading" class="w-full h-screen flex flex-col items-center justify-center bg-black">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-10 w-10 text-primary mb-4" />
      <p class="text-gray-400 text-sm">正在为您生成专属好物推荐...</p>
    </div>
  </div>
</template>

<style scoped>
/* 隐藏滚动条但保留滚动能力 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
