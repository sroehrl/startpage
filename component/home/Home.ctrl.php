<?php

/* Generated by neoan3-cli */

namespace Neoan3\Components;

use Neoan3\Core\Unicore;

/**
 * Class home
 * @package Neoan3\Components
 */

class home extends Unicore{
    /**
     * Route: home
     */
    function init(): void
    {
        $this
            ->uni('Demo')
            ->addHead('title', 'Start Page')
            ->hook('main', 'home')
            ->output();
    }
}