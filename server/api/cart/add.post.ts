// server/api/cart/add.post.ts
import { requestMutation } from '~~/server/utils/wpgraphql';

// 单一商品 AddToCart Mutation 语句
const addToCartMutation = /* GraphQL */ `
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addToCart(input: { productId: $productId, quantity: $quantity }) {
      cartItem {
        key
        quantity
        product {
          node {
            databaseId
            name
            image {
              sourceUrl
            }
            ... on SimpleProduct {
              price
              regularPrice
              salePrice
              stockQuantity
              stockStatus
            }
          }
        }
      }
    }
  }
`;

export default defineEventHandler(async event => {
  const body = await readBody(event);

  // 安全解析 productId 与 quantity
  const rawProductId = body?.productId || body?.databaseId;
  const productId = Number(rawProductId);

  if (!productId || isNaN(productId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or missing productId',
    });
  }

  const quantity = Number(body?.quantity) || 1;

  // 调用 GraphQL 工具方法
  return await requestMutation(event, addToCartMutation, {
    productId,
    quantity,
  });
});
