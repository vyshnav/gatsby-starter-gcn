const contentful = require('contentful')

const ignoreList = [
  'ContentType',
  'bodyTextNode',
  'BodyTextNode',
  'Asset'
]

const getContentTypeMapping = async (entityNodes, { spaceId, accessToken, host }) => {
  const client = contentful.createClient({
    space: spaceId,
    accessToken,
    host
  })

  const ids = entityNodes.map((nodeData) => nodeData.contentful_id)

  const { items: entries } = await client.getEntries({
    'sys.id[in]': ids.join(','),
    'select': 'sys.contentType,sys.id'
  })
  const ctIds = entries.map((entry) => {
    return entry.sys.contentType.sys.id
  })

  const { items: contentTypes } = await client.getContentTypes({
    'sys.id[in]': ctIds.join(',')
  })

  return (id) => {
    const entry = entries.find((entry) => entry.sys.id === id)
    const ctId = entry.sys.contentType.sys.id
    return contentTypes.find((ct) => ct.sys.id === ctId)
  }
}

const omitIrrelevantNodes = (nodes) => {
  return nodes.filter((node) => {
    return !ignoreList.some((ignored) => node.internal.type.endsWith(ignored))
  })
}

module.exports = {
  setFieldsOnGraphQLNodeType: async function (data, { spaceId, accessToken, host }) {
    const node = data.type
    const isContentfulNode = node.name.toLowerCase().startsWith('contentful')

    if (!isContentfulNode) {
      return
    }

    const entityNodes = omitIrrelevantNodes(node.nodes)
    const getContentTypeForEntry = await getContentTypeMapping(entityNodes, { spaceId, accessToken, host })

    for (const entityNode of entityNodes) {
      const id = entityNode.contentful_id
      const ct = getContentTypeForEntry(id)

      entityNode.contentfulEditor = {
        contentTypeId: ct.sys.id,
        entityId: id,
        spaceId: spaceId,
        fields: ct.fields
      }
    }
  }
}
