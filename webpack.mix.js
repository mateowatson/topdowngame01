let mix = require('laravel-mix');

mix.ts('js/app.ts', 'dist')
    .sass('sass/style.scss', 'dist')
    .options({ processCssUrls: false });