const eleventyImage = require('@11ty/eleventy-img');

module.exports = {
  image: async function (src, alt, sizes) {
    const metadata = await eleventyImage(src, {
      widths: [420, 800],
      formats: ['avif', 'webp', 'jpeg', null],
      outputDir: './_site/assets/img/',
      urlPath: '/assets/img/',
    });

    const imageAttributes = {
      alt,
      sizes,
      loading: 'lazy',
      decoding: 'async',
    };

    return eleventyImage.generateHTML(metadata, imageAttributes);
  },
};
