'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  IconArrowLeft,
  IconChevronDown,
  IconDotsVertical,
  IconSearch
} from '@tabler/icons-react';

type InventoryView =
  | 'main'
  | 'edit-billing'
  | 'manage-price-lists'
  | 'new-price-list';

interface ProductCategory {
  id: string;
  name: string;
  businessName: string;
  enabled: boolean;
  hasBilling: boolean;
}

interface PriceList {
  id: string;
  name: string;
  productCount: number;
}

// Mock data
const mockCategories: ProductCategory[] = [
  {
    id: 'vaults',
    name: 'Vaults',
    businessName: 'Default Business Name',
    enabled: true,
    hasBilling: true
  },
  {
    id: 'precasts',
    name: 'Precasts (Bulk Vaults)',
    businessName: 'Default Business Name',
    enabled: true,
    hasBilling: true
  },
  {
    id: 'caskets',
    name: 'Caskets',
    businessName: 'Default Business Name',
    enabled: true,
    hasBilling: true
  },
  {
    id: 'grave-digging',
    name: 'Grave Digging',
    businessName: 'Default Business Name',
    enabled: false,
    hasBilling: false
  },
  {
    id: 'urns',
    name: 'Urns',
    businessName: 'Default Business Name',
    enabled: false,
    hasBilling: false
  },
  {
    id: 'monuments',
    name: 'Monuments',
    businessName: 'Default Business Name',
    enabled: true,
    hasBilling: true
  },
  {
    id: 'cremation',
    name: 'Cremation',
    businessName: 'Default Business Name',
    enabled: true,
    hasBilling: true
  }
];

const mockPriceLists: PriceList[] = [
  { id: '1', name: 'Standard Price List', productCount: 6 }
];

export function InventoryTab() {
  const [view, setView] = useState<InventoryView>('main');
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleToggleCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const handleEditBilling = (category: ProductCategory) => {
    setSelectedCategory(category);
    setView('edit-billing');
  };

  const handleManagePriceLists = (category: ProductCategory) => {
    setSelectedCategory(category);
    setView('manage-price-lists');
  };

  if (view === 'edit-billing' && selectedCategory) {
    return (
      <EditBillingForm
        category={selectedCategory}
        onBack={() => setView('main')}
        onSave={() => setView('main')}
      />
    );
  }

  if (view === 'manage-price-lists' && selectedCategory) {
    return (
      <ManagePriceLists
        category={selectedCategory}
        priceLists={mockPriceLists}
        onBack={() => setView('main')}
        onNewPriceList={() => setView('new-price-list')}
      />
    );
  }

  if (view === 'new-price-list' && selectedCategory) {
    return (
      <NewPriceListForm
        category={selectedCategory}
        onBack={() => setView('manage-price-lists')}
      />
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='p-0'>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className='flex w-full items-center justify-between p-6 text-left'>
              <h3 className='text-sm font-semibold text-foreground'>
                Product Categories Offered
              </h3>
              <IconChevronDown
                className={`size-5 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                stroke={1.5}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className='divide-y px-6 pb-6'>
                {categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onToggle={() => handleToggleCategory(category.id)}
                    onEditBilling={() => handleEditBilling(category)}
                    onManagePriceLists={() => handleManagePriceLists(category)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryRow({
  category,
  onToggle,
  onEditBilling,
  onManagePriceLists
}: {
  category: ProductCategory;
  onToggle: () => void;
  onEditBilling: () => void;
  onManagePriceLists: () => void;
}) {
  return (
    <div className='py-4 first:pt-0 last:pb-0'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-foreground'>{category.name}</p>
          <p className='text-sm text-muted-foreground'>{category.businessName}</p>
          {category.enabled && category.hasBilling && (
            <div className='mt-2 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={onEditBilling}
                  className='text-sm text-blue-600 hover:underline'
                >
                  Edit Billing Address
                </button>
                <button className='text-sm text-red-500 hover:underline'>
                  Reset Billing
                </button>
              </div>
              <button
                onClick={onManagePriceLists}
                className='text-sm text-blue-600 hover:underline'
              >
                Manage Price Lists
              </button>
            </div>
          )}
        </div>
        <Switch
          checked={category.enabled}
          onCheckedChange={onToggle}
          className='ml-4 data-[state=checked]:bg-emerald-500'
        />
      </div>
    </div>
  );
}

// Edit Billing Form Component
function EditBillingForm({
  category,
  onBack,
  onSave
}: {
  category: ProductCategory;
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
          ADD BILLING DETAILS
        </span>
      </button>

      <Card>
        <CardContent className='space-y-6 p-6'>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>
              {category.name}
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              All invoices for this category will be billed from this business
            </p>
          </div>

          <Input
            placeholder='Business Name'
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <Input
            placeholder='Country or Region'
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <Input
            placeholder='Address'
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <div className='grid grid-cols-2 gap-4'>
            <Input
              placeholder='Zip Code'
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
            <Input
              placeholder='City'
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
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

// Manage Price Lists Component
function ManagePriceLists({
  category,
  priceLists,
  onBack,
  onNewPriceList
}: {
  category: ProductCategory;
  priceLists: PriceList[];
  onBack: () => void;
  onNewPriceList: () => void;
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
          CONFIGURE PRICE LISTS
        </span>
      </button>

      <Card>
        <CardContent className='space-y-4 p-6'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>
                {category.name}
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Pricelist for {category.name.toLowerCase()}
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={onNewPriceList}>
              New Price List
            </Button>
          </div>

          <div className='space-y-3'>
            {priceLists.map((priceList) => (
              <div
                key={priceList.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div>
                  <p className='text-sm font-medium text-foreground'>
                    {priceList.name}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {priceList.productCount} Products
                  </p>
                </div>
                <Button variant='ghost' size='icon'>
                  <IconDotsVertical className='size-4' stroke={1.5} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// New Price List Form Component
function NewPriceListForm({
  category,
  onBack
}: {
  category: ProductCategory;
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
          CONFIGURE PRICE LISTS
        </span>
      </button>

      <Card>
        <CardContent className='space-y-6 p-6'>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>
              Create Price List
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Pricelist for {category.name.toLowerCase()}
            </p>
          </div>

          <Input
            placeholder='Name'
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <div className='flex items-center gap-2 border-b pb-2'>
            <IconSearch className='size-4 text-muted-foreground' stroke={1.5} />
            <input
              type='text'
              placeholder='Add Products'
              className='flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
