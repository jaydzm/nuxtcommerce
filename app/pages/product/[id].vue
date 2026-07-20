<!--app/pages/product/[id].vue-->
<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
const { isOpenImageSliderModal } = useComponents();
const localePath = useLocalePath();

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const thumbsSwiper = ref(null);
const setThumbsSwiper = swiper => {
  thumbsSwiper.value = swiper;
};

const modules = [Navigation, Pagination, Thumbs];

const route = useRoute();
const id = computed(() => route.params.id);

// 提取 slug (兼顾带 SKU 和不带 SKU 的 URL 结构)
const slug = computed(() => {
  if (!id.value) return '';
  const parts = id.value.split('-');
  if (parts.length > 1) {
    parts.pop(); // 移除最后的 SKU 尾缀
    return parts.join('-');
  }
  return id.value;
});

const productResult = ref({});

// 监听 slug 自动获取商品数据
watch(
  slug,
  async (newSlug) => {
    if (!newSlug) return;
    try {
      const data = await $fetch('/api/product', { query: { slug: newSlug } });
      productResult.value = data?.product || {};
    } catch (e) {
      console.error('[Fetch Product Error]:', e);
    }
  },
  { immediate: true }
);

const product = computed(() => productResult.value);

// 主图安全提取（多层回退保护）
const mainImageUrl = computed(() => {
  return (
    product.value?.image?.sourceUrl ||
    product.value?.galleryImages?.nodes?.[0]?.sourceUrl ||
    '/placeholder.png'
  );
});

// 相册图安全提取
const galleryImagesList = computed(() => {
  return product.value?.galleryImages?.nodes || [];
});

const { handleAddToCart, addToCartButtonStatus } = useCart();
</script>

