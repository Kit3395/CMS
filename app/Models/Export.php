<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Export extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'type',
        'filter_params',
        'file_path',
        'created_by',
    ];

    protected $casts = [
        'filter_params' => 'array',
    ];
}
