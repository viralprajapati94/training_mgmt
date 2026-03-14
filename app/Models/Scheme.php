<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scheme extends Model
{
    use HasFactory;

    protected $fillable = [
        'state_id',
        'name',
        'code',
        'logo',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }
}
