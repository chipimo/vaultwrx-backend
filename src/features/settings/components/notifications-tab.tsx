'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { IconArrowLeft, IconChevronRight, IconChevronDown } from '@tabler/icons-react';

type NotificationsView = 'main' | 'contacts' | 'notifications';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface NotificationSettings {
  remotePrint: boolean;
  emailFuneralContact: boolean;
  emailRetailer: boolean;
  textFuneralContact: boolean;
  textRetailer: boolean;
}

// Mock data
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane.smith@stellarfunerals.com',
    phone: '+260 898 656 230'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@stellarfunerals.com',
    phone: '+260 898 656 230'
  }
];

const notificationCategories = [
  { id: 'new-orders', label: 'New Orders' },
  { id: 'assigned-orders', label: 'Assigned Orders' },
  { id: 'delivered-orders', label: 'Delivered Orders' },
  { id: 'non-delivered-orders', label: 'Non Delivered Orders' },
  { id: '24-hour', label: '24 Hour Notifications' },
  { id: '12-hour', label: '12 Hour Notifications' }
];

export function NotificationsTab() {
  const [view, setView] = useState<NotificationsView>('main');
  const [contacts] = useState<Contact[]>(mockContacts);

  if (view === 'contacts') {
    return (
      <ContactsView
        contacts={contacts}
        onBack={() => setView('main')}
      />
    );
  }

  if (view === 'notifications') {
    return (
      <NotificationsDetailView onBack={() => setView('main')} />
    );
  }

  return (
    <div className='space-y-4'>
      <Card
        className='cursor-pointer transition-colors hover:bg-muted/50'
        onClick={() => setView('contacts')}
      >
        <CardContent className='flex items-center justify-between p-4'>
          <span className='text-sm font-medium'>Contacts ({contacts.length})</span>
          <IconChevronRight className='size-5 text-muted-foreground' stroke={1.5} />
        </CardContent>
      </Card>

      <Card
        className='cursor-pointer transition-colors hover:bg-muted/50'
        onClick={() => setView('notifications')}
      >
        <CardContent className='flex items-center justify-between p-4'>
          <span className='text-sm font-medium'>Notifications</span>
          <IconChevronRight className='size-5 text-muted-foreground' stroke={1.5} />
        </CardContent>
      </Card>
    </div>
  );
}

// Contacts View Component
function ContactsView({
  contacts,
  onBack
}: {
  contacts: Contact[];
  onBack: () => void;
}) {
  return (
    <div className='space-y-6'>
      <button
        onClick={onBack}
        className='flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground'
      >
        <IconArrowLeft className='size-4' stroke={1.5} />
        <span
          className='font-serif tracking-widest'
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          CONTACTS
        </span>
      </button>

      <Card>
        <CardContent className='p-6'>
          <div className='mb-4 flex items-start justify-between'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>Contacts</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                They will get notifications on app activity
              </p>
            </div>
            <Button variant='outline' size='sm'>
              Add Contacts
            </Button>
          </div>
          <div className='space-y-3'>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className='flex items-center gap-8 rounded-lg border p-4'
              >
                <div>
                  <p className='text-sm font-medium text-foreground'>
                    {contact.name}
                  </p>
                  <p className='text-sm text-muted-foreground'>{contact.email}</p>
                </div>
                <p className='text-sm text-muted-foreground'>{contact.phone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Notifications Detail View Component
function NotificationsDetailView({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    remotePrint: true,
    emailFuneralContact: true,
    emailRetailer: true,
    textFuneralContact: true,
    textRetailer: true
  });
  const [openSections, setOpenSections] = useState<string[]>(['new-orders']);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className='space-y-4'>
      <button
        onClick={onBack}
        className='flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground'
      >
        <IconArrowLeft className='size-4' stroke={1.5} />
        <span
          className='font-serif tracking-widest'
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          NOTIFICATIONS
        </span>
      </button>

      {/* New Orders - Expandable */}
      <Card>
        <Collapsible
          open={openSections.includes('new-orders')}
          onOpenChange={() => toggleSection('new-orders')}
        >
          <CollapsibleTrigger className='flex w-full items-center justify-between p-4'>
            <span className='text-sm font-medium'>New Orders</span>
            <IconChevronDown
              className={`size-5 text-muted-foreground transition-transform ${
                openSections.includes('new-orders') ? 'rotate-180' : ''
              }`}
              stroke={1.5}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='space-y-4 px-4 pb-4'>
              {/* Remote Print */}
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm text-muted-foreground'>Remote Print</span>
                <Switch
                  checked={settings.remotePrint}
                  onCheckedChange={() => toggleSetting('remotePrint')}
                  className='data-[state=checked]:bg-emerald-500'
                />
              </div>

              {/* Emails Section */}
              <div className='rounded-lg border p-4'>
                <h4 className='mb-3 text-sm font-medium'>Emails</h4>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Funeral Contact
                    </span>
                    <Switch
                      checked={settings.emailFuneralContact}
                      onCheckedChange={() => toggleSetting('emailFuneralContact')}
                      className='data-[state=checked]:bg-emerald-500'
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Retailer</span>
                    <Switch
                      checked={settings.emailRetailer}
                      onCheckedChange={() => toggleSetting('emailRetailer')}
                      className='data-[state=checked]:bg-emerald-500'
                    />
                  </div>
                </div>
              </div>

              {/* Text Messages Section */}
              <div className='rounded-lg border p-4'>
                <h4 className='mb-3 text-sm font-medium'>Text Messages</h4>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Funeral Contact
                    </span>
                    <Switch
                      checked={settings.textFuneralContact}
                      onCheckedChange={() => toggleSetting('textFuneralContact')}
                      className='data-[state=checked]:bg-emerald-500'
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Retailer</span>
                    <Switch
                      checked={settings.textRetailer}
                      onCheckedChange={() => toggleSetting('textRetailer')}
                      className='data-[state=checked]:bg-emerald-500'
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Other notification categories */}
      {notificationCategories.slice(1).map((category) => (
        <Card
          key={category.id}
          className='cursor-pointer transition-colors hover:bg-muted/50'
        >
          <CardContent className='flex items-center justify-between p-4'>
            <span className='text-sm font-medium'>{category.label}</span>
            <IconChevronRight
              className='size-5 text-muted-foreground'
              stroke={1.5}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
