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
                name: config.siteTitle,
                short_name: config.siteTitle,
                description: config.siteDescription,
                start_url: "/",
                background_color: "#f7f0eb",
                theme_color: "#a2466c",
                display: "standalone",
                icon: "src/images/logo.jpg", // This path is relative to the root of the site.
            },
        },
        'gatsby-plugin-offline',
        {
            resolve: 'gatsby-source-contentful',
            options: process.env.NODE_ENV === 'development' ?
                contentfulConfig.development : contentfulConfig.production
        },
        'gatsby-plugin-netlify'
    ],
}