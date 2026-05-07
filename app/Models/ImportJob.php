<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ImportJob extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'type',
        'file_name',
        'status',
        'total_rows',
        'success_count',
        'error_count',
        'created_by',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function errors(): HasMany
    {
        return $this->hasMany(ImportJobError::class);
    }
}
