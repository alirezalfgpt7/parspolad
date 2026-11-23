import React from 'react';
import { Package } from 'lucide-react';
import { ContentRecordsAdminPage } from './ContentRecordsAdminPage.tsx';

export const ProductsAdminPage: React.FC = () => (
  <ContentRecordsAdminPage
    initialResource="products"
    lockedResource
    pageIcon={Package}
    pageTitle="مدیریت محصولات"
    pageDescription="اطلاعات دوزبانه، مشخصات فنی، تصویر و فایل‌های کاتالوگ محصولات را مدیریت کنید."
  />
);
