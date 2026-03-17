<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingPartnerBankDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_partner_id',
        'bank_name',
        'branch_name',
        'account_holder_name',
        'account_number',
        'ifsc_code',
        'account_type',        
        'financial_year_1',
        'financial_turnover_1',
        'financial_year_2',
        'financial_turnover_2',
        'financial_year_3',
        'financial_turnover_3',
    ];

    protected $casts = [
        'financial_turnover_1' => 'decimal:2',
        'financial_turnover_2' => 'decimal:2',
        'financial_turnover_3' => 'decimal:2',
    ];

    public function trainingPartner()
    {
        return $this->belongsTo(TrainingPartner::class);
    }
}
