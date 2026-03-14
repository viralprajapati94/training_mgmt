<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingPartnerDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_partner_id',
        'document_master_id',
        'file_path',
        'original_name',
    ];

    public function trainingPartner()
    {
        return $this->belongsTo(TrainingPartner::class);
    }

    public function documentMaster()
    {
        return $this->belongsTo(DocumentMaster::class);
    }
}
