// server/api/swipe-products.get.ts
import { gql, GraphQLClient } from 'graphql-request';

export default cachedEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();
  const endpoint = config.gqlHost || process.env.GQL_HOST || '';

  if (!endpoint) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GQL_HOST is not configured'
    });
  }

  const client = new GraphQLClient(endpoint);

  const graphqlQuery = gql`
    query GetSwipeProducts($first: Int, $after: String, $category: String) {
      products(
        first: $first, 
        after: $after,
        where: {
          categoryName: $category,
        }
      ) {
        nodes {
          id
          databaseId
          name
          slug
          sku
          price
          regularPrice
          salePrice
          description
          shortDescription
          image {
            sourceUrl  # ← 不加 size 参数，返回原始图片
            altText
            title
          }
          galleryImages(first: 20) {
            nodes {
              sourceUrl  # ← 不加 size 参数，返回原始图片
              altText
              title
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const variables = {
    first: parseInt(query.per_page as string) || 10,
    after: (query.after as string) || null,
    category: (query.category as string) || null,
  };

  try {
    const data = await client.request(graphqlQuery, variables);
    return {
      products: {
        nodes: data.products.nodes,
        pageInfo: data.products.pageInfo
      }
    };
  } catch (err) {
    console.error('GraphQL Error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    });
  }
}, {
  swr: true,
  maxAge: 60,
  swrMaxAge: 120
});



try {
  const data = await client.request(graphqlQuery, variables);
  
  // ===== 调试：打印第一个产品的图片数据 =====
  if (data.products.nodes && data.products.nodes.length > 0) {
    const first = data.products.nodes[0];
    console.log('===== 调试图片数据 =====');
    console.log('产品名称:', first.name);
    console.log('image 字段:', JSON.stringify(first.image, null, 2));
    console.log('galleryImages 字段:', JSON.stringify(first.galleryImages, null, 2));
  }

  return {
    products: {
      nodes: data.products.nodes,
      pageInfo: data.products.pageInfo
    }
  };
} catch (err) {
  console.error('GraphQL Error:', err);
  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to fetch products'
  });
}
