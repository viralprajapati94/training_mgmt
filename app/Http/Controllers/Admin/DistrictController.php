<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DistrictController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search');
        $stateId = $request->input('state_id');

        $districts = District::with('state')
            ->when($search, fn ($query) => $query->where('district', 'like', "%{$search}%"))
            ->when($stateId, fn ($query) => $query->where('state_id', $stateId))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/districts/index', [
            'districts' => $districts,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'filters' => [
                'search' => $search,
                'state_id' => $stateId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/districts/form', [
            'states' => State::select('id', 'state')->orderBy('state')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'state_id' => ['required', 'exists:states,id'],
            'district' => ['required', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        District::create([
            'state_id' => $data['state_id'],
            'district' => $data['district'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('districts.index')->with('success', 'District created successfully.');
    }

    public function edit(District $district): Response
    {
        return Inertia::render('admin/districts/form', [
            'district' => $district,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
        ]);
    }

    public function update(Request $request, District $district): RedirectResponse
    {
        $data = $request->validate([
            'state_id' => ['required', 'exists:states,id'],
            'district' => ['required', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        $district->update([
            'state_id' => $data['state_id'],
            'district' => $data['district'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('districts.index')->with('success', 'District updated successfully.');
    }

    public function destroy(District $district): RedirectResponse
    {
        $district->delete();

        return back()->with('success', 'District deleted successfully.');
    }
}
