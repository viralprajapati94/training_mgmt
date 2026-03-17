<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProjectType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search');

        $projectTypes = ProjectType::query()
            ->when($search, fn ($query) => $query->where('type', 'like', "%{$search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/project-types/index', [
            'projectTypes' => $projectTypes,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/project-types/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'max:255', 'unique:project_types,type'],
            'status' => ['boolean'],
        ]);

        ProjectType::create([
            'type' => $data['type'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('project-types.index')->with('success', 'Project Type created successfully.');
    }

    public function edit(ProjectType $projectType): Response
    {
        return Inertia::render('admin/project-types/form', [
            'projectType' => $projectType,
        ]);
    }

    public function update(Request $request, ProjectType $projectType): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'max:255', 'unique:project_types,type,' . $projectType->id],
            'status' => ['boolean'],
        ]);

        $projectType->update([
            'type' => $data['type'],
            'status' => $data['status'] ?? true,
        ]);

        return to_route('project-types.index')->with('success', 'Project Type updated successfully.');
    }

    public function destroy(ProjectType $projectType): RedirectResponse
    {
        $projectType->delete();

        return back()->with('success', 'Project Type deleted successfully.');
    }
}
