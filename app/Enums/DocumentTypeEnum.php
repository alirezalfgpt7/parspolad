<?php

namespace App\Enums;

enum DocumentTypeEnum: string
{
    case CONTRACT_PDF = 'contract_pdf';
    case LICENSE_CERT = 'license_cert';
    case ENGINEERING_DWG = 'engineering_dwg';
    case DATASHEET = 'datasheet';
    case QC_REPORT = 'qc_report';
}
