<?php

namespace App\Http\Requests\AdminContent;

class StoreAdminContentRecordRequest extends AdminContentRecordRequest
{
    protected function ability(): string
    {
        return 'create';
    }
}
