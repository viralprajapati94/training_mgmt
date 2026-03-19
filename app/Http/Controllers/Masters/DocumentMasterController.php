<?php

namespace App\Http\Controllers\Masters;

use App\Http\Controllers\Controller;
use App\Models\DocumentMaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentMasterController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role_type']);
        $roleTypes = ['training_partner', 'training_center', 'trainer' ,'student'];

        $documents = DocumentMaster::query()
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where('document_name', 'like', "%{$search}%"))
            ->when($filters['role_type'] ?? null, fn ($q, $role) => $q->where('role_type', $role))
            ->orderBy('document_name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('masters/document-master/index', [
            'documents' => $documents,
            'filters' => $filters,
            'roleTypes' => $roleTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        DocumentMaster::create($data);

        return redirect()->route('masters.document-master.index')->with('success', 'Document added successfully.');
    }

    public function update(Request $request, DocumentMaster $document_master): RedirectResponse
    {
        $data = $this->validatedData($request, $document_master->id);
        $document_master->update($data);

        return redirect()->route('masters.document-master.index')->with('success', 'Document updated successfully.');
    }

    public function destroy(DocumentMaster $document_master): RedirectResponse
    {
        $document_master->delete();

        return redirect()->route('masters.document-master.index')->with('success', 'Document deleted successfully.');
    }

    protected function validatedData(Request $request, ?int $ignoreId = null): array
    {
        $roleTypes = ['training_partner', 'training_center', 'trainer', 'student'];

        $validated = $request->validate([
            'document_name' => [
                'required',
                'string',
                'max:125',
                Rule::unique('documents_master')
                    ->where(fn ($q) => $q->where('role_type', $request->input('role_type')))
                    ->ignore($ignoreId),
            ],
            'role_type' => ['required', Rule::in($roleTypes)],
            'is_required' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'boolean'],
        ]);

        $validated['is_required'] = $request->boolean('is_required');
        $validated['status'] = $request->boolean('status', true);

        return $validated;
    }
}
