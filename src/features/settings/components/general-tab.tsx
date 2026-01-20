'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconPencil, IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import {
  getCompanyById,
  updateCompany,
  uploadCompanyLogo,
  getUserData,
  CompanyData,
  getApiBaseUrl
} from '@/lib/api-client';
import { toast } from 'sonner';

// Helper to get full URL for logo
function getLogoUrl(logoPath: string | null | undefined): string | null {
  if (!logoPath) return null;
  // If it's already a full URL (data URL or http), return as-is
  if (logoPath.startsWith('data:') || logoPath.startsWith('http')) {
    return logoPath;
  }
  // Otherwise, prepend the API base URL
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${logoPath}`;
}

type GeneralView = 'main' | 'edit';

export function GeneralTab() {
  const [view, setView] = useState<GeneralView>('main');
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const userData = getUserData();
      // Try multiple sources for company ID
      const companyId = userData?.company_id || 
                        userData?.retailer?.company?.id || 
                        userData?.owned_company_id;
      
      if (!companyId) {
        console.error('No company ID found in user data:', userData);
        toast.error('No company found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await getCompanyById(companyId);
      console.log('Company API response:', response);
      
      if (response.success && response.data) {
        // Ensure the company has an ID (use the companyId we fetched with if missing)
        const companyData = {
          ...response.data,
          id: response.data.id || companyId
        };
        console.log('Setting company data:', companyData);
        setCompany(companyData);
        if (response.data.logo) {
          // Convert relative path to full URL
          setLogo(getLogoUrl(response.data.logo));
        }
      } else {
        toast.error(response.error?.message || 'Failed to load company details');
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    if (!company?.id) {
      toast.error('No company ID available');
      return;
    }
    
    setUploadingLogo(true);
    try {
      const response = await uploadCompanyLogo(company.id, file);
      if (response.success && response.data) {
        // Convert relative path to full URL
        setLogo(getLogoUrl(response.data.logoUrl));
        toast.success('Logo uploaded successfully');
      } else {
        // If upload fails, try to update company with base64 or just show error
        toast.error(response.error?.message || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Failed to upload logo:', error);
      // Keep the preview even if upload fails
      toast.error('Logo upload failed - preview shown locally');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleEditDone = () => {
    fetchCompany();
    setView('main');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <IconLoader2 className='size-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (view === 'edit' && company && company.id) {
    return <EditAccountForm company={company} onBack={() => setView('main')} onDone={handleEditDone} />;
  }

  return (
    <div className='space-y-6'>
      {/* Account Details Card */}
      <Card className='overflow-hidden'>
        <CardHeader className='border-b bg-muted/30 py-4'>
          <CardTitle className='text-base font-medium'>
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className='relative p-6'>
          <div className='space-y-1 text-sm'>
            <p className='font-semibold text-foreground'>
              {company?.name || 'N/A'}
            </p>
            <p className='text-muted-foreground'>{company?.address || ''}</p>
            <p className='text-muted-foreground'>
              {[company?.phone, company?.email, company?.fax].filter(Boolean).join(' ')}
            </p>
            <p className='text-muted-foreground'>
              {[company?.city, company?.zipCode].filter(Boolean).join(', ')}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-4 top-1/2 -translate-y-1/2'
            onClick={() => {
              if (!company?.id) {
                toast.error('Cannot edit: Company data not loaded');
                return;
              }
              setView('edit');
            }}
          >
            <IconPencil className='size-4' stroke={1.5} />
            <span className='sr-only'>Edit account details</span>
          </Button>
        </CardContent>
      </Card>

      {/* Logo Upload Card */}
      <Card>
        <CardContent className='p-6'>
          <div
            onClick={handleLogoClick}
            className='relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 transition-colors hover:border-muted-foreground/40 hover:bg-muted/30'
          >
            {uploadingLogo && (
              <div className='absolute inset-0 flex items-center justify-center bg-background/50'>
                <IconLoader2 className='size-6 animate-spin text-muted-foreground' />
              </div>
            )}
            {logo ? (
              <div className='flex flex-col items-center gap-3'>
                <img
                  src={logo}
                  alt='Company logo'
                  className='max-h-16 max-w-[200px] object-contain'
                />
                <span className='text-xs text-muted-foreground'>
                  Click to change logo
                </span>
              </div>
            ) : (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  className='pointer-events-none mb-2'
                >
                  Add Logo
                </Button>
                <p className='text-xs text-muted-foreground'>
                  Accepts .gif, .jpg, and .png
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type='file'
            accept='.gif,.jpg,.jpeg,.png'
            onChange={handleFileChange}
            className='hidden'
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Edit Account Form Component
function EditAccountForm({
  company,
  onBack,
  onDone
}: {
  company: CompanyData;
  onBack: () => void;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name || '',
    address: company.address || '',
    phone: company.phone || '',
    email: company.email || '',
    fax: company.fax || '',
    city: company.city || '',
    state: company.state || '',
    zipCode: company.zipCode || '',
    description: company.description || ''
  });

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Company name is required');
      return;
    }

    if (!company.id) {
      console.error('Company ID is missing:', company);
      toast.error('Company ID is missing. Please refresh and try again.');
      return;
    }

    console.log('Updating company with ID:', company.id);
    setLoading(true);
    try {
      const response = await updateCompany(company.id, {
        name: formData.name,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        fax: formData.fax || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        description: formData.description || undefined
      });

      if (response.success) {
        toast.success('Account details updated successfully');
        onDone();
      } else {
        toast.error(response.error?.message || 'Failed to update account details');
      }
    } catch (error) {
      console.error('Failed to update company:', error);
      toast.error('Failed to update account details');
    } finally {
      setLoading(false);
    }
  };

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
          EDIT ACCOUNT DETAILS
        </span>
      </button>

      <Card>
        <CardContent className='space-y-6 p-6'>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>Account Details</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Update your company information
            </p>
          </div>

          <Input
            placeholder='Company Name *'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <Input
            placeholder='Address'
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <div className='grid grid-cols-3 gap-4'>
            <Input
              placeholder='City'
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
            <Input
              placeholder='State'
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
            <Input
              placeholder='Zip Code'
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <Input
              placeholder='Phone Number'
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
            <Input
              placeholder='Email'
              type='email'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
          </div>

          <Input
            placeholder='Fax Number'
            value={formData.fax}
            onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <Input
            placeholder='Description (optional)'
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={onBack} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <IconLoader2 className='mr-2 size-4 animate-spin' /> : null}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
