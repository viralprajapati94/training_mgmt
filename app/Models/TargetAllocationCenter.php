<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TargetAllocationCenter extends Model
{
    use HasFactory;

    protected $fillable = [
        'target_allocation_id',
        'training_center_id',
        'proposed_target',
        'target_validity_months',
    ];

    public function targetAllocation()
    {
        return $this->belongsTo(TargetAllocation::class);
    }

    public function trainingCenter()
    {
        return $this->belongsTo(TrainingCenter::class);
    }
}
