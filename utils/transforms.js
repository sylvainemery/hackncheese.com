const htmlmin = require('html-minifier');
const generate = (...args) =>
  import('critical').then(({ generate }) => generate(...args));

module.exports = {
  criticalCSS: async function (content) {
    if (this.outputPath && this.outputPath.endsWith('.html')) {
      // Options: https://github.com/addyosmani/critical
      const { html } = await generate({
        base: '_site',
        html: content,
        inline: true,
        rebase: {
          from: '/assets/css/main.css',
          to: '/index.html',
        },
      });
      return html;
    }
    return content;
  },
  minifyHTML: function (content) {
    if (this.outputPath && this.outputPath.endsWith('.html')) {
      // Options: https://github.com/kangax/html-minifier
      return htmlmin.minify(content, {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyCSS: {
          level: 2,
        },
        removeComments: true,
        useShortDoctype: true,
      });
    }
    return content;
  },
};
