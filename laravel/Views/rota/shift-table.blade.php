@extends('main')

@section('content')

    <div class="container">

        <div class="row">

            <div class="col-md-12">

                <table class="table table-striped table-bordered">
                    <caption>{{ $caption }}</caption>

                    <!-- Day names -->
                    <thead>
                        <tr>
                            <th></th>
                        @foreach ($weekdays as $weekday)
                            <th>{{ __('datetime.day.' . $weekday) }}</th>
                        @endforeach
                        </tr>
                    </thead>

                    <!-- Staff data -->
                    <tbody>
                        @foreach ($timetable as $staff =>$row)
                            <tr>
                                <td>
                                    #{{ $staff }}
                                </td>
                                @foreach ($weekdays->keys() as $dayNr)
                                    <td>
                                        {{ empty($row[$dayNr]) ? '-' : $row[$dayNr]['starttime']. ' - ' .$row[$dayNr]['endtime']}}
                                    </td>
                                @endforeach
                            </tr>
                        @endforeach
                    </tbody>

                    <!-- Staff totals -->
                    <tfoot>
                        <tr>
                            <td>{{ __('shift.total-hours') }}</td>
                            @foreach ($weekdays->keys() as $dayNr)
                                <td>
                                    {{ empty($totalHours[$dayNr]) ? 0 : $totalHours[$dayNr] }}
                                </td>
                            @endforeach
                        </tr>
                        <tr>
                            <td>{{ __('shift.bonus-hours') }}</td>
                            @foreach ($weekdays->keys() as $dayNr)
                                <td>
                                    {{ empty($totalBonusHours[$dayNr]) ? 0 : $totalBonusHours[$dayNr] }}
                                </td>
                            @endforeach
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
@endsection