<template>
  <ProductSeo v-if="product?.name" :info="product" />
  <ProductSkeleton v-if="!product.name" />
  <div v-else class="justify-center flex flex-col lg:flex-row lg:mx-5">
    <ButtonBack />
    <!-- 缩略图侧边栏（大屏） -->
    <div class="mr-6 mt-5 pt-2.5 max-xl:hidden">
      <swiper :modules="modules" @swiper="setThumbsSwiper" class="product-images-thumbs w-14">
        <swiper-slide class="cursor-pointer rounded-xl overflow-hidden border-2 border-white dark:border-black">
          <NuxtImg
            :alt="product.name"
            class="h-full w-full border-2 border-white bg-neutral-200 dark:bg-neutral-800 dark:border-black rounded-[10px] object-cover"
            :src="mainImageUrl" />
        </swiper-slide>
        <swiper-slide 
          class="cursor-pointer rounded-xl overflow-hidden border-2 border-white dark:border-black" 
          v-for="(node, i) in galleryImagesList" 
          :key="i">
          <NuxtImg 
            :alt="product.name" 
            class="h-full w-full border-2 border-white bg-neutral-200 dark:bg-neutral-800 dark:border-black rounded-[10px] object-cover" 
            :src="node.sourceUrl || '/placeholder.png'" />
        </swiper-slide>
      </swiper>
    </div>

    <!-- 主轮播图区域 -->
    <div
      class="flex lg:p-5 lg:gap-5 flex-col lg:flex-row lg:border lg:border-transparent lg:dark:border-[#262626] lg:rounded-[32px] lg:shadow-[0_1px_20px_rgba(0,0,0,.15)] lg:mt-2.5 select-none">
      <div class="relative">
        <swiper
          :style="{
            '--swiper-navigation-color': '#000',
            '--swiper-pagination-color': 'rgb(0 0 0 / 50%)',
          }"
          :spaceBetween="4"
          :slidesPerView="1.5"
          :pagination="{
            dynamicBullets: true,
          }"
          :navigation="true"
          :modules="modules"
          :thumbs="{ swiper: thumbsSwiper }"
          class="lg:w-[530px] lg:h-[530px] xl:w-[600px] xl:h-[600px] lg:rounded-2xl">
          <swiper-slide @click="isOpenImageSliderModal = true">
            <NuxtImg :alt="product.name" class="h-full w-full bg-neutral-200 dark:bg-neutral-800 object-cover" :src="mainImageUrl" />
          </swiper-slide>
          <swiper-slide 
            @click="isOpenImageSliderModal = true" 
            v-for="(node, i) in galleryImagesList" 
            :key="i">
            <NuxtImg :alt="product.name" class="h-full w-full bg-neutral-200 dark:bg-neutral-800 object-cover" :src="node.sourceUrl || '/placeholder.png'" />
          </swiper-slide>
        </swiper>
      </div>

      <ImageSliderWithModal :product="product" v-model="isOpenImageSliderModal" />

      <!-- 商品基本信息 -->
      <div class="w-full lg:max-w-[28rem]">
        <div class="flex-col flex gap-4 lg:max-h-[530px] xl:max-h-[600px] overflow-hidden">
          <div class="p-3 lg:pb-4 lg:p-0 border-b border-[#efefef] dark:border-[#262626]">
            <h1 class="text-2xl font-semibold mb-1">{{ product.name }}</h1>
            <ProductPrice :sale-price="product.salePrice" :regular-price="product.regularPrice" />
          </div>

          <div class="pb-4 px-3 lg:px-0 border-b border-[#efefef] dark:border-[#262626]">
            <div class="flex">
              <!-- 加购按钮：直接使用主商品 databaseId -->
              <button
                @click="product.databaseId && handleAddToCart(product.databaseId)"
                :disabled="addToCartButtonStatus !== 'add' || !product.databaseId"
                class="button-bezel w-full h-12 rounded-md relative tracking-wide font-semibold text-white text-sm flex justify-center items-center">
                <Transition name="slide-up">
                  <div v-if="addToCartButtonStatus === 'add'" class="absolute">{{ $t('cart.add_to_cart') }}</div>
                  <UIcon v-else-if="addToCartButtonStatus === 'loading'" class="absolute" name="i-svg-spinners-90-ring-with-bg" size="22" />
                  <div v-else-if="addToCartButtonStatus === 'added'" class="absolute">{{ $t('cart.added_to_cart') }}!</div>
                </Transition>
              </button>
              <ButtonWishlist :product="product" />
            </div>
          </div>
          <div class="px-3 lg:px-0">
            <div class="text-base mb-2 font-semibold">{{ $t('product.featured_information') }}</div>
            <div class="description leading-7 text-sm">
              <ul>
                <li>
                  {{ $t('product.free_return') }}
                  <a class="underline" href="#">{{ $t('product.information') }}</a>
                </li>
                
                <div v-html="product.description"></div>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-12 px-3">
    <h2 class="text-xl font-semibold mb-6">您可能还喜欢</h2>
    <ProductList :categorySlug="product?.categories?.nodes?.[0]?.slug || ''" />
  </div>
</template>

<style lang="postcss">
.product-images-thumbs .swiper-wrapper {
  @apply flex-col gap-3;
}
.product-images-thumbs .swiper-slide-thumb-active {
  @apply border-black dark:border-white;
}
.swiper-button-next,
.swiper-button-prev {
  @apply bg-white/50 hover:bg-white p-3.5 m-2 rounded-full flex items-center justify-center shadow transition backdrop-blur-sm;
}

.swiper-button-prev.swiper-button-disabled,
.swiper-button-next.swiper-button-disabled {
  @apply hidden;
}

.swiper-pagination {
  @apply bg-white/50 shadow-sm rounded-full py-1 backdrop-blur-sm;
}

.disabled {
  @apply opacity-40 cursor-default;
}

.button-bezel {
  box-shadow: 0 0 0 var(--button-outline, 0px) rgba(7, 193, 96, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
    0 1px 2px 0 rgba(0, 0, 0, 0.5);
  @apply outline-none tracking-[-0.125px] transition scale-[var(--button-scale,1)] duration-200;
  background-color: #07c160; 
  
  &:hover {
    background-color: #06ad56;
  }
  &:active {
    --button-outline: 4px;
    --button-scale: 0.975;
  }
}

.description ul li {
  background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxlbGxpcHNlIHJ5PSIzIiByeD0iMyIgY3k9IjMiIGN4PSIzIiBmaWxsPSIjYzljOWM5Ii8+PC9zdmc+)
    no-repeat 0 0.7rem;
  padding-left: 0.938rem;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease 0s, opacity 0.3s ease 0s;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0);
}
</style>
