<?php

namespace App\Http\Controllers\TrainingPartner;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\District;
use App\Models\State;
use App\Models\Taluka;
use App\Models\TrainingCenter;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TrainingCenterController extends Controller
{
    public function index(Request $request): Response
    {
        $query = TrainingCenter::with(['state', 'district'])
            ->where('tp_id', auth()->user()->training_partner_id);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('tc_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $trainingCenters = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('training-centers/index', [
            'trainingCenters' => $trainingCenters,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('training-centers/create', $this->formLookups());
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        DB::transaction(function () use ($data, $request) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($request->input('password')),
                'training_partner_id' => auth()->user()->training_partner_id,
            ]);
            $user->assignRole('training_center');

            $tc = TrainingCenter::create(array_merge($data, [
                'user_id' => $user->id,
                'tp_id' => auth()->user()->training_partner_id,
            ]));

            $user->update([
                'training_center_id' => $tc->id,
            ]);
        });

        return redirect()->route('tp.training-centers.index')->with('success', 'Training Center created successfully.');
    }

    public function edit(TrainingCenter $training_center): Response
    {
        if ($training_center->tp_id !== auth()->user()->training_partner_id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('training-centers/edit', array_merge([
            'trainingCenter' => $training_center,
        ], $this->formLookups()));
    }

    public function update(Request $request, TrainingCenter $training_center): RedirectResponse
    {
        if ($training_center->tp_id !== auth()->user()->training_partner_id) {
            abort(403, 'Unauthorized action.');
        }

        $data = $this->validatedData($request, $training_center->id, $training_center->user_id);

        DB::transaction(function () use ($training_center, $data, $request) {
            $training_center->update($data);

            if ($training_center->user_id) {
                $user = User::find($training_center->user_id);
                if ($user) {
                    $user->update([
                        'name' => $data['name'],
                        'email' => $data['email'],
                    ]);
                    if ($request->filled('password')) {
                        $user->update(['password' => Hash::make($request->input('password'))]);
                    }
                }
            }
        });

        return redirect()->route('tp.training-centers.index')->with('success', 'Training Center updated successfully.');
    }

    public function destroy(TrainingCenter $training_center): RedirectResponse
    {
        if ($training_center->tp_id !== auth()->user()->training_partner_id) {
            abort(403, 'Unauthorized action.');
        }

        $training_center->delete();
        if ($training_center->user_id) {
            User::where('id', $training_center->user_id)->delete();
        }

        return redirect()->route('tp.training-centers.index')->with('success', 'Training Center deleted successfully.');
    }

    protected function formLookups(): array
    {
        return [
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
            'talukas' => Taluka::select('id', 'taluko', 'district_id', 'state_id')->orderBy('taluko')->get(),
            'cities' => City::select('id', 'city', 'taluka_id', 'district_id', 'state_id')->orderBy('city')->get(),
        ];
    }

    protected function validatedData(Request $request, ?int $id = null, ?int $userId = null): array
    {
        return $request->validate([
            'tc_id' => ['required', 'string', 'max:50', Rule::unique('training_centers', 'tc_id')->ignore($id)],
            'sip_id' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:191'],
            'address' => ['nullable', 'string'],
            'state_id' => ['nullable', 'exists:states,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'taluka_id' => ['nullable', 'exists:talukas,id'],
            'city_id' => ['nullable', 'exists:cities,id'],
            'pin_code' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:191', Rule::unique('training_centers', 'email')->ignore($id), Rule::unique('users', 'email')->ignore($userId)],
            'mobile' => ['required', 'string', 'max:20'],
            'website' => ['nullable', 'string', 'max:191'],
            'spoc_name' => ['nullable', 'string', 'max:100'],
            'spoc_mobile' => ['nullable', 'string', 'max:20'],
            'authorized_person_name' => ['nullable', 'string', 'max:100'],
            'authorized_mobile' => ['nullable', 'string', 'max:20'],
            'password' => [$id ? 'nullable' : 'required', 'string', 'min:6'],
            'status' => ['sometimes', 'boolean'],
        ]);
    }
}
