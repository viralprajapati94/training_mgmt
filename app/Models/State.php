<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class State extends Model
{
    use HasFactory;

    protected $fillable = [
        'state',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function districts(): HasMany
    {
        return $this->hasMany(District::class);
    }

    public function talukas(): HasMany
    {
        return $this->hasMany(Taluka::class);
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    public function schemes(): HasMany
    {
        return $this->hasMany(Scheme::class);
    }
}
