// server/api/categories.get.ts
import { getCategoriesQuery } from '~/gql/queries/getCategories';
import { requestQuery } from '~~/server/utils/wpgraphql';

export default cachedEventHandler(
  async () => {
    return await requestQuery(getCategoriesQuery);
  },
  {
    maxAge: 1000,
    swr: true,
  }
);
