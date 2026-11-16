<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;

class AuditObserver
{
    public function created(Model $model): void
    {
        $this->record('created', $model);
    }

    public function updated(Model $model): void
    {
        $this->record('updated', $model);
    }

    public function deleted(Model $model): void
    {
        $this->record('deleted', $model);
    }

    private function record(string $action, Model $model): void
    {
        if (!function_exists('activity')) {
            return;
        }
        $label = $model->getAttribute('title_fa')
            ?? $model->getAttribute('name_fa')
            ?? $model->getAttribute('name')
            ?? $model->getAttribute('contract_number')
            ?? ('#' . $model->getKey());

        activity('audit')
            ->performedOn($model)
            ->causedBy(auth()->user())
            ->withProperties([
                'action' => $action,
                'label' => $label,
                'ip_address' => request()?->ip() ?? '127.0.0.1',
            ])
            ->log("{$action} " . class_basename($model) . ": {$label}");
    }
}
