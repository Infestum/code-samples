<?php

namespace App\Libraries;

class Week {

    /**
    * Get week days
    * @return Illuminate\Support\Collection
    */
    public static function getDays()
    {
        $weekDays = range(0, 6);

        return collect($weekDays);
    }

    /**
    * Get week days with indexes
    * @param array $filter
    * @return Illuminate\Support\Collection
    */
    public static function getIndexedDays($filter = [])
    {
        $weekDays = static::getDays();
        $weekDaysIndexed = $weekDays->values();

        if ($filter) {
            return $weekDaysIndexed->intersectKey(array_flip($filter));
        }

        return $weekDaysIndexed;
    }
}
