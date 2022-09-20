const htmlmin = require('html-minifier');

module.exports = {
  minifyHTML: function (content, outputPath) {
    if (outputPath && outputPath.endsWith('.html')) {
      // Options: https://github.com/kangax/html-minifier
      return htmlmin.minify(content, {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        useShortDoctype: true,
      });
    }
    return content;
  },
};
