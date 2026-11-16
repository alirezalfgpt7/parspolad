<?php

namespace App\Http\Requests\AdminContent;

class UpdateAdminContentRecordRequest extends AdminContentRecordRequest
{
    protected function ability(): string
    {
        return 'update';
    }

    protected function ignoreId(): ?int
    {
        return (int) $this->route('id');
    }
}
