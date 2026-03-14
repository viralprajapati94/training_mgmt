<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\District;
use App\Models\State;
use App\Models\Taluka;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CityController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search');
        $stateId = $request->input('state_id');
        $districtId = $request->input('district_id');
        $talukaId = $request->input('taluka_id');

        $cities = City::with(['state', 'district', 'taluka'])
            ->when($search, fn ($query) => $query->where('city', 'like', "%{$search}%"))
            ->when($stateId, fn ($query) => $query->where('state_id', $stateId))
            ->when($districtId, fn ($query) => $query->where('district_id', $districtId))
            ->when($talukaId, fn ($query) => $query->where('taluka_id', $talukaId))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/cities/index', [
            'cities' => $cities,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
            'talukas' => Taluka::select('id', 'taluko', 'district_id', 'state_id')->orderBy('taluko')->get(),
            'filters' => [
                'search' => $search,
                'state_id' => $stateId,
                'district_id' => $districtId,
                'taluka_id' => $talukaId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/cities/form', [
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
            'talukas' => Taluka::select('id', 'taluko', 'district_id', 'state_id')->orderBy('taluko')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'state_id' => ['required', 'exists:states,id'],
            'district_id' => ['required', 'exists:districts,id'],
            'taluka_id' => ['required', 'exists:talukas,id'],
            'city' => ['required', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        City::create([
            'state_id' => $data['state_id'],
            'district_id' => $data['district_id'],
            'taluka_id' => $data['taluka_id'],
            'city' => $data['city'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('cities.index')->with('success', 'City created successfully.');
    }

    public function edit(City $city): Response
    {
        return Inertia::render('admin/cities/form', [
            'city' => $city,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
            'talukas' => Taluka::select('id', 'taluko', 'district_id', 'state_id')->orderBy('taluko')->get(),
        ]);
    }

    public function update(Request $request, City $city): RedirectResponse
    {
        $data = $request->validate([
            'state_id' => ['required', 'exists:states,id'],
            'district_id' => ['required', 'exists:districts,id'],
            'taluka_id' => ['required', 'exists:talukas,id'],
            'city' => ['required', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        $city->update([
            'state_id' => $data['state_id'],
            'district_id' => $data['district_id'],
            'taluka_id' => $data['taluka_id'],
            'city' => $data['city'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('cities.index')->with('success', 'City updated successfully.');
    }

    public function destroy(City $city): RedirectResponse
    {
        $city->delete();

        return back()->with('success', 'City deleted successfully.');
    }
}
