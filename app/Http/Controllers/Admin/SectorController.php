<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SectorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search');

        $sectors = Sector::query()
            ->when($search, fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/sectors/index', [
            'sectors' => $sectors,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/sectors/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'level' => ['nullable', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        Sector::create([
            'name' => $data['name'],
            'level' => $data['level'] ?? null,
            'status' => $data['status'] ?? true,
        ]);

        return to_route('sectors.index')->with('success', 'Sector created successfully.');
    }

    public function edit(Sector $sector): Response
    {
        return Inertia::render('admin/sectors/form', [
            'sector' => $sector,
        ]);
    }

    public function update(Request $request, Sector $sector): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'level' => ['nullable', 'string', 'max:255'],
            'status' => ['boolean'],
        ]);

        $sector->update([
            'name' => $data['name'],
            'level' => $data['level'] ?? null,
            'status' => $data['status'] ?? true,
        ]);

        return to_route('sectors.index')->with('success', 'Sector updated successfully.');
    }

    public function destroy(Sector $sector): RedirectResponse
    {
        $sector->delete();

        return back()->with('success', 'Sector deleted successfully.');
    }
}
