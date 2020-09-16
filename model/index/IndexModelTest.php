<?php

namespace Neoan3\Model;

require_once 'Index.model.php';

use PHPUnit\Framework\TestCase;


function file_get_contents($ins)
{
    return '{"mock":{"id":"primary"},"mock_sub":{"sub":"yes"}}';
}

class IndexModelTest extends TestCase
{

    function testFirst()
    {
        $insert = [['some'=>'output']];
        $this->assertIsArray(IndexModel::first($insert));
        $this->assertSame([], IndexModel::first([]));
    }
    function testFlatten()
    {
        $deep = ['test' => ['name'=>'sam'],'test_multi'=>['models'=>['one'=>1,'two'=>2]]];
        $flat = IndexModel::flatten('testModel',$deep);
        $this->assertSame(1, $flat['test_multi']['models']['one']);
    }
    function testFailGetMigrateStructure()
    {
        $this->expectException('Exception');
        IndexModel::getMigrateStructure('some', __DIR__. '/no-no.exe');
    }
    function testGetMigrateStructure()
    {
        $st = IndexModel::getMigrateStructure('mock', __DIR__ . '/composer.json' );
        $this->assertIsArray($st);
        $this->assertArrayHasKey('id', $st);
        $this->assertArrayHasKey('mock_sub', $st);
        $this->assertArrayHasKey('sub', $st['mock_sub']);
    }

}
