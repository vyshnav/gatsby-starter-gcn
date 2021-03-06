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
        rssMetadata: {
            site_url: config.siteUrl,
            feed_url: `${config.siteUrl}/rss.xml`,
            title: config.siteTitle,
            description: config.siteDescription,
            image_url: `${config.siteUrl}${config.siteLogo}`,
            author: config.author,
            copyright: config.copyright,
        },
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
            resolve: 'gatsby-plugin-feed',
            options: {
                setup(ref) {
                    const ret = ref.query.site.siteMetadata.rssMetadata
                    ret.allMarkdownRemark = ref.query.allMarkdownRemark
                    ret.generator = 'Techie Bro - tech news'
                    return ret
                },
                query: `
              {
                site {
                  siteMetadata {
                    rssMetadata {
                      site_url
                      feed_url
                      title
                      description
                      image_url
                      author
                      copyright
                    }
                  }
                }
              }
            `,
                feeds: [{
                    serialize(ctx) {
                        const rssMetadata = ctx.query.site.siteMetadata.rssMetadata
                        return ctx.query.allContentfulPost.edges.map(edge => ({
                            date: edge.node.publishDate,
                            title: edge.node.title,
                            description: edge.node.body.childMarkdownRemark.excerpt,

                            url: rssMetadata.site_url + '/' + edge.node.slug,
                            guid: rssMetadata.site_url + '/' + edge.node.slug,
                            custom_elements: [{
                                'content:encoded': edge.node.body.childMarkdownRemark.html,
                            }, ],
                        }))
                    },
                    query: `
                        {
                      allContentfulPost(limit: 1000, sort: {fields: [publishDate], order: DESC}) {
                         edges {
                           node {
                             title
                             slug
                             publishDate(formatString: "MMMM DD, YYYY")
                             body {
                               childMarkdownRemark {
                                 html
                                 excerpt(pruneLength: 80)
                               }
                             }
                           }
                         }
                       }
                     }
                `,
                    output: '/rss.xml',
                }, ],
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