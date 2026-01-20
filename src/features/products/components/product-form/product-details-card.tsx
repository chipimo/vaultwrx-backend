'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type ProductDetailsCardProps = {
  // Using a loose type here so we can componentize without fighting the large form schema.
  // If you want strict typing, we can move the schema/type into a shared module next.
  form: any;
};

export function ProductDetailsCard({ form }: ProductDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Product Details</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='type'
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className='text-muted-foreground text-xs'>
                  Type
                </FormLabel>
                <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                  <FormControl>
                    <SelectTrigger className='w-full rounded-none border-0 border-b px-0 focus-visible:ring-0 md:max-w-sm'>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Burial Vault'>Burial Vault</SelectItem>
                    <SelectItem value='Cremation Urn Vault'>
                      Cremation Urn Vault
                    </SelectItem>
                    <SelectItem value='Grave Liner'>Grave Liner</SelectItem>
                    <SelectItem value='Grave Box'>Grave Box</SelectItem>
                    <SelectItem value='Infant Vault'>Infant Vault</SelectItem>
                    <SelectItem value='Oversize Vault'>Oversize Vault</SelectItem>
                    <SelectItem value='Pet Vault'>Pet Vault</SelectItem>
                    <SelectItem value='Accessories'>Accessories</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='status'
            render={({ field }: any) => (
              <FormItem className='lg:hidden'>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className='text-muted-foreground text-xs'>
                  Category
                </FormLabel>
                <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                  <FormControl>
                    <SelectTrigger className='w-full rounded-none border-0 border-b px-0 focus-visible:ring-0'>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Sealer'>Sealer</SelectItem>
                    <SelectItem value='Non‑Sealer'>Non‑Sealer</SelectItem>
                    <SelectItem value='Unlined'>Unlined</SelectItem>
                    <SelectItem value='ABS/Polystyrene‑Lined'>
                      ABS/Polystyrene‑Lined
                    </SelectItem>
                    <SelectItem value='Stainless‑Steel‑Lined'>
                      Stainless‑Steel‑Lined
                    </SelectItem>
                    <SelectItem value='Bronze‑Lined'>Bronze‑Lined</SelectItem>
                    <SelectItem value='Standard Size'>Standard Size</SelectItem>
                    <SelectItem value='Oversize'>Oversize</SelectItem>
                    <SelectItem value='Accessories'>Accessories</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='name'
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className='text-muted-foreground text-xs'>
                  Product Name
                </FormLabel>
                <FormControl>
                  <Input
                    className='rounded-none border-0 border-b px-0 focus-visible:ring-0'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}


