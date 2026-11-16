<?php

namespace App\Enums;

enum SlideTextAnimationEnum: string
{
    case SPLIT_TEXT = 'split-text';
    case TYPEWRITER = 'typewriter';
    case FADE_UP = 'fade-up';
    case MASK_REVEAL = 'mask-reveal';
}
