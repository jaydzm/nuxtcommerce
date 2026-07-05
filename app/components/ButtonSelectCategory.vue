<!--app/components/ButtonSelectCategory.vue-->
<script setup>
const categoriesData = ref([]);

onMounted(async () => {
  const response = await $fetch('/api/categories');
  categoriesData.value = response.productCategories.nodes.filter(category => category.products.nodes.length && category.children.nodes.length);
});

const categories = computed(() => categoriesData.value);
</script>


