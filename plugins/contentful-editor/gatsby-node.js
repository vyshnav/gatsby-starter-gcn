const contentful = require('contentful')

const ignoreList = [
  'ContentType',
  'bodyTextNode',
  'BodyTextNode',
  'Asset'
]

module.exports = {
  setFieldsOnGraphQLNodeType: async function (data, { spaceId, accessToken, host }) {
    const node = data.type
    const isContentfulNode = node.name.toLowerCase().startsWith('contentful')
    
    if (!isContentfulNode) {
      return
    }

    const client = contentful.createClient({
      space: spaceId,
      accessToken,
      host
    })

    const entityNodes = node.nodes.filter((node) => {
      return !ignoreList.some((ignored) => node.internal.type.endsWith(ignored))
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

    for (const entityNode of entityNodes) {
      const id = entityNode.contentful_id
      const entry = entries.find((entry) => entry.sys.id === id)
      const ctId = entry.sys.contentType.sys.id 
      const ct = contentTypes.find((ct) => ct.sys.id === ctId)

      entityNode.contentfulEditor = {
        contentTypeId: ct.sys.id,
        entityId: id,
        spaceId: spaceId,
        fields: ct.fields
      }
    }
  } 
}
