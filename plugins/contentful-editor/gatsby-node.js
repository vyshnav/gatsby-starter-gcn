const contentful = require('contentful-management')
const contentfulConfig = require('../../.contentful.json').production

const client = contentful.createClient({
  accessToken: process.env['CONTENTFUL_MANAGEMENT_ACCESS_TOKEN'] || contentfulConfig.managementToken
})

module.exports = {
  setFieldsOnGraphQLNodeType: async function (data) {
    const node = data.type
    const isContentfulNode = node.name.toLowerCase().startsWith('contentful')

    const space = await client.getSpace(contentfulConfig.spaceId)

    if (isContentfulNode) {
      const entityNodes = node.nodes.filter((node) => {
        return !node.internal.type.endsWith('ContentType') && 
          !node.internal.type.endsWith('bodyTextNode') && 
          !node.internal.type.endsWith('BodyTextNode') &&
          !node.internal.type.endsWith('Asset')
      })
      const removePrefix = (id) => id.substr(1)
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
}
