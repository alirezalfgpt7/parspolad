<?php

namespace App\Services;

use RuntimeException;
use ZipArchive;

class MediaContentValidator
{
    private const MAX_BYTES = 25 * 1024 * 1024;

    public function validate(string $filename, string $content): string
    {
        abort_unless(strlen($content) <= self::MAX_BYTES, 422, 'حداکثر حجم مجاز فایل ۲۵ مگابایت است.');

        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mimeType = (new \finfo(FILEINFO_MIME_TYPE))->buffer($content) ?: 'application/octet-stream';

        $valid = match ($extension) {
            'pdf' => str_starts_with($content, '%PDF-') && $mimeType === 'application/pdf',
            'docx' => $this->isOfficeArchive($content, 'word/document.xml'),
            'xlsx' => $this->isOfficeArchive($content, 'xl/workbook.xml'),
            'zip' => $this->isZipArchive($content),
            'dwg' => preg_match('/^AC10\d{2}/', $content) === 1,
            'mp4' => substr($content, 4, 4) === 'ftyp',
            'webm' => str_starts_with($content, "\x1A\x45\xDF\xA3"),
            'jpg', 'jpeg' => str_starts_with($content, "\xFF\xD8\xFF") && $mimeType === 'image/jpeg',
            'png' => str_starts_with($content, "\x89PNG\r\n\x1A\n") && $mimeType === 'image/png',
            'gif' => (str_starts_with($content, 'GIF87a') || str_starts_with($content, 'GIF89a'))
                && $mimeType === 'image/gif',
            'webp' => substr($content, 0, 4) === 'RIFF'
                && substr($content, 8, 4) === 'WEBP'
                && $mimeType === 'image/webp',
            default => false,
        };

        abort_unless($valid, 422, 'محتوای فایل با پسوند آن مطابقت ندارد یا این فرمت پشتیبانی نمی‌شود.');

        return $mimeType;
    }

    private function isOfficeArchive(string $content, string $requiredEntry): bool
    {
        return $this->inspectArchive($content, static fn (ZipArchive $archive): bool =>
            $archive->locateName('[Content_Types].xml') !== false
                && $archive->locateName($requiredEntry) !== false
        );
    }

    private function isZipArchive(string $content): bool
    {
        return $this->inspectArchive($content, static fn (ZipArchive $archive): bool => $archive->numFiles > 0);
    }

    private function inspectArchive(string $content, callable $inspect): bool
    {
        if (! class_exists(ZipArchive::class)) {
            throw new RuntimeException('The PHP zip extension is required to validate this file type.');
        }

        $path = tempnam(sys_get_temp_dir(), 'media-upload-');
        if ($path === false) {
            throw new RuntimeException('Unable to allocate a temporary file for archive validation.');
        }

        try {
            if (file_put_contents($path, $content) === false) {
                throw new RuntimeException('Unable to write the temporary file for archive validation.');
            }

            $archive = new ZipArchive;
            if ($archive->open($path, ZipArchive::RDONLY) !== true) {
                return false;
            }

            try {
                return $inspect($archive);
            } finally {
                $archive->close();
            }
        } finally {
            if (is_file($path) && ! unlink($path)) {
                throw new RuntimeException('Unable to remove the temporary archive-validation file.');
            }
        }
    }
}
