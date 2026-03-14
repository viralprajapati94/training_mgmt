<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sector extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function jobRoles(): HasMany
    {
        return $this->hasMany(JobRole::class);
    }
}
