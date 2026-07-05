<!--app/components/ButtonSortBy.vue-->
<script setup>
const router = useRouter();
const route = useRoute();

const selectedSort = ref(
  !route.query.orderby && !route.query.fieldby ? 'Newest' : route.query.orderby === 'DESC' && route.query.fieldby === 'PRICE' ? 'Price: High to Low' : 'Price: Low to High'
);

const options = reactive([
  { value: 'Newest', label: $t('filter.newest') },
  { value: 'Price: High to Low', label: $t('filter.price_high_low') },
  { value: 'Price: Low to High', label: $t('filter.price_low_high') },
]);

const setSort = value => {
  selectedSort.value = value;
  const query = { ...route.query };

  switch (value) {
    case 'Newest':
      delete query.orderby;
      delete query.fieldby;
      break;
    case 'Price: High to Low':
      query.orderby = 'DESC';
      query.fieldby = 'PRICE';
      break;
    case 'Price: Low to High':
      query.orderby = 'ASC';
      query.fieldby = 'PRICE';
      break;
  }
  router.push({ query });
};

const isDropdownVisible = ref(false);
const dropdownRef = ref(null);

onClickOutside(dropdownRef, event => (isDropdownVisible.value = false));
</script>

