// server/api/product.get.ts
import { requestQuery } from '~~/server/utils/wpgraphql';

// 单一商品的 GraphQL 查询语句
const getProductQuery = /* GraphQL */ `
  query getProduct($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      databaseId
      name
      slug
      description
      shortDescription
      image {
        sourceUrl
      }
      galleryImages {
        nodes {
          sourceUrl
        }
      }
      categories {
        nodes {
          name
          slug
        }
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
`;

export default cachedEventHandler(
  async event => {
    const { slug } = getQuery(event) as { slug?: string; sku?: string };

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing product slug',
      });
    }

    return await requestQuery(getProductQuery, { slug });
  },
  {
    maxAge: 0,
    swr: true,
    getKey: event => event.req.url!,
  }
);
