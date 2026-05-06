<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportJobError extends Model
{
    use HasFactory;

    public const CREATED_AT = null;
    public const UPDATED_AT = null;

    protected $fillable = [
        'import_job_id',
        'row_number',
        'raw_data',
        'error_message',
    ];

    protected $casts = [
        'raw_data' => 'array',
    ];

    public function importJob(): BelongsTo
    {
        return $this->belongsTo(ImportJob::class);
    }
}
