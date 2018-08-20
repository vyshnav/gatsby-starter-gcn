require('dotenv').config();
const config = require('./src/utils/siteConfig');

// If the contentfulConfig can't be found assume the site is being built via Netlify with production environment variables
try { var contentfulConfig = require('./.contentful'); } catch (e) {
    var contentfulConfig = {
        "production": {
            "spaceId": process.env.SPACE_ID,
            "accessToken": process.env.ACCESS_TOKEN
        }
    }
}

module.exports = {
    siteMetadata: {
        title: config.siteTitle,
        description: config.siteDescription,
        siteUrl: config.siteUrl,
        pathPrefix: config.pathPrefix,
        facebook: {
            appId: process.env.FB_APP_ID ? process.env.FB_APP_ID : ""
        }
    },
    plugins: [{
            resolve: 'gatsby-plugin-canonical-urls',
            options: {
                siteUrl: config.siteUrl,
            },
        },
        'gatsby-plugin-styled-components',
        'gatsby-plugin-react-helmet',
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [{
                    resolve: `gatsby-remark-prismjs`,
                }, ],
            },
        },
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: config.manifestName,
                short_name: config.manifestShortName,
                start_url: config.manifestStartUrl,
                background_color: config.manifestBackgroundColor,
                theme_color: config.manifestThemeColor,
                display: config.manifestDisplay,
                icon: "src/images/logo.jpg", // This path is relative to the root of the site.
            },
        },
        'gatsby-plugin-offline',
        {
            resolve: `gatsby-plugin-feed`,
            options: {
              query: `
                {
                  site {
                    siteMetadata {
                      title
                      description
                      siteUrl
                      site_url: siteUrl
                    }
                  }
                }
              `,
              feeds: [
                {
                  serialize: ({ query: { site, allMarkdownRemark } }) => {
                    return allMarkdownRemark.edges.map(edge => {
                      return Object.assign({}, edge.node.frontmatter, {
                        description: edge.node.excerpt,
                        url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                        guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                        custom_elements: [{ "content:encoded": edge.node.html }],
                      });
                    });
                  },
                  query: `
                    {
                      allMarkdownRemark(
                        limit: 1000,
                        sort: { order: DESC, fields: [publishDate] },
                        filter: {frontmatter: { draft: { ne: true } }}
                      ) {
                        edges {
                          node {
                            excerpt
                            html
                            fields { slug }
                            frontmatter {
                              title
                              date
                            }
                          }
                        }
                      }
                    }
                  `,
                  output: "/rss.xml",
                },
              ],
            },
          },
        {
            resolve: `gatsby-plugin-sitemap`
        },
        {
            resolve: 'gatsby-source-contentful',
            options: process.env.NODE_ENV === 'development' ?
                contentfulConfig.development : contentfulConfig.production
        },
        'gatsby-plugin-netlify'
    ],
}