<?php

namespace App\Http\Requests\AdminContent;

use App\Support\AdminContentRegistry;
use App\Models\Department;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class AdminContentRecordRequest extends FormRequest
{
    abstract protected function ability(): string;

    protected function ignoreId(): ?int
    {
        return null;
    }

    public function authorize(): bool
    {
        $resource = (string) $this->route('resource');
        $modelClass = AdminContentRegistry::modelClass($resource);

        return $this->user()?->can($this->ability(), [$modelClass, $resource]) ?? false;
    }

    public function rules(): array
    {
        $resource = (string) $this->route('resource');
        $model = new (AdminContentRegistry::modelClass($resource));
        $ignoreId = $this->ignoreId();

        if ($resource === 'faqs') {
            return [
                'question_fa' => [$ignoreId === null ? 'required' : 'sometimes', 'string', 'max:500'],
                'question_en' => ['nullable', 'string', 'max:500'],
                'answer_fa' => [$ignoreId === null ? 'required' : 'sometimes', 'string', 'max:10000'],
                'answer_en' => ['nullable', 'string', 'max:10000'],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'is_active' => ['sometimes', 'boolean'],
            ];
        }

        $columns = collect($model->getConnection()->getSchemaBuilder()->getColumns($model->getTable()))->keyBy('name');
        $uniqueFields = match ($resource) {
            'categories', 'services', 'products', 'articles', 'pages' => ['slug'],
            'kpis' => ['key'],
            'notification-templates' => ['event_key'],
            default => [],
        };
        $rules = [];

        foreach ($model->getFillable() as $field) {
            $column = $columns->get($field, []);
            $cast = $model->getCasts()[$field] ?? null;
            $columnType = strtolower((string) ($column['type_name'] ?? $column['type'] ?? ''));
            $isRequired = in_array($field, AdminContentRegistry::requiredFields($resource), true)
                || (($column['nullable'] ?? true) === false && ($column['default'] ?? null) === null);
            $fieldRules = $ignoreId === null
                ? [$isRequired ? 'required' : 'sometimes']
                : ($isRequired ? ['sometimes', 'required'] : ['sometimes']);

            if (! $isRequired) {
                $fieldRules[] = 'nullable';
            }

            if (in_array($cast, ['boolean', 'bool'], true) || in_array($columnType, ['boolean', 'bool'], true)) {
                $fieldRules[] = 'boolean';
            } elseif (in_array($cast, ['array', 'json', 'object', 'collection'], true) || in_array($columnType, ['json', 'jsonb'], true)) {
                $fieldRules[] = 'array';
            } elseif (in_array($cast, ['integer', 'int'], true) || preg_match('/int/', $columnType) === 1) {
                $fieldRules[] = 'integer';
            } elseif (preg_match('/decimal|numeric|float|double/', $columnType) === 1 || in_array($cast, ['float', 'double', 'decimal'], true)) {
                $fieldRules[] = 'numeric';
            } else {
                $fieldRules[] = 'string';
                $fieldRules[] = 'max:10000';
            }

            if (in_array($field, $uniqueFields, true)) {
                $unique = Rule::unique($model->getTable(), $field);
                if ($ignoreId !== null) {
                    $unique->ignore($ignoreId);
                }
                if (isset($columns['deleted_at'])) {
                    $unique->withoutTrashed();
                }
                $fieldRules[] = $unique;
            }

            $rules[$field] = $fieldRules;
        }

        if ($resource === 'departments') {
            $rules['parent_id'][] = Rule::exists('departments', 'id')->whereNull('deleted_at');
            if ($ignoreId !== null) {
                $rules['parent_id'][] = Rule::notIn([$ignoreId]);
                $rules['parent_id'][] = function (string $attribute, mixed $value, \Closure $fail) use ($ignoreId): void {
                    if ($value === null || $value === '') {
                        return;
                    }

                    $descendantIds = [];
                    $frontier = [(int) $ignoreId];
                    $visited = $frontier;
                    while ($frontier !== []) {
                        $children = Department::query()
                            ->whereIn('parent_id', $frontier)
                            ->whereNotIn('id', $visited)
                            ->pluck('id')
                            ->map(fn ($id): int => (int) $id)
                            ->all();
                        $descendantIds = [...$descendantIds, ...$children];
                        $visited = [...$visited, ...$children];
                        $frontier = $children;
                    }

                    if (in_array((int) $value, $descendantIds, true)) {
                        $fail('واحد بالادست نمی‌تواند یکی از زیرواحدهای همین واحد باشد.');
                    }
                };
            }
        } elseif ($resource === 'team') {
            $rules['department_id'][] = Rule::exists('departments', 'id')->whereNull('deleted_at');
        }

        return $rules;
    }
}
