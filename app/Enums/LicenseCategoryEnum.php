<?php

namespace App\Enums;

enum LicenseCategoryEnum: string
{
    case ISO = 'iso';
    case API = 'api';
    case KNOWLEDGE_BASED = 'knowledge_based';
    case ASSOCIATION = 'association';
}
