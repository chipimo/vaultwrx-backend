'use client';

import { useState } from 'react';
import { SettingsSidebar, SettingsTab } from './settings-sidebar';
import { GeneralTab } from './general-tab';
import { BillingTab } from './billing-tab';
import { StaffTab } from './staff-tab';
import { LocationsTab } from './locations-tab';
import { InventoryTab } from './inventory-tab';
import { NotificationsTab } from './notifications-tab';
import { LogsTab } from './logs-tab';

const tabTitles: Record<SettingsTab, string> = {
  general: 'GENERAL',
  billing: 'BILLING & PAYMENTS',
  staff: 'USERS & STAFF',
  locations: 'LOCATIONS',
  inventory: 'INVENTORY',
  notifications: 'NOTIFICATIONS',
  surveys: 'SURVEYS',
  logs: 'LOGS'
};

export function SettingsViewPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />;
      case 'billing':
        return <BillingTab />;
      case 'staff':
        return <StaffTab />;
      case 'locations':
        return <LocationsTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'surveys':
        return <ComingSoonTab title='Surveys' />;
      case 'logs':
        return <LogsTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <div className='flex min-h-[calc(100vh-4rem)]'>
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className='flex-1 py-6'>
        <h1
          className='mb-8 font-serif text-2xl tracking-widest'
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          {tabTitles[activeTab]}
        </h1>
        <div className='max-w-2xl'>{renderTabContent()}</div>
      </div>
    </div>
  );
}

function ComingSoonTab({ title }: { title: string }) {
  return (
    <div className='flex h-64 items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/10'>
      <p className='text-muted-foreground'>
        {title} settings coming soon...
      </p>
    </div>
  );
}
