<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scheme;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SchemeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search');
        $stateId = $request->input('state_id');

        $schemes = Scheme::with('state')
            ->when($search, fn ($query) => $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")))
            ->when($stateId, fn ($query) => $query->where('state_id', $stateId))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/schemes/index', [
            'schemes' => $schemes,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'filters' => [
                'search' => $search,
                'state_id' => $stateId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/schemes/form', [
            'states' => State::select('id', 'state')->orderBy('state')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'state_id' => ['required', 'exists:states,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'status' => ['boolean'],
        ]);

        $logoPath = $request->file('logo')?->store('schemes', 'public');

        Scheme::create([
            'state_id' => $data['state_id'],
            'name' => $data['name'],
            'code' => $data['code'] ?? null,
            'logo' => $logoPath,
            'status' => $data['status'] ?? true,
        ]);

        return to_route('schemes.index')->with('success', 'Scheme created successfully.');
    }

    public function edit(Scheme $scheme): Response
    {
        return Inertia::render('admin/schemes/form', [
            'scheme' => $scheme,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
        ]);
    }

    public function update(Request $request, Scheme $scheme): RedirectResponse
    {
        $data = $request->validate([
            'state_id' => ['required', 'exists:states,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'status' => ['boolean'],
        ]);

        $logoPath = $scheme->logo;
        if ($request->hasFile('logo')) {
            if ($scheme->logo) {
                Storage::disk('public')->delete($scheme->logo);
            }
            $logoPath = $request->file('logo')->store('schemes', 'public');
        }

        $scheme->update([
            'state_id' => $data['state_id'],
            'name' => $data['name'],
            'code' => $data['code'] ?? null,
            'logo' => $logoPath,
            'status' => $data['status'] ?? true,
        ]);

        return to_route('schemes.index')->with('success', 'Scheme updated successfully.');
    }

    public function destroy(Scheme $scheme): RedirectResponse
    {
        if ($scheme->logo) {
            Storage::disk('public')->delete($scheme->logo);
        }

        $scheme->delete();

        return back()->with('success', 'Scheme deleted successfully.');
    }
}
