<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StateController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search');

        $states = State::query()
            ->when($search, fn ($query) => $query->where('state', 'like', "%{$search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/states/index', [
            'states' => $states,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/states/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'state' => ['required', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        State::create([
            'state' => $data['state'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('states.index')->with('success', 'State created successfully.');
    }

    public function edit(State $state): Response
    {
        return Inertia::render('admin/states/form', [
            'state' => $state,
        ]);
    }

    public function update(Request $request, State $state): RedirectResponse
    {
        $data = $request->validate([
            'state' => ['required', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        $state->update([
            'state' => $data['state'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('states.index')->with('success', 'State updated successfully.');
    }

    public function destroy(State $state): RedirectResponse
    {
        $state->delete();

        return back()->with('success', 'State deleted successfully.');
    }
}
