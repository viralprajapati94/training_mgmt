<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainerAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id',
        'type',
        'address_line',
        'city_id',
        'taluka_id',
        'district_id',
        'state_id',
        'pin_code',
        'is_same_as_residential',
    ];

    protected $casts = [
        'is_same_as_residential' => 'boolean',
    ];

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
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
        return $this->belongsTo(Taluko::class, 'taluka_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
