// server/api/swipe-products.get.ts
import { gql } from 'graphql-request';
import { fetchWPGraphQL } from '~~/server/utils/wpgraphql';

export default cachedEventHandler(async (event) => {
  const query = getQuery(event);
  
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

  const data = await fetchWPGraphQL(graphqlQuery, variables);
  
  return {
    products: {
      nodes: data.products.nodes,
      pageInfo: data.products.pageInfo
    }
  };
}, {
  swr: true,
  maxAge: 60,
  swrMaxAge: 120
});
