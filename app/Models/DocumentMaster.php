<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentMaster extends Model
{
    use HasFactory;

    protected $table = 'documents_master';

    protected $fillable = [
        'document_name',
        'role_type',
        'is_required',
        'status',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'status' => 'boolean',
    ];
}
