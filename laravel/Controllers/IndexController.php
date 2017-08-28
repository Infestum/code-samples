<?php

namespace App\Http\Controllers;

use App\Libraries\Week;
use App\Libraries\ShiftTableBuilder;
use App\Libraries\ShiftTableDirector;
use App\ShiftStaff;

class IndexController extends Controller
{
    // To show only these days
    protected $days = [0, 1, 2, 3, 4, 5, 6];

    /**
     * Display the specified resource.
     *
     * @return Illuminate\Support\Facades\View
     */
    public function index(ShiftStaff $shiftStaff)
    {
        $builder = new ShiftTableBuilder($shiftStaff, Week::getIndexedDays($this->days));
        $director = new ShiftTableDirector($builder);
        $director->build();

        return $director->get();
    }
}
