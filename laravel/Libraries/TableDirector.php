<?php

namespace App\Libraries;

use App\Libraries\Interfaces\Director;

abstract class TableDirector implements Director
{
    protected $builder;

    public function __construct(TableBuilder $builder)
    {
        $this->builder = $builder;
    }

    abstract public function build();

    public function get()
    {
        return $this->builder->get();
    }

}