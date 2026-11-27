import React from 'react';
import { Cog } from 'lucide-react';
import { ContentRecordsAdminPage } from './ContentRecordsAdminPage.tsx';

export const MachineryAdminPage: React.FC = () => (
  <ContentRecordsAdminPage
    initialResource="machinery"
    lockedResource
    pageIcon={Cog}
    pageTitle="مدیریت ماشین‌آلات"
    pageDescription="مشخصات ماشین‌آلات را مدیریت کنید؛ تکمیل هیچ‌یک از فیلدها الزامی نیست."
  />
);
