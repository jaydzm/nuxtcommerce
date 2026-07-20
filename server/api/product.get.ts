// server/api/product.get.ts
import { requestQuery } from '~~/server/utils/wpgraphql';

// 包含完整图片字段的 GraphQL 查询
const getProductQuery = /* GraphQL */ `
  query getProduct($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      databaseId
      name
      slug
      description
      shortDescription
      sku
      image {
        sourceUrl
        altText
        title
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
          title
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
    const query = getQuery(event);
    const slug = query.slug as string;

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
