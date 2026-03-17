<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobRole;
use App\Models\Sector;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class JobRoleController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search');
        $sectorId = $request->input('sector_id');

        $jobRoles = JobRole::with('sector')
            ->when($search, fn ($query) => $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('qp_code', 'like', "%{$search}%")))
            ->when($sectorId, fn ($query) => $query->where('sector_id', $sectorId))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/job-roles/index', [
            'jobRoles' => $jobRoles,
            'sectors' => Sector::select('id', 'name')->orderBy('name')->get(),
            'filters' => [
                'search' => $search,
                'sector_id' => $sectorId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/job-roles/form', [
            'sectors' => Sector::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sector_id' => ['required', 'exists:sectors,id'],
            'name' => ['required', 'string', 'max:255'],
            'qp_code' => ['nullable', 'string', 'max:255'],
            'qp_version' => ['nullable', 'string', 'max:255'],
            'nsqf_level' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'training_hours' => ['nullable', 'integer'],
            'ojt_hours' => ['nullable', 'integer'],
            'total_hours' => ['nullable', 'integer'],
            'cost_per_hour' => ['nullable', 'numeric'],
            'expiry_date' => ['nullable', 'date'],
            'syllabus_file' => ['nullable', 'file', 'max:4096'],
            'status' => ['boolean'],
        ]);

        $syllabusPath = $request->file('syllabus_file')?->store('job_roles', 'public');

        JobRole::create([
            ...collect($data)->except('syllabus_file')->toArray(),
            'syllabus_file' => $syllabusPath,
            'status' => $data['status'] ?? true,
        ]);

        return to_route('job-roles.index')->with('success', 'Job Role created successfully.');
    }

    public function edit(JobRole $jobRole): Response
    {
        return Inertia::render('admin/job-roles/form', [
            'jobRole' => $jobRole,
            'sectors' => Sector::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, JobRole $jobRole): RedirectResponse
    {
        $data = $request->validate([
            'sector_id' => ['sometimes','required','exists:sectors,id'],
            'name' => ['sometimes','required','string','max:255'],
            'qp_code' => ['nullable','string','max:255'],
            'qp_version' => ['nullable','string','max:255'],
            'nsqf_level' => ['nullable','string','max:255'],
            'category' => ['nullable','string','max:255'],
            'training_hours' => ['nullable','integer'],
            'ojt_hours' => ['nullable','integer'],
            'total_hours' => ['nullable','integer'],
            'cost_per_hour' => ['nullable','numeric'],
            'expiry_date' => ['nullable','date'],
            'syllabus_file' => ['nullable','file','max:4096'],
            'status' => ['boolean'],
        ]);

        $syllabusPath = $jobRole->syllabus_file;

        if ($request->hasFile('syllabus_file')) {
            if ($jobRole->syllabus_file) {
                Storage::disk('public')->delete($jobRole->syllabus_file);
            }

            $syllabusPath = $request->file('syllabus_file')->store('job_roles','public');
        }
        
        $jobRole->update([
            'sector_id' => $request['sector_id'],
            'name' => $request['name'],
            'qp_code' => $request['qp_code'],
            'qp_version' => $request['qp_version'],
            'nsqf_level' => $request['nsqf_level'],
            'category' => $request['category'],
            'training_hours' => $request['training_hours'],
            'ojt_hours' => $request['ojt_hours'],
            'total_hours' => $request['total_hours'],
            'cost_per_hour' => $request['cost_per_hour'],
            'expiry_date' => $request['expiry_date'],
            'syllabus_file' => $syllabusPath,
            'status' => $request->boolean('status'),
        ]);

        return to_route('job-roles.index')->with('success','Job Role updated successfully.');
    }

    public function destroy(JobRole $jobRole): RedirectResponse
    {
        if ($jobRole->syllabus_file) {
            Storage::disk('public')->delete($jobRole->syllabus_file);
        }

        $jobRole->delete();

        return back()->with('success', 'Job Role deleted successfully.');
    }

    public function uploadSyllabus(Request $request, JobRole $jobRole): RedirectResponse
    {
        $request->validate([
            'syllabus_file' => ['required', 'file', 'max:4096'],
        ]);

        if ($jobRole->syllabus_file) {
            Storage::disk('public')->delete($jobRole->syllabus_file);
        }

        $syllabusPath = $request->file('syllabus_file')->store('job_roles', 'public');
        $jobRole->update(['syllabus_file' => $syllabusPath]);

        return back()->with('success', 'Syllabus uploaded successfully.');
    }
}
