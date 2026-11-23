import React from 'react';
import { Newspaper } from 'lucide-react';
import { ContentRecordsAdminPage } from './ContentRecordsAdminPage.tsx';

export const ArticlesAdminPage: React.FC = () => (
  <ContentRecordsAdminPage
    initialResource="articles"
    lockedResource
    pageIcon={Newspaper}
    pageTitle="مدیریت اخبار و مقالات"
    pageDescription="خبرها و مقاله‌های دوزبانه، دسته‌بندی، نویسنده، کاور و زمان انتشار را مدیریت کنید."
  />
);
