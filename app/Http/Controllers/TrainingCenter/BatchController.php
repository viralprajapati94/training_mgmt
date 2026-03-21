<?php

namespace App\Http\Controllers\TrainingCenter;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\JobRole;
use App\Models\Sector;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BatchController extends Controller
{
    public function index(Request $request)
    {
        $tcId = auth()->user()->training_center_id;
        
        $query = Batch::with(['jobRole', 'sector'])
            ->where('training_center_id', $tcId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('jobRole', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $batches = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('tc/batches/index', [
            'batches' => $batches,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $tcId = auth()->user()->training_center_id;
        $tpId = auth()->user()->trainingCenter->tp_id ?? null;

        $sectors = Sector::where('status', true)->get(['id', 'name']);
        
        // Only active trainers for this TP/TC
        $trainers = Trainer::where('status', true)
            ->when($tpId, function($q) use ($tpId) {
                return $q->where('tp_id', $tpId);
            })
            ->get(['id', 'name', 'trainer_id']);

        return Inertia::render('tc/batches/create', [
            'sectors' => $sectors,
            'trainers' => $trainers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateBatch($request);

        DB::beginTransaction();
        try {
            $tcId = auth()->user()->training_center_id;
            $tpId = auth()->user()->trainingCenter->tp_id ?? null;

            $batchData = collect($validated)->except(['slots', 'trainers'])->toArray();
            $batchData['training_center_id'] = $tcId;
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

            return redirect()->route('tc.batches.index')->with('success', 'Batch created successfully as draft.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error creating batch: ' . $e->getMessage());
        }
    }

    public function edit(Batch $batch)
    {
        // Only draft or modified_by_tp can be edited
        if (!in_array($batch->status, ['draft', 'modified_by_tp'])) {
            abort(403, 'Batch cannot be edited in its current status.');
        }

        // Must belong to this TC
        if ($batch->training_center_id !== auth()->user()->training_center_id) {
            abort(403);
        }

        $batch->load(['slots', 'trainers']);

        $tcId = auth()->user()->training_center_id;
        $tpId = auth()->user()->trainingCenter->tp_id ?? null;

        $sectors = Sector::where('status', true)->get(['id', 'name']);
        
        // Active job roles for selected sector
        $jobRoles = JobRole::where('sector_id', $batch->sector_id)
            ->where('status', true)
            ->get(['id', 'name', 'qp_code', 'qp_version as version', 'nsqf_level']);

        $trainers = Trainer::where('status', true)
            ->when($tpId, function($q) use ($tpId) {
                return $q->where('tp_id', $tpId);
            })
            ->get(['id', 'name', 'trainer_id']);

        return Inertia::render('tc/batches/edit', [
            'batch' => $batch,
            'sectors' => $sectors,
            'jobRoles' => $jobRoles,
            'trainers' => $trainers,
        ]);
    }

    public function update(Request $request, Batch $batch)
    {
        // Only draft or modified_by_tp can be edited
        if (!in_array($batch->status, ['draft', 'modified_by_tp'])) {
            abort(403, 'Batch cannot be edited in its current status.');
        }

        if ($batch->training_center_id !== auth()->user()->training_center_id) {
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

            return redirect()->route('tc.batches.index')->with('success', 'Batch updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error updating batch: ' . $e->getMessage());
        }
    }

    public function submit(Request $request, Batch $batch)
    {
        if (!in_array($batch->status, ['draft', 'modified_by_tp'])) {
            abort(403, 'Only draft or modified batches can be submitted.');
        }

        if ($batch->training_center_id !== auth()->user()->training_center_id) {
            abort(403);
        }

        DB::beginTransaction();
        try {
            $batch->update(['status' => 'submitted']);

            $batch->approvalLogs()->create([
                'action' => 'submitted',
                'remarks' => $request->remarks ?? 'Submitted for approval',
                'action_by' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('tc.batches.index')->with('success', 'Batch submitted for approval.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error submitting batch: ' . $e->getMessage());
        }
    }

    public function destroy(Batch $batch)
    {
        if ($batch->status !== 'draft') {
            abort(403, 'Only draft batches can be deleted.');
        }

        if ($batch->training_center_id !== auth()->user()->training_center_id) {
            abort(403);
        }

        $batch->delete();

        return redirect()->route('tc.batches.index')->with('success', 'Batch deleted successfully.');
    }

    private function validateBatch(Request $request, ?Batch $batch = null)
    {
        $batchId = $batch ? $batch->id : 'NULL';
        
        $validated = $request->validate([
            'batch_number' => "required|string|max:100|unique:batches,batch_number,{$batchId}",
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
