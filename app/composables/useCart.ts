import { push } from 'notivue';

const CART_STORAGE_KEY = 'cart';

// 单一商品架构下的 CartItem 接口定义
export interface SimpleCartItem {
  key: string;
  quantity: number;
  product: {
    node: {
      databaseId: number;
      name: string;
      image?: {
        sourceUrl: string;
      };
      regularPrice?: string;
      salePrice?: string;
      stockQuantity?: number;
    };
  };
}

export interface AddToCartResponse {
  addToCart?: {
    cartItem?: SimpleCartItem;
  };
}

export type AddBtnStatus = 'add' | 'loading' | 'added';

export const useCart = () => {
  const cart = useState<SimpleCartItem[]>('cart', () => []);
  const addToCartButtonStatus = ref<AddBtnStatus>('add');

  const persistCart = () => {
    if (!process.client) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.value));
  };

  const setCart = (items: SimpleCartItem[]) => {
    cart.value = items;
    persistCart();
  };

  // 统一改为通过主商品的 databaseId (productId) 查找
  const findItem = (productId: number) => {
    return cart.value.find(item => item.product?.node?.databaseId === productId);
  };

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    const numId = Number(productId);
    if (!numId || isNaN(numId)) {
      push.error('Invalid Product ID');
      return;
    }

    addToCartButtonStatus.value = 'loading';

    try {
      const response = await $fetch<AddToCartResponse>('/api/cart/add', {
        method: 'POST',
        body: { productId: numId, quantity },
      });

      const incoming = response?.addToCart?.cartItem;
      if (!incoming) {
        throw new Error('No valid cart item returned');
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
      console.error('[Add to Cart Failed]:', error);

      // 解析真实的服务器错误，不再盲目归类为库存不足
      const serverMessage = error?.data?.message || error?.message || '';
      if (serverMessage.toLowerCase().includes('stock')) {
        push.error('Insufficient stock');
      } else if (serverMessage) {
        push.error(`Failed: ${serverMessage}`);
      } else {
        push.error('Network error, please try again');
      }
    }
  };

  const changeQuantity = (key: string, quantity: number) => {
    const next =
      quantity <= 0
        ? cart.value.filter(item => item.key !== key)
        : cart.value.map(item => (item.key === key ? { ...item, quantity } : item));

    setCart(next);

    void $fetch('/api/cart/update', {
      method: 'POST',
      body: { items: [{ key, quantity }] },
    }).catch((err) => {
      console.error('[Update Cart Error]:', err);
    });
  };

  const increment = (productId: number) => {
    const item = findItem(productId);

    if (!item) {
      void handleAddToCart(productId);
      return;
    }

    // 从主商品节点获取库存
    const rawStock = item.product?.node?.stockQuantity;
    const maxStock = typeof rawStock === 'number' ? rawStock : Number(rawStock);

    if (!isNaN(maxStock) && maxStock > 0 && item.quantity >= maxStock) {
      push.error('Insufficient stock');
      return;
    }

    changeQuantity(item.key, item.quantity + 1);
  };

  const decrement = (productId: number) => {
    const item = findItem(productId);
    if (!item) return;
    changeQuantity(item.key, item.quantity - 1);
  };

  onMounted(() => {
    if (!process.client) return;
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error('[Parse Cart Storage Error]:', e);
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
