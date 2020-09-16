<?php
/**
 * Created by PhpStorm.
 * User: sroehrl
 * Date: 2/4/2019
 * Time: 1:36 PM
 */

namespace Neoan3\Frame;

use Neoan3\Core\Serve;

class Demo extends Serve
{
    function constants()
    {
        return [
            'base' => [base],
            'link' => [
                [
                    'sizes' => '32x32',
                    'type' => 'image/png',
                    'rel' => 'icon',
                    'href' => 'asset/neoan-favicon.png'
                ]
            ],
            'stylesheet' => [
                '' . base . 'frame/demo/demo.css',
                '' . base . 'node_modules/normalizecss/normalize.css',
                'https://cdn.jsdelivr.net/npm/gaudiamus-css@1.1.0/css/gaudiamus.min.css',
            ],
            'js' => [
//                ['src' => base . 'node_modules/alpinejs/dist/alpine.js'],
                ['src' => 'https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.7.0/dist/alpine.min.js'],
//                ['src' => base . 'node_modules/axios/dist/axios.js'],
                ['src' => 'https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.7.0/dist/alpine.min.js'],
                ['src' => 'https://alcdn.msauth.net/browser/2.1.0/js/msal-browser.min.js'],
            ]
        ];
    }
}
