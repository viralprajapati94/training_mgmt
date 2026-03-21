<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BatchTrainer extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'trainer_id',
        'is_certified',
        'mobile_number',
    ];

    protected $casts = [
        'is_certified' => 'boolean',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }
}
