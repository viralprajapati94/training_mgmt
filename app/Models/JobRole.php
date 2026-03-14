<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'sector_id',
        'name',
        'qp_code',
        'qp_version',
        'nsqf_level',
        'category',
        'training_hours',
        'ojt_hours',
        'total_hours',
        'cost_per_hour',
        'expiry_date',
        'syllabus_file',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'expiry_date' => 'date',
    ];

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }
}
