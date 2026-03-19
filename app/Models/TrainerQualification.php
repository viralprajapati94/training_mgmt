<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerQualification extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id',
        'sector_id',
        'job_role_id',
        'qp_code',
        'version',
        'training_type',
        'is_certified',
        'certificate_number',
        'certificate_file',
    ];

    protected $casts = [
        'is_certified' => 'boolean',
    ];

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function jobRole(): BelongsTo
    {
        return $this->belongsTo(JobRole::class);
    }
}
