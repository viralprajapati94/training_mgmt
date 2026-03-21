<?php

namespace App\Http\Controllers\TrainingPartner;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\JobRole;
use App\Models\Sector;
use App\Models\Trainer;
use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BatchController extends Controller
{
    public function index(Request $request)
    {
        $tpId = auth()->user()->training_partner_id;
        
        $query = Batch::with(['jobRole', 'sector', 'trainingCenter'])
            ->where('training_partner_id', $tpId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('batch_number', 'like', "%{$search}%")
                  ->orWhereHas('jobRole', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('trainingCenter', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $batches = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('tp/batches/index', [
            'batches' => $batches,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $tpId = auth()->user()->training_partner_id;

        $sectors = Sector::where('status', true)->get(['id', 'name']);
        
        $trainingCenters = TrainingCenter::where('tp_id', $tpId)
            ->where('status', true)
            ->get(['id', 'name']);
            
        $trainers = Trainer::where('status', true)
            ->where('tp_id', $tpId)
            ->get(['id', 'name', 'trainer_id']);

        return Inertia::render('tp/batches/create', [
            'sectors' => $sectors,
            'trainers' => $trainers,
            'trainingCenters' => $trainingCenters,
            'isTP' => true,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateBatch($request);

        DB::beginTransaction();
        try {
            $tpId = auth()->user()->training_partner_id;

            $batchData = collect($validated)->except(['slots', 'trainers'])->toArray();
            $batchData['training_partner_id'] = $tpId;
            $batchData['status'] = 'draft';
            $batchData['created_by'] = auth()->id();

            $batch = Batch::create($batchData);

            // Create slots
            foreach ($validated['slots'] as $slot) {
                $batch->slots()->create($slot);
            }

            // Create trainers
            foreach ($validated['trainers'] as $trainer) {
                $batch->trainers()->create($trainer);
            }

            DB::commit();

            return redirect()->route('tp.batches.index')->with('success', 'Batch created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error creating batch: ' . $e->getMessage());
        }
    }

    public function edit(Batch $batch)
    {
        // TP can always edit their batches
        if ($batch->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $batch->load(['slots', 'trainers']);

        $tpId = auth()->user()->training_partner_id;

        $sectors = Sector::where('status', true)->get(['id', 'name']);
        
        $jobRoles = JobRole::where('sector_id', $batch->sector_id)
            ->where('status', true)
            ->get(['id', 'name', 'qp_code', 'qp_version as version', 'nsqf_level']);

        $trainingCenters = TrainingCenter::where('tp_id', $tpId)
            ->where('status', true)
            ->get(['id', 'name']);

        $trainers = Trainer::where('status', true)
            ->where('tp_id', $tpId)
            ->get(['id', 'name', 'trainer_id']);

        return Inertia::render('tp/batches/edit', [
            'batch' => $batch,
            'sectors' => $sectors,
            'jobRoles' => $jobRoles,
            'trainers' => $trainers,
            'trainingCenters' => $trainingCenters,
            'isTP' => true,
        ]);
    }

    public function update(Request $request, Batch $batch)
    {
        // TP can update anytime
        if ($batch->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $validated = $this->validateBatch($request, $batch);

        DB::beginTransaction();
        try {
            $batchData = collect($validated)->except(['slots', 'trainers'])->toArray();
            $batchData['updated_by'] = auth()->id();

            $batch->update($batchData);

            // Recreate slots
            $batch->slots()->delete();
            foreach ($validated['slots'] as $slot) {
                $batch->slots()->create($slot);
            }

            // Recreate trainers
            $batch->trainers()->delete();
            foreach ($validated['trainers'] as $trainer) {
                $batch->trainers()->create($trainer);
            }

            DB::commit();

            return redirect()->route('tp.batches.index')->with('success', 'Batch updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error updating batch: ' . $e->getMessage());
        }
    }

    public function destroy(Batch $batch)
    {
        if ($batch->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $batch->delete();

        return redirect()->route('tp.batches.index')->with('success', 'Batch deleted successfully.');
    }

    public function approve(Request $request, Batch $batch)
    {
        if ($batch->status !== 'submitted') {
            abort(403, 'Only submitted batches can be approved.');
        }

        if ($batch->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        DB::beginTransaction();
        try {
            $batch->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            $batch->approvalLogs()->create([
                'action' => 'approved',
                'remarks' => $request->remarks ?? 'Batch approved by TP',
                'action_by' => auth()->id(),
            ]);

            DB::commit();

            return back()->with('success', 'Batch approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error approving batch: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, Batch $batch)
    {
        if ($batch->status !== 'submitted') {
            abort(403, 'Only submitted batches can be rejected.');
        }

        if ($batch->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $request->validate([
            'remarks' => 'required|string|min:5',
        ]);

        DB::beginTransaction();
        try {
            $batch->update([
                'status' => 'rejected',
                'remarks' => $request->remarks,
            ]);

            $batch->approvalLogs()->create([
                'action' => 'rejected',
                'remarks' => $request->remarks,
                'action_by' => auth()->id(),
            ]);

            DB::commit();

            return back()->with('success', 'Batch rejected successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error rejecting batch: ' . $e->getMessage());
        }
    }

    public function modify(Request $request, Batch $batch)
    {
        if ($batch->status !== 'submitted') {
            abort(403, 'Only submitted batches can be returned for modification.');
        }

        if ($batch->training_partner_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $request->validate([
            'remarks' => 'required|string|min:5',
        ]);

        DB::beginTransaction();
        try {
            $batch->update([
                'status' => 'modified_by_tp',
                'remarks' => $request->remarks,
            ]);

            $batch->approvalLogs()->create([
                'action' => 'modified',
                'remarks' => $request->remarks,
                'action_by' => auth()->id(),
            ]);

            DB::commit();

            return back()->with('success', 'Batch sent back for modification.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error modifying batch: ' . $e->getMessage());
        }
    }

    private function validateBatch(Request $request, ?Batch $batch = null)
    {
        $batchId = $batch ? $batch->id : 'NULL';
        
        $validated = $request->validate([
            'batch_number' => "required|string|max:100|unique:batches,batch_number,{$batchId}",
            'training_center_id' => 'required|exists:training_centers,id',
            'training_type' => 'required|string',
            'batch_type' => 'required|string',
            'batch_size' => 'required|integer|min:1',
            'job_role_id' => 'required|exists:job_roles,id',
            'sector_id' => 'required|exists:sectors,id',
            'qp_code' => 'required|string',
            'nsqf_level' => 'required|string',
            'version' => 'required|string',
            'education_requirement' => 'nullable|string',
            'training_hours_per_day' => 'required|numeric|min:0.5|max:24',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'freeze_date' => 'nullable|date',
            
            'target_available' => 'nullable|integer|min:0',
            'eligible_to_create' => 'nullable|integer|min:0',
            'registered_to_enroll' => 'nullable|integer|min:0',
            'enrolled_so_far' => 'nullable|integer|min:0',

            // Slots array
            'slots' => 'required|array|min:1',
            'slots.*.start_time' => 'required|date_format:H:i',
            'slots.*.end_time' => 'required|date_format:H:i|after:slots.*.start_time',
            'slots.*.hours' => 'required|numeric|min:0',

            // Trainers array
            'trainers' => 'required|array|min:1',
            'trainers.*.trainer_id' => 'required|exists:trainers,id',
            'trainers.*.is_certified' => 'boolean',
            'trainers.*.mobile_number' => 'nullable|string',
        ]);

        // Default empty numeric values to 0 for DB
        $numericFields = ['target_available', 'eligible_to_create', 'registered_to_enroll', 'enrolled_so_far'];
        foreach ($numericFields as $field) {
            if (!isset($validated[$field]) || $validated[$field] === '') {
                $validated[$field] = 0;
            }
        }

        return $validated;
    }
}
