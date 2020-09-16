<?php

namespace Neoan3\Components;

use PHPUnit\Framework\TestCase;

class HomeTest extends TestCase
{
    private Home $instance;
    function setUp(): void
    {
        $this->instance = new Home();
    }
    
    public function testInit()
    {
        $this->expectOutputRegex('/^<!doctype html>/');
        $this->instance->init();
    }

}
