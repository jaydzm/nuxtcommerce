// app/gql/queries/getProduct.ts
import { gql } from 'graphql-request';

export const getProductQuery = gql`
  query getProduct($slug: ID!, $sku: String!) {
    product(id: $slug, idType: SLUG) {
      ... on SimpleProduct {
        databaseId
        sku
        slug
        name
        regularPrice
        salePrice
        description
        shortDescription
        stockStatus
        stockQuantity
        manageStock
        image {
          sourceUrl(size: LARGE)
        }
        galleryImages {
          nodes {
            sourceUrl(size: LARGE)
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        tags {
          nodes {
            name
          }
        }
        averageRating
        reviewCount
        related(first: 50) {
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
            }
          }
        }
      }
    }
  }
`;
