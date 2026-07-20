<!--app/components/ProductCard.vue-->
<script setup>
const localePath = useLocalePath();

defineProps({
  products: Object,
});

// 获取商品的第二张图（画廊第一张），如果没有则回退到主图
const getHoverImage = (product) => {
  return product?.galleryImages?.nodes?.[0]?.sourceUrl || product?.image?.sourceUrl;
};

// 获取商品主图，如果没有则回退到画廊第一张
const getMainImage = (product) => {
  return product?.image?.sourceUrl || product?.galleryImages?.nodes?.[0]?.sourceUrl;
};

// 安全获取 SKU 辅助参数
const getSkuParam = (sku) => {
  if (!sku) return '';
  return sku.split('-')[0] || '';
};
</script>

<template>
  <article v-for="product in products" :key="product.databaseId || product.slug">
    <NuxtLink 
      :to="localePath(`/product/${product.slug}${getSkuParam(product.sku) ? '-' + getSkuParam(product.sku) : ''}`)" 
      class="group select-none">
      <div class="cursor-pointer transition ease-[ease] duration-300">
        <div class="relative pb-[133%] dark:shadow-[0_8px_24px_rgba(0,0,0,.5)] rounded-2xl overflow-hidden">
          <!-- 悬停时显示的图片（画廊首图，无画廊则回退到主图） -->
          <NuxtImg
            v-if="getHoverImage(product)"
            :alt="product.name"
            loading="lazy"
            :title="product.name"
            :src="getHoverImage(product)"
            class="absolute h-full w-full dark:bg-neutral-800 bg-neutral-200 object-cover" />
            
          <!-- 默认显示的主图（悬停时透明度变 0 露出底层图片） -->
          <NuxtImg
            v-if="getMainImage(product)"
            :alt="product.name"
            loading="lazy"
            :title="product.name"
            :src="getMainImage(product)"
            class="absolute h-full w-full dark:bg-neutral-800 bg-neutral-200 object-cover transition-opacity duration-300 group-hover:opacity-0" />
        </div>
        <div class="grid gap-0.5 pt-3 pb-4 px-1.5 text-sm font-semibold">
          <ProductPrice :sale-price="product.salePrice" :regular-price="product.regularPrice" variant="card" />
          <div>{{ product.name }}</div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
