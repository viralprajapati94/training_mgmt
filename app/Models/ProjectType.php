<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectType extends Model
{
    protected $fillable = [
        'type',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];
}
