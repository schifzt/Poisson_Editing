Poisson Image Blending on Browser
====
## Overview
Application of <a href="http://www.irisa.fr/vista/Publis/Publi/Perez03a.english.html" target="_blank">this paper</a>.
The demo is <a href="https://schifzt.github.io/Poisson_Editing/" target="_blank">here</a>.

![screenshot](https://user-images.githubusercontent.com/26299162/59612876-d0ef3d00-9158-11e9-999d-171024970e8e.gif)

## Features
+ simple UI like drag ang drop selecting
+ auto image-size formatting

## Thanks
This code was written in reference to https://takuti.me/note/poisson-image-blending .<br>Thank the Author for the nice program and the article.

## Dependencies
+ hammer.js
+ tingle.js

## Usage
1. select images
    + left: base image
    + middle: an image you want to blend with the base image
    + right: mixed result image

2. On the middle image, select blended area and click. You can adjust a position.
3. blend
    + `import`: suited for images like faces etc.
    + `mix`: suited for non-edge images like sky, characters etc.

