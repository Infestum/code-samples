<?php

namespace App\Libraries;

use App\Concerns\Interfaces\Rotaable;

class ShiftTableBuilder extends TableBuilder
{
    protected $view = 'rota.shift-table';
    protected $weekdays = [];
    protected $timetable = [];
    protected $totalHours = [];
    protected $totalBonusHours = [];
    protected $rotaId = 0;

    public function __construct(Rotaable $model, $weekdays, $rotaId = 0)
    {
        $this->model = $model;
        $this->rotaId = $rotaId;
        $this->weekdays = $weekdays;
    }

    /**
     * Format table body data
     */
    public function formatBody()
    {
        $this->timetable = $this->model->getWeekTimetable($this->rotaId);
    }

    /**
     * Format table footer data
     */
    public function formatFooter()
    {
        $this->totalHours = $this->model->getWeekTotalHours($this->rotaId);
        $this->totalBonusHours = $this->model->getWeekBonusHours($this->rotaId);
    }

    /**
     * Apply table view
     */
    public function apply()
    {
        $this->table = view($this->view)
            ->with('caption', $this->caption)
            ->with('weekdays', $this->weekdays)
            ->with('timetable', $this->timetable)
            ->with('totalHours', $this->totalHours)
            ->with('totalBonusHours', $this->totalBonusHours);
    }
}