<?php

namespace App\Http\Controllers\TrainingPartner;

use App\Http\Controllers\Controller;
use App\Models\AssessmentBody;
use App\Models\JobRole;
use App\Models\ProjectType;
use App\Models\Scheme;
use App\Models\Sector;
use App\Models\TargetAllocation;
use App\Models\TargetAllocationCenter;
use App\Models\TargetAllocationJobRole;
use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TargetAllocationController extends Controller
{
    public function index()
    {
        $allocations = TargetAllocation::with(['scheme', 'assessmentBody'])
            ->where('training_partner_id', auth()->user()->training_partner_id)
            ->latest()
            ->paginate(10);

        return Inertia::render('target-allocations/index', [
            'allocations' => $allocations,
        ]);
    }

    public function create()
    {
        return Inertia::render('target-allocations/create', $this->getLookups());
    }

    public function storeProjectDetails(Request $request)
    {
        $validated = $request->validate([
            'work_order_no' => 'required|string|max:255',
            'scheme_id' => 'required|exists:schemes,id',
            'project_type' => 'required|exists:project_types,type',
            'assessment_body_id' => 'required|exists:assessment_bodies,id',
            'project_duration_from' => 'required|date',
            'project_duration_to' => 'required|date|after_or_equal:project_duration_from',
            'agreement_date' => 'required|date',
            'implementing_organisation_name' => 'required|string|max:255',
        ]);

        $allocation = TargetAllocation::create(array_merge($validated, [
            'training_partner_id' => auth()->user()->training_partner_id,
            'status' => true,
        ]));

        return redirect()->route('tp.target-allocations.edit', $allocation->id)
            ->with('success', 'Project details saved. Please proceed to center selection.');
    }

    public function edit(TargetAllocation $target_allocation)
    {
        if ($target_allocation->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $target_allocation->load(['centers.trainingCenter.state', 'centers.trainingCenter.district', 'jobRoles.sector', 'jobRoles.jobRole']);

        return Inertia::render('target-allocations/edit', array_merge([
            'allocation' => $target_allocation,
            'trainingCenters' => TrainingCenter::with(['state', 'district'])
                ->where('tp_id', auth()->user()->training_partner_id)
                ->where('status', true)
                ->get(),
        ], $this->getLookups()));
    }

    public function addCenter(Request $request, TargetAllocation $target_allocation)
    {
        if ($target_allocation->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $validated = $request->validate([
            'training_center_id' => 'required|exists:training_centers,id',
            'proposed_target' => 'required|integer|min:1',
            'target_validity_months' => 'required|integer|min:1',
        ]);

        // Check if center belongs to this TP
        $center = TrainingCenter::where('id', $validated['training_center_id'])
            ->where('tp_id', auth()->user()->training_partner_id)
            ->firstOrFail();

        TargetAllocationCenter::updateOrCreate(
            [
                'target_allocation_id' => $target_allocation->id,
                'training_center_id' => $validated['training_center_id'],
            ],
            [
                'proposed_target' => $validated['proposed_target'],
                'target_validity_months' => $validated['target_validity_months'],
            ]
        );

        return back()->with('success', 'Training Center assigned successfully.');
    }

    public function addJobRoleTarget(Request $request, TargetAllocation $target_allocation)
    {
        if ($target_allocation->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $validated = $request->validate([
            'sector_id' => 'required|exists:sectors,id',
            'job_role_id' => 'required|exists:job_roles,id',
            'target' => 'required|integer|min:1',
            'target_validity_months' => 'required|integer|min:1',
        ]);

        $jobRole = JobRole::findOrFail($validated['job_role_id']);

        // Check total proposed targets against total job role targets
        $totalCenterTarget = TargetAllocationCenter::where('target_allocation_id', $target_allocation->id)->sum('proposed_target');
        $existingJobRoleTarget = TargetAllocationJobRole::where('target_allocation_id', $target_allocation->id)->sum('target');
        
        if (($existingJobRoleTarget + $validated['target']) > $totalCenterTarget) {
            return back()->with('error', 'Total job role targets cannot exceed the Total Proposed Target of TCs.');
        }

        TargetAllocationJobRole::create([
            'target_allocation_id' => $target_allocation->id,
            'sector_id' => $validated['sector_id'],
            'job_role_id' => $validated['job_role_id'],
            'qp_code' => $jobRole->qp_code,
            'nsqf_level' => $jobRole->nsqf_level,
            'training_hours' => $jobRole->training_hours,
            'target' => $validated['target'],
            'target_validity_months' => $validated['target_validity_months'],
        ]);

        return back()->with('success', 'Job Role target assigned successfully.');
    }

    public function update(Request $request, TargetAllocation $target_allocation)
    {
        if ($target_allocation->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $validated = $request->validate([
            'work_order_no' => 'required|string|max:255',
            'scheme_id' => 'required|exists:schemes,id',
            'project_type' => 'required|exists:project_types,type',
            'assessment_body_id' => 'required|exists:assessment_bodies,id',
            'project_duration_from' => 'required|date',
            'project_duration_to' => 'required|date|after_or_equal:project_duration_from',
            'agreement_date' => 'required|date',
            'implementing_organisation_name' => 'required|string|max:255',
        ]);

        $target_allocation->update($validated);

        return back()->with('success', 'Project details updated successfully.');
    }

    public function removeCenter(TargetAllocation $target_allocation, $center_id)
    {
        if ($target_allocation->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        TargetAllocationCenter::where('id', $center_id)
            ->where('target_allocation_id', $target_allocation->id)
            ->delete();

        return back()->with('success', 'Training Center removed successfully.');
    }

    public function removeJobRoleTarget(TargetAllocation $target_allocation, $job_role_target_id)
    {
        if ($target_allocation->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        TargetAllocationJobRole::where('id', $job_role_target_id)
            ->where('target_allocation_id', $target_allocation->id)
            ->delete();

        return back()->with('success', 'Job Role removed successfully.');
    }

    protected function getLookups()
    {
        return [
            'schemes' => Scheme::select('id', 'name')->where('status', true)->get(),
            'assessmentBodies' => AssessmentBody::select('id', 'name')->where('status', true)->get(),
            'sectors' => Sector::select('id', 'name')->where('status', true)->get(),
            'jobRoles' => JobRole::select('id', 'name', 'sector_id', 'qp_code', 'nsqf_level', 'training_hours')->where('status', true)->get(),
            'projectTypes' => ProjectType::select('id', 'type as label', 'type as value')->where('status', true)->get(),
        ];
    }
}
