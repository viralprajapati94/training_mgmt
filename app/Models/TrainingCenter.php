<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingCenter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tp_id',
        'tc_id',
        'sip_id',
        'name',
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
        'authorized_mobile',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function trainingPartner()
    {
        return $this->belongsTo(TrainingPartner::class, 'tp_id');
    }

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
}
