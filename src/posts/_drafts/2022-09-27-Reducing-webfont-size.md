---
title: Reducing webfont size
excerpt: 'Why download a whole font file when you use only a subset of its characters?'
---

Install `fonttool`

```shell
pip install fonttools[woff]
```

```shell
pyftsubset Original.woff \
  --text="hack &n cheese" \
  --flavor="woff2" \
  --no-hinting \
  --desubroutinize \
  --name-IDs="" \
  --layout-features="" \
  --output-file="Subset.woff"
```
