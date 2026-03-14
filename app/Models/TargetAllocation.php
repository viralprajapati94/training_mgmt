<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TargetAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_partner_id',
        'work_order_no',
        'scheme_id',
        'project_type',
        'assessment_body_id',
        'project_duration_from',
        'project_duration_to',
        'agreement_date',
        'status',
    ];

    protected $casts = [
        'project_duration_from' => 'date',
        'project_duration_to' => 'date',
        'agreement_date' => 'date',
        'status' => 'boolean',
    ];

    public function trainingPartner()
    {
        return $this->belongsTo(TrainingPartner::class);
    }

    public function scheme()
    {
        return $this->belongsTo(Scheme::class);
    }

    public function assessmentBody()
    {
        return $this->belongsTo(AssessmentBody::class);
    }

    public function centers()
    {
        return $this->hasMany(TargetAllocationCenter::class);
    }

    public function jobRoles()
    {
        return $this->hasMany(TargetAllocationJobRole::class);
    }
}
