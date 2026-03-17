<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingPartner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tp_id',
        'sip_id',
        'tp_name',
        'address',
        'state_id',
        'district_id',
        'taluka_id',
        'city_id',
        'pin_code',
        'email',
        'mobile',
        'website',
        'spoc_name',
        'spoc_mobile',
        'authorized_person_name',
        'authorized_person_mobile',
        'status',
        'gst_number',
        'pan_number',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function taluka()
    {
        return $this->belongsTo(Taluka::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function schemes()
    {
        return $this->hasMany(TrainingPartnerScheme::class);
    }

    public function bankDetail()
    {
        return $this->hasOne(TrainingPartnerBankDetail::class);
    }

    public function documents()
    {
        return $this->hasMany(TrainingPartnerDocument::class);
    }

    public function trainingCenters()
    {
        return $this->hasMany(TrainingCenter::class, 'tp_id');
    }
}
