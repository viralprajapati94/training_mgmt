<?php

namespace App\Http\Controllers\TrainingPartner;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TrainerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Trainer::with(['trainingCenter'])
            ->where('tp_id', auth()->user()->training_partner_id);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('aadhaar_number', 'like', "%{$search}%")
                  ->orWhere('pan_number', 'like', "%{$search}%")
                  ->orWhere('gtr_id', 'like', "%{$search}%");
            });
        }

        $trainers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('trainers/index', [
            'trainers' => $trainers,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $trainingCenters = TrainingCenter::where('tp_id', auth()->user()->training_partner_id)
            ->where('status', true)
            ->get(['id', 'name']);

        return Inertia::render('trainers/create', [
            'trainingCenters' => $trainingCenters,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Basic Details
            'tc_id' => 'required|exists:training_centers,id',
            'trainer_id' => 'required|string|unique:trainers,trainer_id',
            'gtr_id' => 'required|string|unique:trainers,gtr_id',
            'name' => 'required|string|max:255',
            'aadhaar_number' => 'required|digits:12|unique:trainers,aadhaar_number',
            'pan_number' => ['required', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', 'unique:trainers,pan_number'],
            'email' => 'nullable|email|max:255',
            'mobile' => 'required|digits:10',
            
            // Documents
            'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        DB::beginTransaction();
        try {
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('trainers/photos', 'public');
            }

            $trainer = Trainer::create([
                'tp_id' => auth()->user()->training_partner_id,
                'tc_id' => $validated['tc_id'],
                'trainer_id' => $validated['trainer_id'],
                'gtr_id' => $validated['gtr_id'],
                'name' => $validated['name'],
                'aadhaar_number' => $validated['aadhaar_number'],
                'pan_number' => strtoupper($validated['pan_number']),
                'email' => $validated['email'],
                'mobile' => $validated['mobile'],
                'photo' => $photoPath,
                'status' => true,
            ]);

            DB::commit();
            return redirect()->route('tp.trainers.edit', ['trainer' => $trainer->id, 'tab' => 'communication'])
                ->with('success', 'Trainer basic details created successfully.')
                ->with('trainer_id', $trainer->id);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error creating trainer: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Trainer $trainer)
    {
        if ($trainer->tp_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        $trainer->load(['addresses']);
        
        $trainingCenters = TrainingCenter::where('tp_id', auth()->user()->training_partner_id)
            ->where('status', true)
            ->get(['id', 'name']);

        return Inertia::render('trainers/edit', [
            'trainer' => $trainer,
            'trainingCenters' => $trainingCenters,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trainer $trainer)
    {
        if ($trainer->tp_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        // Check if updating addresses
        if ($request->has('addresses')) {
            $validated = $request->validate([
                'addresses' => 'required|array|min:1|max:2',
                'addresses.*.type' => 'required|in:residential,communication',
                'addresses.*.address_line' => 'required|string',
                'addresses.*.state_id' => 'required|exists:states,id',
                'addresses.*.district_id' => 'required|exists:districts,id',
                'addresses.*.taluka_id' => 'required|exists:talukas,id',
                'addresses.*.city_id' => 'required|exists:cities,id',
                'addresses.*.pin_code' => 'required|digits:6',
                'addresses.*.is_same_as_residential' => 'boolean',
            ]);

            DB::beginTransaction();
            try {
                // Delete existing addresses to handle updates cleanly
                $trainer->addresses()->delete();

                foreach ($validated['addresses'] as $address) {
                    $trainer->addresses()->create($address);
                }

                DB::commit();
                return back()->with('success', 'Trainer addresses updated successfully.');
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->with('error', 'Error updating addresses: ' . $e->getMessage());
            }
        }

        // Otherwise it's a basic details update request
        $validated = $request->validate([
            // Basic Details
            'tc_id' => 'required|exists:training_centers,id',
            
            'gtr_id' => 'required|string|unique:trainers,gtr_id,' . $trainer->id,
            'name' => 'required|string|max:255',
            'aadhaar_number' => 'required|digits:12|unique:trainers,aadhaar_number,' . $trainer->id,
            'pan_number' => ['required', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', 'unique:trainers,pan_number,' . $trainer->id],
            'email' => 'nullable|email|max:255',
            'mobile' => 'required|digits:10',
            'status' => 'boolean',
            
            // Documents
            'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        DB::beginTransaction();
        try {
            $dataToUpdate = [
                'tc_id' => $validated['tc_id'],                
                'gtr_id' => $validated['gtr_id'],
                'name' => $validated['name'],
                'aadhaar_number' => $validated['aadhaar_number'],
                'pan_number' => strtoupper($validated['pan_number']),
                'email' => $validated['email'],
                'mobile' => $validated['mobile'],
                'status' => $validated['status'] ?? $trainer->status,
            ];

            if ($request->hasFile('photo')) {
                if ($trainer->photo) {
                    Storage::disk('public')->delete($trainer->photo);
                }
                $dataToUpdate['photo'] = $request->file('photo')->store('trainers/photos', 'public');
            }

            $trainer->update($dataToUpdate);

            DB::commit();
            
            // If requested via specific next tab logic
            if ($request->next_tab) {
                return redirect()->route('tp.trainers.edit', ['trainer' => $trainer->id, 'tab' => $request->next_tab])
                    ->with('success', 'Trainer basic details updated successfully.');
            }
            
            return back()->with('success', 'Trainer basic details updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error updating trainer: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trainer $trainer)
    {
        if ($trainer->tp_id !== auth()->user()->training_partner_id) {
            abort(403);
        }

        // Soft delete the trainer
        $trainer->delete();

        return redirect()->route('tp.trainers.index')->with('success', 'Trainer deleted successfully.');
    }
}
