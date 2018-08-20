const colors = require("../../src/styles/colors");

module.exports = {
  siteTitle: "Techie Bro - tech news", // <title>
  siteTitleAlt: 'Technology news in malayalam', // This allows an alternative site title for SEO schema.
  publisher: 'Publisher named GCN', // Organization name used for SEO schema 
  shortTitle: 'Techie Bro App', // Used for App manifest e.g. Mobile Home Screen
  siteDescription: "Technology news in malayalam.",
  siteUrl: "https://techiebro.ml",
  pathPrefix: "", 
  siteLanguage: "en",

  author: 'Techie Bro', // Author for RSS author segment and SEO schema
  authorUrl: 'https://techiebro.ml/about/', // URL used for author and publisher schema, can be a social profile or other personal site
  userTwitter: '@twitter', // Change for Twitter Cards
 
  shareImage: '/logos/logo-512.png', // Open Graph Default Share Image. 1200x1200 is recommended
  shareImageWidth: 900, // Change to the width of your default share image
  shareImageHeight: 600, // Change to the height of your default share image
  siteLogo: '/logos/logo-512.png', // Logo used for SEO, RSS, and App manifest  
  themeColor: '#121212', // Used for Offline Manifest
  copyright: 'Copyright © 2018 Techie Bro!', // Copyright string for the RSS feed

  
  // manifest.json
  manifestName: "Techie Bro - tech news",
  manifestShortName: "Techie Bro", // max 12 characters
  manifestStartUrl: "/",
  manifestBackgroundColor: colors.background,
  manifestThemeColor: colors.background,
  manifestDisplay: "standalone",
  // contact
  contactEmail: "reachtechiebro@gmail.com",
  // social
  authorSocialLinks: [
    { name: "github", url: "https://github.com/greglobinski" },
    { name: "twitter", url: "https://twitter.com/greglobinski" },
    { name: "facebook", url: "http://facebook.com/greglobinski" }
  ]
};

