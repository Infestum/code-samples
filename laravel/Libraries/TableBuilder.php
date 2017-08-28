<?php

namespace App\Libraries;

use App\Libraries\Interfaces\Builder;
use App\Libraries\Interfaces\Table;

abstract class TableBuilder implements Table, Builder
{
    protected $view;
    protected $model;
    protected $table = null;
    protected $caption = '';

    /**
     * Set table caption
     * @param string $caption
     */
    public function setCaption($caption)
    {
        $this->caption = $caption;
    }
    /**
     * Format table body data
     */
    abstract public function formatBody();

    /**
     * Format table footer data
     */
    abstract public function formatFooter();
    /**
     * Apply table view
     */
    abstract public function apply();

    /**
     * Get table view
     */
    public function get()
    {
        return $this->table;
    }
}