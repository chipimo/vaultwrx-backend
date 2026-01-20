'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { IconArrowLeft } from '@tabler/icons-react';

type BillingView = 'main' | 'add-card' | 'add-bank';

interface PaymentMethods {
  creditCards: boolean;
  achTransfer: boolean;
  onAccount: boolean;
}

export function BillingTab() {
  const [view, setView] = useState<BillingView>('main');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    creditCards: true,
    achTransfer: true,
    onAccount: true
  });

  const handleToggle = (method: keyof PaymentMethods) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  if (view === 'add-card') {
    return (
      <AddCardForm onBack={() => setView('main')} onSave={() => setView('main')} />
    );
  }

  if (view === 'add-bank') {
    return (
      <AddBankForm onBack={() => setView('main')} onDone={() => setView('main')} />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Payment Method to Vault Wrx */}
      <Card>
        <CardContent className='p-6'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              Payment Method to Vault Wrx
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              To securely accept credit card and ACH payments, connect your
              Stripe account. We never store sensitive payment details on our
              servers
            </p>
          </div>
          <div className='flex items-center gap-4 rounded-lg border p-4'>
            <StripeLogo />
            <span className='text-sm font-medium'>Connect Stripe</span>
          </div>
        </CardContent>
      </Card>

      {/* Enabled Payment Methods */}
      <Card>
        <CardContent className='p-6'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-foreground'>
              Enabled Payment Methods for Customers
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Choose which payment options are available for your funeral home
              customers.
            </p>
          </div>
          <div className='divide-y'>
            <PaymentMethodRow
              label='Credit Cards'
              checked={paymentMethods.creditCards}
              onToggle={() => handleToggle('creditCards')}
            />
            <PaymentMethodRow
              label='ACH / Direct Bank Transfer'
              checked={paymentMethods.achTransfer}
              onToggle={() => handleToggle('achTransfer')}
            />
            <PaymentMethodRow
              label='On Account (Monthly Invoicing)'
              checked={paymentMethods.onAccount}
              onToggle={() => handleToggle('onAccount')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentMethodRow({
  label,
  checked,
  onToggle
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className='flex items-center justify-between py-4 first:pt-0 last:pb-0'>
      <span className='text-sm text-foreground'>{label}</span>
      <Switch checked={checked} onCheckedChange={onToggle} className='data-[state=checked]:bg-emerald-500' />
    </div>
  );
}

function StripeLogo() {
  return (
    <svg
      viewBox='0 0 60 25'
      className='h-6 w-auto'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M5.66 9.13c0-.62.51-.86 1.35-.86.96 0 2.17.29 3.13.81V6.31c-1.05-.42-2.08-.58-3.13-.58-2.56 0-4.26 1.34-4.26 3.58 0 3.49 4.8 2.93 4.8 4.44 0 .73-.64 .97-1.53.97-1.32 0-3.01-.54-4.35-1.28v2.82c1.48.64 2.98.92 4.35.92 2.63 0 4.43-1.3 4.43-3.57-.01-3.77-4.79-3.09-4.79-4.48zM14.11 4.8l-2.83.6v9.58c0 1.77 1.33 3.08 3.1 3.08.98 0 1.7-.18 2.09-.4v-2.3c-.38.15-2.27.7-2.27-1.06V9.02h2.27V6.6h-2.27l-.09-1.8zM20.77 7.95l-.18-1.35h-2.52v10.84h2.92v-7.35c.69-.9 1.86-.74 2.23-.61V6.6c-.38-.14-1.76-.4-2.45.74v.61zM24.28 6.6h2.93v10.84h-2.93V6.6zM24.28 5.2l2.93-.63V2l-2.93.62v2.58zM34.46 6.6l-.18 1.11c-.64-.86-1.6-1.32-2.9-1.32-2.72 0-5.13 2.13-5.13 5.63s2.36 5.57 5.07 5.57c1.32 0 2.3-.46 2.96-1.32v1.11h2.93V6.6h-2.75zm-2.45 8.65c-1.33 0-2.46-1.05-2.46-2.84 0-1.78 1.13-2.84 2.46-2.84 1.31 0 2.45 1.06 2.45 2.84 0 1.79-1.14 2.84-2.45 2.84zM44.24 6.39c-1.4 0-2.3.66-2.87 1.11l-.19-.9h-2.57v14.56l2.93-.62v-3.53c.59.42 1.46.77 2.64.77 2.67 0 5.1-2.14 5.1-5.68.01-3.33-2.39-5.71-5.04-5.71zm-.59 8.84c-.88 0-1.4-.31-1.76-.7v-5.35c.38-.43.91-.78 1.76-.78 1.34 0 2.27 1.51 2.27 3.41 0 1.96-.92 3.42-2.27 3.42zM57.2 12.04c0-3.31-1.6-5.65-4.67-5.65-3.08 0-4.95 2.34-4.95 5.63 0 3.71 2.2 5.57 5.36 5.57 1.54 0 2.71-.35 3.59-.84v-2.2c-.88.44-1.9.71-3.18.71-1.26 0-2.38-.44-2.52-1.97h6.35c0-.17.02-.85.02-1.25zm-6.42-.92c0-1.47.9-2.08 1.72-2.08.8 0 1.64.61 1.64 2.08h-3.36z'
        fill='#635BFF'
      />
    </svg>
  );
}

// Add Card Form Component
function AddCardForm({
  onBack,
  onSave
}: {
  onBack: () => void;
  onSave: () => void;
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
          ADD PAYMENT DETAILS
        </span>
      </button>

      <Card>
        <CardHeader className='border-b bg-muted/30 py-4'>
          <CardTitle className='text-base font-medium'>Card Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 p-6'>
          <div>
            <Input placeholder='Card Number' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input placeholder='MM / YY' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
            <Input placeholder='CVV' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
          </div>

          <div className='pt-4'>
            <h4 className='mb-4 text-sm font-semibold'>Billing Address</h4>
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <Input placeholder='First Name' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
                <Input placeholder='Last Name' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
              </div>
              <Input placeholder='Address' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
              <Input placeholder='Country or Region' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
              <div className='grid grid-cols-2 gap-4'>
                <Input placeholder='Zip Code' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
                <Input placeholder='City' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Bank Account Form Component
function AddBankForm({
  onBack,
  onDone
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [accountType, setAccountType] = useState<'company' | 'individual'>('company');

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
          ADD PAYMENT DETAILS
        </span>
      </button>

      <Card>
        <CardHeader className='border-b bg-muted/30 py-4'>
          <CardTitle className='text-base font-medium'>Bank Account</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 p-6'>
          <Input placeholder='Account Holder Name' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
          <Input placeholder='Routing Number' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />
          <Input placeholder='Account Number' className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground' />

          <RadioGroup
            value={accountType}
            onValueChange={(value) => setAccountType(value as 'company' | 'individual')}
            className='flex gap-8'
          >
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='company' id='company' />
              <Label htmlFor='company' className='text-sm font-normal cursor-pointer'>
                Company
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='individual' id='individual' />
              <Label htmlFor='individual' className='text-sm font-normal cursor-pointer'>
                Individual
              </Label>
            </div>
          </RadioGroup>

          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={onDone}>Done</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
