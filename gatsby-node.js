const faker = require(`faker`)

const ENTITIES_COUNT = process.env.ENTITIES_COUNT || 10
const MD_FIELDS_COUNT = process.env.MD_FIELDS_COUNT || 10
const MODE = process.env.MODE || `legacy`

exports.sourceNodes = ({
  actions,
  createContentDigest,
  createNodeId,
  reporter,
}) => {
  reporter.info(
    `Creating ${ENTITIES_COUNT} nodes with ${MD_FIELDS_COUNT} markdown fields in "${MODE}" mode.`
  )
  for (let i = 0; i < ENTITIES_COUNT; i++) {
    const entityId = `entity_${i}`
    const node = {}

    if (MODE === `legacy`) {
      node.content_fields___NODE = []
    } else if (MODE === `spike`) {
      node.content_fields = []
    }

    for (let j = 1; j <= MD_FIELDS_COUNT; j++) {
      const content = faker.lorem.paragraphs(5)

      if (MODE === `legacy`) {
        const mdNode = {
          id: createNodeId(`${entityId}_${j}`),
          internal: {
            type: `EntityMdField`,
            content,
            contentDigest: createContentDigest(content),
            mediaType: `text/markdown`,
          },
        }

        actions.createNode(mdNode)

        node.content_fields___NODE.push(mdNode.id)
      } else if (MODE === `spike`) {
        node.content_fields.push(content)
      }
    }

    actions.createNode({
      ...node,
      id: createNodeId(entityId),
      internal: {
        type: `Entity`,
        contentDigest: createContentDigest(node),
      },
    })
  }
}

exports.createSchemaCustomization = ({
  actions,
  schema,
  createContentDigest,
}) => {
  if (MODE === `spike`) {
    actions.createTypes([
      schema.buildObjectType({
        name: `MarkdownProxyInternal`,
        fields: {
          childMarkdownRemark: {
            type: `MarkdownRemark`,
            resolve: content => {
              const contentDigest = createContentDigest(content)
              return {
                id: contentDigest,
                internal: {
                  content,
                  contentDigest,
                },
              }
            },
          },
        },
      }),
      schema.buildObjectType({
        name: `Entity`,
        fields: {
          content_fields: {
            type: `[MarkdownProxyInternal]`,
            resolve(source) {
              return source.content_fields
            },
          },
        },
        interfaces: [`Node`],
      }),
    ])
  }
}

exports.createPages = async ({ actions, graphql }) => {
  const results = await graphql(`
    {
      allEntity {
        nodes {
          id
        }
      }
    }
  `)

  const template = require.resolve(`./src/templates/entity`)

  for (let entity of results.data.allEntity.nodes) {
    actions.createPage({
      path: `/ent/${entity.id}`,
      component: template,
      context: {
        id: entity.id,
      },
    })
  }
}
