export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = 2
  const offset = (page - 1) * pageSize

  const graphqlUrl = "https://www.toppuer.top/graphql"
  const graphQuery = `
    query FeedProduct($offset: Int, $size: Int) {
      products(offset: $offset, first: $size) {
        nodes {
          id
          name
          price
          slug
          images {
            src
          }
        }
      }
    }
  `
  const variables = { offset, size: pageSize }

  try {
    const res = await $fetch(graphqlUrl, {
      method: "POST",
      body: {
        query: graphQuery,
        variables
      }
    })
    const rawList = res.data.products.nodes
    const list = rawList.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      slug: item.slug,
      images: item.images
    }))
    return { list }
  } catch (err) {
    console.error(err)
    return { list: [] }
  }
})
