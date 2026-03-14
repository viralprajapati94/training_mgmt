<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Taluka extends Model
{
    use HasFactory;

    protected $fillable = [
        'state_id',
        'district_id',
        'taluko',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
