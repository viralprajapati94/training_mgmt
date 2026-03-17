<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\District;
use App\Models\Taluka;
use App\Models\City;
use App\Models\State;

class LocationController extends Controller
{
    public function getStates()
    {
        return response()->json(State::orderBy('state')->get(['id', 'state']));
    }

    public function getDistricts(Request $request)
    {
        $request->validate([
            'state_id' => 'required|exists:states,id'
        ]);

        $districts = District::where('state_id', $request->state_id)
            ->orderBy('district')
            ->get(['id', 'district']);

        return response()->json($districts);
    }

    public function getTalukas(Request $request)
    {
        $request->validate([
            'district_id' => 'required|exists:districts,id'
        ]);

        $talukas = Taluka::where('district_id', $request->district_id)
            ->orderBy('taluko')
            ->get(['id', 'taluko']);

        return response()->json($talukas);
    }

    public function getCities(Request $request)
    {
        $request->validate([
            'taluka_id' => 'required|exists:talukas,id'
        ]);

        $cities = City::where('taluka_id', $request->taluka_id)
            ->orderBy('city')
            ->get(['id', 'city']);

        return response()->json($cities);
    }
}
