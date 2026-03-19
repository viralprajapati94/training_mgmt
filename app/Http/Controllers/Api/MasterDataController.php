<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobRole;
use App\Models\Sector;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    public function getSectors()
    {
        $sectors = Sector::where('status', true)->get(['id', 'name']);
        return response()->json($sectors);
    }

    public function getJobRoles(Request $request)
    {
        $request->validate([
            'sector_id' => 'required|exists:sectors,id',
        ]);

        $jobRoles = JobRole::where('sector_id', $request->sector_id)
            ->where('status', true)
            ->get(['id', 'name', 'qp_code', 'qp_version as version']);
            
        return response()->json($jobRoles);
    }
}
