<?php

namespace App\Http\Controllers\TrainingPartner;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\District;
use App\Models\DocumentMaster;
use App\Models\Scheme;
use App\Models\State;
use App\Models\Taluka;
use App\Models\TrainingPartner;
use App\Models\TrainingPartnerBankDetail;
use App\Models\TrainingPartnerDocument;
use App\Models\TrainingPartnerScheme;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TrainingPartnerController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'state_id', 'district_id']);

        $partners = TrainingPartner::query()
            ->with(['state', 'district'])
            ->when($filters['search'] ?? null, function (Builder $query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('tp_name', 'like', "%{$search}%")
                        ->orWhere('tp_id', 'like', "%{$search}%")
                        ->orWhere('sip_id', 'like', "%{$search}%");
                });
            })
            ->when($filters['state_id'] ?? null, fn ($q, $state) => $q->where('state_id', $state))
            ->when($filters['district_id'] ?? null, fn ($q, $district) => $q->where('district_id', $district))
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('training-partners/index', [
            'partners' => $partners,
            'filters' => $filters,
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('training-partners/create', $this->formLookups());
    }

    public function storeBasicDetails(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        $tp = null;
        DB::transaction(function () use ($data, $request, &$tp) {
            $user = User::create([
                'name' => $data['tp_name'],
                'email' => $data['email'],
                'password' => Hash::make($request->input('password')),
            ]);
            $user->assignRole('training_partner');

            $tp = TrainingPartner::create(array_merge($data, [
                'user_id' => $user->id,
            ]));
            
            $user->update(['training_partner_id' => $tp->id]);
        });

        return redirect()->route('training-partners.edit', [
            'training_partner' => $tp->id,
            'tab' => 'schemes'
        ])->with('success', 'Basic Details saved successfully.');
    }

    public function edit(TrainingPartner $training_partner): Response
    {
        $training_partner->load(['schemes', 'bankDetail', 'documents.documentMaster']);

        return Inertia::render('training-partners/edit', array_merge([
            'partner' => $training_partner,
        ], $this->formLookups()));
    }

    public function updateBasicDetails(Request $request, TrainingPartner $training_partner): RedirectResponse
    {
        $data = $this->validatedData($request, $training_partner->id, $training_partner->user_id);

        DB::transaction(function () use ($training_partner, $data, $request) {
            $training_partner->update($data);

            if ($training_partner->user_id) {
                $user = User::find($training_partner->user_id);
                if ($user) {
                    $user->update([
                        'name' => $data['tp_name'],
                        'email' => $data['email'],
                    ]);
                    if ($request->filled('password')) {
                        $user->update(['password' => Hash::make($request->input('password'))]);
                    }
                }
            }
        });

        if ($request->query('next_tab')) {
            return redirect()->route('training-partners.edit', [
                'training_partner' => $training_partner->id,
                'tab' => $request->query('next_tab')
            ])->with('success', 'Basic Details updated successfully.');
        }

        return redirect()->route('training-partners.index')->with('success', 'Basic Details updated successfully.');
    }

    public function storeSchemeMapping(Request $request, TrainingPartner $training_partner): RedirectResponse
    {
        $request->validate([
            'schemes' => ['array'],
            'schemes.*.state_id' => ['nullable', 'exists:states,id'],
            'schemes.*.scheme_id' => ['required', 'exists:schemes,id'],
            'schemes.*.approval_date' => ['required', 'date'],
            'schemes.*.expiry_date' => ['nullable', 'date'],
        ]);

        $this->syncSchemes($training_partner, $request->input('schemes', []));

        if ($request->query('next_tab')) {
            return redirect()->route('training-partners.edit', [
                'training_partner' => $training_partner->id,
                'tab' => $request->query('next_tab')
            ])->with('success', 'Schemes updated successfully.');
        }

        return back()->with('success', 'Schemes updated successfully.');
    }

    public function deleteSchemeMapping(TrainingPartner $training_partner, $mapping_id): RedirectResponse
    {
        $training_partner->schemes()->where('id', $mapping_id)->delete();
        return back()->with('success', 'Scheme mapping deleted successfully.');
    }

    public function updateBankDetails(Request $request, TrainingPartner $training_partner): RedirectResponse
    {
        $request->validate([
            'bank_detail' => ['array'],
            // Add specific validations if needed
        ]);

        $this->saveBankDetail($training_partner, $request->input('bank_detail', []));

        if ($request->query('next_tab')) {
            return redirect()->route('training-partners.edit', [
                'training_partner' => $training_partner->id,
                'tab' => $request->query('next_tab')
            ])->with('success', 'Bank Details updated successfully.');
        }

        return back()->with('success', 'Bank Details updated successfully.');
    }

    public function updateDocuments(Request $request, TrainingPartner $training_partner): RedirectResponse
    {
        $this->saveDocuments($training_partner, $request->file('documents', []));

        if ($request->query('next_tab')) {
            return redirect()->route('training-partners.edit', [
                'training_partner' => $training_partner->id,
                'tab' => $request->query('next_tab')
            ])->with('success', 'Documents updated successfully.');
        }

        return back()->with('success', 'Documents updated successfully.');
    }

    public function destroy(TrainingPartner $training_partner): RedirectResponse
    {
        $training_partner->delete();
        return redirect()->route('training-partners.index')->with('success', 'Training Partner deleted successfully.');
    }

    protected function validatedData(Request $request, ?int $id = null, ?int $userId = null): array
    {
        return $request->validate([
            'tp_id' => ['required', 'string', 'max:50', Rule::unique('training_partners', 'tp_id')->ignore($id)],
            'sip_id' => ['nullable', 'string', 'max:50'],
            'tp_name' => ['required', 'string', 'max:191'],
            'address' => ['nullable', 'string'],
            'state_id' => ['nullable', 'exists:states,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'taluka_id' => ['nullable', 'exists:talukas,id'],
            'city_id' => ['nullable', 'exists:cities,id'],
            'pin_code' => ['nullable', 'string', 'max:10'],
            'email' => ['required', 'email', 'max:191', Rule::unique('training_partners', 'email')->ignore($id), Rule::unique('users', 'email')->ignore($userId)],
            'mobile' => ['required', 'string', 'max:20'],
            'website' => ['nullable', 'string', 'max:191'],
            'spoc_name' => ['nullable', 'string', 'max:191'],
            'spoc_mobile' => ['nullable', 'string', 'max:20'],
            'authorized_person_name' => ['nullable', 'string', 'max:191'],
            'authorized_person_mobile' => ['nullable', 'string', 'max:20'],
            'password' => [$id ? 'nullable' : 'required', 'string', 'min:6'],
            'status' => ['sometimes', 'boolean'],
        ], [
            'password.required' => 'Password is required when creating a training partner',
        ]);
    }

    protected function formLookups(): array
    {
        return [
            'states' => State::select('id', 'state')->orderBy('state')->get(),
            'districts' => District::select('id', 'district', 'state_id')->orderBy('district')->get(),
            'talukas' => Taluka::select('id', 'taluko', 'district_id', 'state_id')->orderBy('taluko')->get(),
            'cities' => City::select('id', 'city', 'taluka_id', 'district_id', 'state_id')->orderBy('city')->get(),
            'schemes' => Scheme::select('id', 'name')->orderBy('name')->get(),
            'documents' => DocumentMaster::where('role_type', 'training_partner')->where('status', true)->select('id', 'document_name')->orderBy('document_name')->get(),
        ];
    }

    protected function syncSchemes(TrainingPartner $tp, array $schemes): void
    {
        $tp->schemes()->delete();
        $payload = [];
        foreach ($schemes as $scheme) {
            if (!isset($scheme['scheme_id']) || !isset($scheme['approval_date'])) {
                continue;
            }
            $payload[] = new TrainingPartnerScheme([
                'state_id' => $scheme['state_id'] ?? null,
                'scheme_id' => $scheme['scheme_id'],
                'approval_date' => $scheme['approval_date'],
                'expiry_date' => $scheme['expiry_date'] ?? null,
            ]);
        }
        if (!empty($payload)) {
            $tp->schemes()->saveMany($payload);
        }
    }

    protected function saveBankDetail(TrainingPartner $tp, array $data): void
    {
        if (empty($data)) {
            return;
        }

        $tp->bankDetail()->updateOrCreate([], [
            'bank_name' => $data['bank_name'] ?? null,
            'branch_name' => $data['branch_name'] ?? null,
            'account_holder_name' => $data['account_holder_name'] ?? null,
            'account_number' => $data['account_number'] ?? null,
            'ifsc_code' => $data['ifsc_code'] ?? null,
            'account_type' => $data['account_type'] ?? null,
            'gst_number' => $data['gst_number'] ?? null,
            'pan_number' => $data['pan_number'] ?? null,
            'tan_number' => $data['tan_number'] ?? null,
            'cin_number' => $data['cin_number'] ?? null,
            'msme_number' => $data['msme_number'] ?? null,
            'udyam_number' => $data['udyam_number'] ?? null,
            'financial_year_1' => $data['financial_year_1'] ?? null,
            'financial_turnover_1' => $data['financial_turnover_1'] ?? null,
            'financial_year_2' => $data['financial_year_2'] ?? null,
            'financial_turnover_2' => $data['financial_turnover_2'] ?? null,
            'financial_year_3' => $data['financial_year_3'] ?? null,
            'financial_turnover_3' => $data['financial_turnover_3'] ?? null,
        ]);
    }

    protected function saveDocuments(TrainingPartner $tp, array $files): void
    {
        if (empty($files)) {
            return;
        }

        foreach ($files as $docId => $file) {
            if (!$file) {
                continue;
            }
            $path = $file->store('documents/training-partners', 'public');
            TrainingPartnerDocument::updateOrCreate(
                [
                    'training_partner_id' => $tp->id,
                    'document_master_id' => $docId,
                ],
                [
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                ]
            );
        }
    }
}
