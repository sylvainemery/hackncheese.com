---
title: Reducing webfont size
excerpt: 'Why make your visitors download a whole font file when you use only a subset of its characters?'
---

When rebuilding this website, I wanted to have a proper logo. And with SEO and progressive enhancement in mind, I wanted it to be just text displayed in a specific font.
Like images and every other assets of this blog, I also wanted to make sure every byte downloaded was useful.

A regular font contains all the alphabet, all 10 digits, and a lot more characters. My website's name only contains 8 different characters. How to optimize the webfont to only include the needed characters, and nothing more?

There are 2 cases, whether you use a Google Font or not.

## Subsetting a Google Font

You'll need to use the CSS2 API from Google Fonts. You just need to ad a `text=` query parameter to the stylesheet link in your HTML head.

```html
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans&text=hack%20%26es"
  rel="stylesheet"
/>
```

Make sure you urlencode all the characters.

Be careful, this `text` parameter will apply to the whole list of fonts you specify in the font call. So if you use several fonts but want to subset only one, you'll need to separate your font calls.

See the [Google Fonts CSS2 API documentation](https://developers.google.com/fonts/docs/css2#optimizing_your_font_requests) for more information.

## Subsetting any other font

Let's use [fontTools](https://github.com/fonttools/fonttools), a Python library and CLI tools to manipulate font files. One of these tools is `pyftsubset`, which allows to keep a subset of characters in the font file and remove everything else.

First, install `fontTools`. Since webfonts should now be in WOFF2 format, fontTools will need the extra `woff` feature. And since WOFF2 uses `brotli` for compression, make sure to install it via your system package manager before.

```shell
pip install fonttools[woff]
```

Now let's use `pyftsubset`:

```shell
pyftsubset \
  "original.woff" \
  --text="hack & cheese" \
  --flavor="woff2" \
  --no-hinting \
  --desubroutinize \
  --name-IDs="" \
  --layout-features="" \
  --output-file="subset.woff"
```

Options, explained:<br>
`"original.woff"`: original font file<br>
`--text="hack & cheese"`: the list of characters we want to keep<br>
`--flavor="woff2"`: export as a WOFF2 file<br>
`--no-hinting`: remove instructions on how to render in low pixel sizes<br>
`--desubroutinize`: optional, it may make the file smaller<br>
`--name-IDs=""`: strip all naming metadata<br>
`--layout-features=""`: remove all layout features, such as kerning<br>
`--output-file="subset.woff"`: resulting optimized webfont file<br>

All the `pyftsubset` options can be found in the [documentation](https://fonttools.readthedocs.io/en/latest/subset/index.html).

You now have the smallest possible webfont file, that still works perfectly in your browser!
