<?php

namespace App\Libraries;

class ShiftTableDirector extends TableDirector
{
    /**
     * Build table data
     */
    public function build()
    {
        $this->builder->setCaption('Shift table');
        $this->builder->formatBody();
        $this->builder->formatFooter();
        $this->builder->apply();
    }
}