import { push } from 'notivue';

const CART_STORAGE_KEY = 'cart';

export const useCart = () => {
  const cart = useState<CartItem[]>('cart', () => []);
  const addToCartButtonStatus = ref<AddBtnStatus>('add');

  const persistCart = () => {
    if (!process.client) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.value));
  };

  const setCart = (items: CartItem[]) => {
    cart.value = items;
    persistCart();
  };

  const findItem = (variationId: number) => {
    return cart.value.find(item => item.variation?.node?.databaseId === variationId);
  };

  const handleAddToCart = async (productId: number) => {
    addToCartButtonStatus.value = 'loading';

    try {
      const response = await $fetch<AddToCartResponse>('/api/cart/add', {
        method: 'POST',
        body: { productId },
      });

      const incoming = response?.addToCart?.cartItem;
      if (!incoming) {
        throw new Error('未获取到有效的购物车商品响应');
      }

      const itemIndex = cart.value.findIndex(item => item.key === incoming.key);

      if (itemIndex >= 0) {
        const next = [...cart.value];
        next[itemIndex] = incoming;
        setCart(next);
      } else {
        setCart([...cart.value, incoming]);
      }

      addToCartButtonStatus.value = 'added';
      setTimeout(() => {
        addToCartButtonStatus.value = 'add';
      }, 2000);
    } catch (error: any) {
      addToCartButtonStatus.value = 'add';
      
      // 1. 打印真实错误日志，方便在 Console 中调试
      console.error('[Add To Cart Error]:', error);

      // 2. 解析真实的错误信息，不要把网络/跨域/Cookie错误误判为“库存不足”
      const serverMessage = error?.data?.message || error?.message || '';
      
      if (serverMessage.toLowerCase().includes('stock')) {
        push.error('库存不足');
      } else if (serverMessage) {
        // 弹出真实的接口或网络错误提示，方便一眼看出根因
        push.error(`添加失败: ${serverMessage}`);
      } else {
        push.error('网络请求异常，请稍后重试');
      }
    }
  };

  const changeQuantity = (key: string, quantity: number) => {
    const next =
      quantity <= 0
        ? cart.value.filter(item => item.key !== key)
        : cart.value.map(item => (item.key === key ? { ...item, quantity } : item));

    setCart(next);
    
    // 发送更新逻辑，增加错误捕获避免静默失败
    void $fetch('/api/cart/update', {
      method: 'POST',
      body: { items: [{ key, quantity }] },
    }).catch(err => {
      console.error('[Update Cart Error]:', err);
    });
  };

  const increment = (variationId: number) => {
    const item = findItem(variationId);

    if (!item) {
      void handleAddToCart(variationId);
      return;
    }

    // 防护 1：强转数字，防止 localStorage 恢复出的 stockQuantity 是字符串类型
    const rawStock = item.variation?.node?.stockQuantity;
    const maxStock = typeof rawStock === 'number' ? rawStock : Number(rawStock);

    // 防护 2：只有在 maxStock 是合法的正整数时，才拦截数量
    if (!isNaN(maxStock) && maxStock > 0 && item.quantity >= maxStock) {
      push.error('库存不足');
      return;
    }

    changeQuantity(item.key, item.quantity + 1);
  };

  const decrement = (variationId: number) => {
    const item = findItem(variationId);
    if (!item) return;
    changeQuantity(item.key, item.quantity - 1);
  };

  onMounted(() => {
    if (!process.client) return;
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error('[Cart LocalStorage Parse Error]:', e);
      setCart([]);
    }
  });

  return {
    cart,
    addToCartButtonStatus,
    handleAddToCart,
    increment,
    decrement,
  };
};
