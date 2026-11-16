<?php

namespace Database\Factories;

use App\Enums\NotificationChannelEnum;
use App\Models\NotificationTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationTemplateFactory extends Factory
{
    protected $model = NotificationTemplate::class;

    public function definition(): array
    {
        return [
            'event_key' => 'event-' . $this->faker->unique()->numberBetween(1, 99999),
            'name_fa' => 'قالب اعلان',
            'channel' => NotificationChannelEnum::EMAIL,
            'subject_fa' => 'اعلان سامانه',
            'body_html' => '<p>اعلان آزمایشی</p>',
            'sms_text' => null,
            'is_active' => true,
        ];
    }
}
