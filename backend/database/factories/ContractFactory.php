<?php

namespace Database\Factories;

use App\Enums\ContractStatusEnum;
use App\Models\Contract;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContractFactory extends Factory
{
    protected $model = Contract::class;

    public function definition(): array
    {
        return [
            'contract_number' => 'CNT-' . $this->faker->unique()->numerify('1403-###'),
            'title_fa' => 'قرارداد ساخت و تأمین تجهیزات درون‌چاهی',
            'title_en' => 'Downhole Equipment Supply Contract',
            'client_fa' => 'شرکت ملی حفاری ایران',
            'client_en' => 'NIDC',
            'amount_billion_irr' => $this->faker->randomFloat(2, 50, 500),
            'start_year' => 1403,
            'status' => ContractStatusEnum::ACTIVE,
            'requires_auth' => true,
        ];
    }
}
