const contentful = require('contentful-management')
const contentfulConfig = {
  managementToken: process.env['CONTENTFUL_MANAGEMENT_ACCESS_TOKEN'],
  spaceId: process.env['SPACE_ID']
}

const client = contentful.createClient({
  accessToken: contentfulConfig.managementToken
})

const ignoreList = [
  'ContentType',
  'bodyTextNode',
  'BodyTextNode',
  'Asset'
]

module.exports = {
  setFieldsOnGraphQLNodeType: async function (data) {
    const node = data.type
    const isContentfulNode = node.name.toLowerCase().startsWith('contentful')

    const space = await client.getSpace(contentfulConfig.spaceId)

    if (!isContentfulNode) {
      return
    }
    const entityNodes = node.nodes.filter((node) => {
      return !ignoreList.some((ignored) => node.internal.type.endsWith(ignored))
    })

    const ids = entityNodes.map((nodeData) => nodeData.contentful_id)
    const { items: entries } = await space.getEntries({
      'sys.id[in]': ids.join(','),
      'select': 'sys.contentType,sys.id'
    })
    const ctIds = entries.map((entry) => {
      return entry.sys.contentType.sys.id
    })

    const { items: contentTypes } = await space.getContentTypes({
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
        spaceId: contentfulConfig.spaceId,
        fields: ct.toPlainObject().fields
      }
    }
  } 
}
