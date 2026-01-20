'use client';

import { cn } from '@/lib/utils';
import {
  IconSettings,
  IconCreditCard,
  IconUsers,
  IconMapPin,
  IconPackage,
  IconBell,
  IconClipboardList,
  IconFileText
} from '@tabler/icons-react';

export type SettingsTab =
  | 'general'
  | 'billing'
  | 'staff'
  | 'locations'
  | 'inventory'
  | 'notifications'
  | 'surveys'
  | 'logs';

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const settingsTabs = [
  { id: 'general' as const, label: 'General', icon: IconSettings },
  { id: 'billing' as const, label: 'Billing', icon: IconCreditCard },
  { id: 'staff' as const, label: 'Users & Staff', icon: IconUsers },
  { id: 'locations' as const, label: 'Locations', icon: IconMapPin },
  { id: 'inventory' as const, label: 'Inventory', icon: IconPackage },
  { id: 'notifications' as const, label: 'Notifications', icon: IconBell },
  { id: 'surveys' as const, label: 'Surveys', icon: IconClipboardList },
  { id: 'logs' as const, label: 'Logs', icon: IconFileText }
];

export function SettingsSidebar({
  activeTab,
  onTabChange
}: SettingsSidebarProps) {
  return (
    <nav className='w-56 shrink-0 py-6 pr-6'>
      <ul className='space-y-1'>
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className='size-5' stroke={1.5} />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
