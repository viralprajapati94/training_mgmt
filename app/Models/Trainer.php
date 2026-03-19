<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trainer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tp_id',
        'tc_id',
        'trainer_id',
        'gtr_id',
        'name',
        'aadhaar_number',
        'pan_number',
        'email',
        'mobile',
        'photo',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function trainingPartner()
    {
        return $this->belongsTo(TrainingPartner::class, 'tp_id');
    }

    public function trainingCenter()
    {
        return $this->belongsTo(TrainingCenter::class, 'tc_id');
    }

    public function addresses()
    {
        return $this->hasMany(TrainerAddress::class);
    }

    public function qualifications()
    {
        return $this->hasMany(TrainerQualification::class);
    }

   
}
