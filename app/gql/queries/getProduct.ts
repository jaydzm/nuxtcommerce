// app/gql/queries/getProducts.ts
import { gql } from 'graphql-request';

export const getProductsQuery = gql`
  query getProducts($after: String, $search: String, $category: String, $order: OrderEnum!, $field: ProductsOrderByEnum!) {
    products(first: 20, after: $after, where: { 
      stockStatus: IN_STOCK, 
      search: $search, 
      category: $category, 
      orderby: { field: $field, order: $order }
    }) {
      nodes {
        ... on SimpleProduct {
          sku
          slug
          name
          regularPrice
          salePrice
          image {
            sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
          }
          galleryImages {
            nodes {
              sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
            }
          }
          stockQuantity
          manageStock
        }
        ... on VariableProduct {
          sku
          slug
          name
          regularPrice
          salePrice
          image {
            sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
          }
          galleryImages {
            nodes {
              sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
            }
          }
          # 保留最少量的变体信息，如果需要可以取消注释
          # allPaStyle {
          #   nodes {
          #     name
          #   }
          # }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
