// server/api/swipe-products.get.ts
import { gql, GraphQLClient } from 'graphql-request';

export default cachedEventHandler(async (event) => {
  const query = getQuery(event);
  
  // 从 runtimeConfig 获取 GraphQL 端点
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
            sourceUrl(size: LARGE)
            altText
            title
          }
          galleryImages(first: 20) {
            nodes {
              sourceUrl(size: LARGE)
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
