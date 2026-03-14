<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\State;
use App\Models\Taluka;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TalukaController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search');
        $stateId = $request->input('state_id');
        $districtId = $request->input('district_id');

        $talukas = Taluka::with(['state', 'district'])
            ->when($search, fn ($query) => $query->where('taluko', 'like', "%{$search}%"))
            ->when($stateId, fn ($query) => $query->where('state_id', $stateId))
            ->when($districtId, fn ($query) => $query->where('district_id', $districtId))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/talukas/index', [
            'talukas' => $talukas,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
            'filters' => [
                'search' => $search,
                'state_id' => $stateId,
                'district_id' => $districtId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/talukas/form', [
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'state_id' => ['required', 'exists:states,id'],
            'district_id' => ['required', 'exists:districts,id'],
            'taluko' => ['required', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        Taluka::create([
            'state_id' => $data['state_id'],
            'district_id' => $data['district_id'],
            'taluko' => $data['taluko'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('talukas.index')->with('success', 'Taluka created successfully.');
    }

    public function edit(Taluka $taluka): Response
    {
        return Inertia::render('admin/talukas/form', [
            'taluka' => $taluka,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
        ]);
    }

    public function update(Request $request, Taluka $taluka): RedirectResponse
    {
        $data = $request->validate([
            'state_id' => ['required', 'exists:states,id'],
            'district_id' => ['required', 'exists:districts,id'],
            'taluko' => ['required', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        $taluka->update([
            'state_id' => $data['state_id'],
            'district_id' => $data['district_id'],
            'taluko' => $data['taluko'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('talukas.index')->with('success', 'Taluka updated successfully.');
    }

    public function destroy(Taluka $taluka): RedirectResponse
    {
        $taluka->delete();

        return back()->with('success', 'Taluka deleted successfully.');
    }
}
