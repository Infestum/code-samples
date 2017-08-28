<?php

namespace App\Libraries\Interfaces;

interface Table
{
    public function setCaption($caption);
    public function formatBody();
    public function formatFooter();
}

