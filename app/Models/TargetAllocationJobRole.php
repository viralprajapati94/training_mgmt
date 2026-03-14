<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TargetAllocationJobRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'target_allocation_id',
        'sector_id',
        'job_role_id',
        'qp_code',
        'nsqf_level',
        'training_hours',
        'target',
        'target_validity_months',
    ];

    public function targetAllocation()
    {
        return $this->belongsTo(TargetAllocation::class);
    }

    public function sector()
    {
        return $this->belongsTo(Sector::class);
    }

    public function jobRole()
    {
        return $this->belongsTo(JobRole::class);
    }
}
