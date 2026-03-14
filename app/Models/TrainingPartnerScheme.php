<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingPartnerScheme extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_partner_id',
        'state_id',
        'scheme_id',
        'approval_date',
        'expiry_date',
    ];

    protected $casts = [
        'approval_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function trainingPartner()
    {
        return $this->belongsTo(TrainingPartner::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function scheme()
    {
        return $this->belongsTo(Scheme::class);
    }
}
