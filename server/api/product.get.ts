// server/api/product.get.ts
import { getProductQuery } from '~/gql/queries/getProduct';
import { requestQuery } from '~~/server/utils/wpgraphql';

export default defineCachedEventHandler(
  async (event) => {
    // 设置边缘 CDN 标头：让 Vercel Edge 节点直接拦截并缓存响应
    setResponseHeader(
      event,
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
    );

    const { slug, sku } = getQuery(event) as { slug?: string; sku?: string };
    if (!slug && !sku) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
    }

    return await requestQuery(getProductQuery, { slug, sku });
  },
  {
    maxAge: 60 * 5,
    swr: true,
    getKey: (event) => {
      const url = getRequestURL(event);
      return `${url.pathname}${url.search}`;
    },
  }
);
