import React from 'react'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import config from '../utils/siteConfig'
import CardList from '../components/CardList'
import Card from '../components/Card'
import Container from '../components/Container'
import PageTitle from '../components/PageTitle'
import ContentfulEditor from '../components/ContentfulEditor'

const Index = ({ data }) =>  {
  const posts = data.allContentfulPost.edges;
  
  return (
    <Container>
      <PageTitle small>
        <a href="https://www.gatsbyjs.org/" target="_blank">Gatsby</a>, <a href="https://www.contentful.com/" target="_blank">Contentful</a> and <a href="https://www.netlify.com/" target="_blank">Netlify</a> <span>🎉</span>
      </PageTitle>
      <CardList>
        {posts.map(({ node: post })=> (
          <ContentfulEditor contentfulEditor={post.contentfulEditor} entityData={post} key={post.id}>
            <Card
            slug={post.slug}
            image={post.heroImage}
            title={post.title}
            date={post.publishDate}
            excerpt={post.body}
            />
          </ContentfulEditor>
        ))}
      </CardList>
    </Container>
  )
}

export const query = graphql`
  query indexQuery {
    allContentfulPost(limit: 1000, sort: {fields: [publishDate], order: DESC}) {
      edges {
        node {
          title
          id
          slug
          publishDate(formatString: "MMMM DD, YYYY")
          heroImage {
            title
            sizes(maxWidth: 800) {
              ...GatsbyContentfulSizes_withWebp_noBase64
            }
          }
          body {
            childMarkdownRemark {
              html
              excerpt(pruneLength: 80)
              internal {
                content
              }
            }
          }
          contentfulEditor {
            contentTypeId
            entityId
            spaceId
            fields {
              id
              type
            }
          }
        }
      }
    }
  }
`

export default Index
