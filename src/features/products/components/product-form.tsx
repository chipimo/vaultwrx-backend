'use client';

import React from 'react';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Product } from '@/constants/mock-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  IconPlus,
  IconChevronDown,
  IconX
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
// Dialog shell extracted into VariantEditDialog component
import { ProductFormHeader } from '@/features/products/components/product-form/product-form-header';
import { ProductDetailsCard } from '@/features/products/components/product-form/product-details-card';
import { PricingCard } from '@/features/products/components/product-form/pricing-card';
import { VariantEditDialog } from '@/features/products/components/product-form/variant-edit-dialog';
import { ManageLocationsDialog } from '@/features/products/components/product-form/manage-locations-dialog';
import type { PriceList, PriceListEntry } from '@/types/catalog';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const formSchema = z.object({
  // Product details
  type: z.string().min(1, { message: 'Please select a type.' }),
  name: z
    .string()
    .min(2, { message: 'Product name must be at least 2 characters.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  description: z.string().optional(),
  // Pricing
  standardPrice: z
    .number()
    .nonnegative({ message: 'Price must be 0 or more.' }),
  // Price Lists
  priceLists: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        include: z.boolean(),
        price: z.number().nonnegative()
      })
    )
    .default([]),
  // Status
  status: z.enum(['active', 'draft', 'inactive']).default('active'),
  // Media
  images: z
    .any()
    .refine(
      (files) => !files || files?.length <= 10,
      'You can upload up to 10 files.'
    )
    .refine(
      (files) => !files || files?.every?.((f: File) => f.size <= MAX_FILE_SIZE),
      `Each file must be <= 5MB.`
    )
    .refine(
      (files) =>
        !files ||
        files?.every?.((f: File) => ACCEPTED_IMAGE_TYPES.includes(f.type)),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    )
    .optional(),
  // Inventory
  trackQuantity: z.boolean().default(false),
  // Variants
  hasVariants: z.boolean().default(false),
  locations: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string(),
        qty: z.number().int().nonnegative().default(0)
      })
    )
    .min(1),
  // Stock alert thresholds
  stockMax: z.number().int().nonnegative().optional(),
  stockMin: z.number().int().nonnegative().optional()
});

export default function ProductForm({
  initialData,
  initialVariants,
  pageTitle
}: {
  initialData: Product | null;
  initialVariants?: Product[];
  pageTitle: string;
}) {
  const router = useRouter();
  const isVariantChild = Boolean((initialData as any)?.parent_id);
  const isNewProduct = !initialData?.id && !isVariantChild;
  const hasInitialVariantChildren =
    !isVariantChild && (initialVariants?.length ?? 0) > 0;
  const [variantsDirty, setVariantsDirty] = React.useState(false);
  const didHydrateExistingVariantsRef = React.useRef(false);
  const skipVariantsDirtyRef = React.useRef(false);
  const [variantsEnabled, setVariantsEnabled] = React.useState(true);
  // Color tags for inventory locations: cycle through these for visual distinction
  const locationColorClasses = React.useMemo(
    () => [
      'bg-emerald-600',
      'bg-blue-600',
      'bg-amber-600',
      'bg-violet-600',
      'bg-rose-600',
      'bg-cyan-600',
      'bg-fuchsia-600',
      'bg-lime-600'
    ],
    []
  );
  const getLocationColorClass = React.useCallback(
    (idx: number) => locationColorClasses[idx % locationColorClasses.length],
    [locationColorClasses]
  );
  const [optionGroups, setOptionGroups] = React.useState<
    { name: string; values: string[] }[]
  >([
    // Start with no default option groups; user will add what they need
  ]);
  const [newValueByGroup, setNewValueByGroup] = React.useState<
    Record<number, string>
  >({});
  const [addOptionOpen, setAddOptionOpen] = React.useState(false);
  const availableOptionNames = [
    'Color',
    'Size',
    'Material',
    'Emblem',
    'Finish'
  ];
  // Always show variant details once variants are enabled (no view/hide toggle)
  const showVariantDetails = true;
  const computedVariantCombinations = React.useMemo(() => {
    // Only include groups that have at least one value
    const groups = optionGroups.filter((g) => g.values.length > 0);
    if (groups.length === 0) return [] as string[];
    // Cartesian product of all groups' values
    const combine = (acc: string[], values: string[]) => {
      const result: string[] = [];
      for (const a of acc) {
        for (const v of values) {
          result.push(a ? `${a} / ${v}` : v);
        }
      }
      return result;
    };
    const initial: string[] = [''];
    const combos = groups.reduce<string[]>(
      (acc, g) => combine(acc, g.values),
      initial
    );
    // Remove leading empty segment artifacts
    return combos
      .map((s) => (s.startsWith(' / ') ? s.slice(3) : s))
      .filter((s) => s.length > 0);
  }, [optionGroups]);

  const initialVariantLabels = React.useMemo(() => {
    const parentName = String(initialData?.name ?? '').trim();
    const labels = (initialVariants ?? [])
      .map((v) => {
        const explicit = String((v as any)?.variant_label ?? '').trim();
        if (explicit) return explicit;
        const name = String((v as any)?.name ?? '').trim();
        if (!name) return '';
        if (parentName && name.startsWith(`${parentName} - `)) {
          return name.slice(`${parentName} - `.length).trim();
        }
        const parts = name.split(' - ');
        return (parts.length > 1 ? parts[parts.length - 1] : name).trim();
      })
      .filter((s) => s.length > 0);
    return Array.from(new Set(labels));
  }, [initialVariants, initialData?.name]);

  const variantCombinations = React.useMemo(() => {
    if (computedVariantCombinations.length > 0) return computedVariantCombinations;
    if (hasInitialVariantChildren) return initialVariantLabels;
    return [] as string[];
  }, [computedVariantCombinations, hasInitialVariantChildren, initialVariantLabels]);
  // Allow users to remove specific generated combinations
  const [removedVariantCombos, setRemovedVariantCombos] = React.useState<
    string[]
  >([]);
  const displayedVariantCombinations = React.useMemo(() => {
    if (removedVariantCombos.length === 0) return variantCombinations;
    const removed = new Set(removedVariantCombos);
    return variantCombinations.filter((c) => !removed.has(c));
  }, [variantCombinations, removedVariantCombos]);
  React.useEffect(() => {
    // Prune removed combos that no longer exist after option changes
    setRemovedVariantCombos((prev) =>
      prev.filter((c) => variantCombinations.includes(c))
    );
  }, [variantCombinations]);
  // Track chosen price option per variant combination (defaults to "Standard")
  const [variantPriceByCombo, setVariantPriceByCombo] = React.useState<
    Record<string, string>
  >({});
  // Track variant-specific inventory metadata (status, alerts, images)
  const [variantInventoryByCombo, setVariantInventoryByCombo] = React.useState<
    Record<
      string,
      {
        status?: 'active' | 'draft' | 'inactive';
        track?: boolean;
        stockMax?: number;
        stockMin?: number;
        images?: File[];
        description?: string;
      }
    >
  >({});
  // Price per location for a variant: variant -> location -> price
  const [variantLocationPriceByCombo, setVariantLocationPriceByCombo] =
    React.useState<Record<string, Record<string, number>>>({});
  // Selection of locations where a variant exists: variant -> location -> boolean
  const [variantLocationSelectedByCombo, setVariantLocationSelectedByCombo] =
    React.useState<Record<string, Record<string, boolean>>>({});
  // Chosen price list per location (optional): variant -> location -> priceListName
  const [variantLocationPriceListByCombo, setVariantLocationPriceListByCombo] =
    React.useState<Record<string, Record<string, string>>>({});
  // -- persistence block moved below, after `form` is defined --
  // Modal navigation across variant combinations
  const [variantDialogOpen, setVariantDialogOpen] = React.useState(false);
  const [currentVariantIndex, setCurrentVariantIndex] =
    React.useState<number>(0);
  const [isVariantLoading, setIsVariantLoading] = React.useState(false);
  React.useEffect(() => {
    // Clamp index when list changes
    setCurrentVariantIndex((prev) =>
      Math.min(
        Math.max(prev, 0),
        Math.max(displayedVariantCombinations.length - 1, 0)
      )
    );
  }, [displayedVariantCombinations.length]);
  // Placeholder inventory list. Replace with real inventory from backend later.
  const [inventoryLocations, setInventoryLocations] = React.useState<
    { id: string; name: string }[]
  >([]);
  React.useEffect(() => {
    let cancelled = false;
    async function loadLocations() {
      try {
        const res = await fetch('/api/locations');
        if (!res.ok) return;
        const json = (await res.json()) as {
          locations?: { id: string; name: string }[];
        };
        const locations =
          json.locations
            ?.map((l) => ({
              id: String(l.id).trim(),
              name: String(l.name).trim()
            }))
            .filter((l) => l.id.length > 0 && l.name.length > 0) ?? [];
        if (!cancelled && locations.length > 0) {
          setInventoryLocations(locations);
        }
      } catch {
        // ignore
      }
    }
    void loadLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fallback in case API call fails (keeps form usable)
  const fallbackInventories = React.useMemo(
    () => [
      { id: 'loc-ny', name: 'New York Warehouse' },
      { id: 'loc-la', name: 'Los Angeles Distribution Center' },
      { id: 'loc-chi', name: 'Chicago Hub' },
      { id: 'loc-dal', name: 'Dallas DC' },
      { id: 'loc-mia', name: 'Miami Depot' }
    ],
    []
  );
  const locationOptions =
    inventoryLocations.length > 0 ? inventoryLocations : fallbackInventories;
  // Price lists loaded from API (replace with real backend later)
  const [retailerPriceLists, setRetailerPriceLists] = React.useState<
    PriceList[]
  >([]);
  React.useEffect(() => {
    let cancelled = false;
    async function loadPriceLists() {
      try {
        const res = await fetch('/api/price-lists');
        if (!res.ok) return;
        const json = (await res.json()) as { priceLists?: PriceList[] };
        const lists =
          json.priceLists
            ?.map((p) => ({
              id: String(p.id).trim(),
              name: String(p.name).trim()
            }))
            .filter((p) => p.id.length > 0 && p.name.length > 0) ?? [];
        if (!cancelled && lists.length > 0) setRetailerPriceLists(lists);
      } catch {
        // ignore
      }
    }
    void loadPriceLists();
    return () => {
      cancelled = true;
    };
  }, []);
  const fallbackPriceLists = React.useMemo<PriceList[]>(
    () => [
      { id: 'pl-retail', name: 'Retail (MSRP)' },
      { id: 'pl-fh', name: 'Funeral Home Retail' },
      { id: 'pl-cemetery', name: 'Cemetery Contract' }
      ,
      { id: 'pl-wholesale', name: 'Wholesale' },
      { id: 'pl-promo', name: 'Promotional / Seasonal' }
    ],
    []
  );
  const priceListOptions =
    retailerPriceLists.length > 0 ? retailerPriceLists : fallbackPriceLists;

  const initialLocationQtyById = new Map(
    (Array.isArray((initialData as any)?.locations) ? (initialData as any).locations : []).map(
      (l: any) => [String(l?.id ?? ''), Number(l?.qty ?? 0)] as const
    )
  );
  const initialSelectedPriceListById: Map<
    string,
    { id: string; name: string; price: number }
  > = new Map();
  {
    const raw = Array.isArray((initialData as any)?.priceLists)
      ? ((initialData as any).priceLists as any[])
      : [];
    for (const p of raw) {
      const id = String(p?.id ?? '').trim();
      const name = String(p?.name ?? '').trim();
      const price = Number(p?.price ?? 0);
      if (!id || !name) continue;
      initialSelectedPriceListById.set(id, {
        id,
        name,
        price: Number.isFinite(price) ? price : 0
      });
    }
  }

  const rawStatus = String((initialData as any)?.status ?? 'active').trim();
  const initialStatus: 'active' | 'draft' | 'inactive' = ([
    'active',
    'draft',
    'inactive'
  ] as const).includes(
    rawStatus as any
  )
    ? (rawStatus as 'active' | 'draft' | 'inactive')
    : 'active';
  const defaultValues: z.infer<typeof formSchema> = {
    type: 'Burial Vault',
    name: initialData?.name || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    standardPrice: Number(initialData?.price ?? 0),
    priceLists: fallbackPriceLists.map((pl) => ({
      id: pl.id,
      name: pl.name,
      include: initialSelectedPriceListById.has(pl.id),
      price: Number(
        initialSelectedPriceListById.get(pl.id)?.price ??
          Number(initialData?.price ?? 0)
      )
    })),
    status: initialStatus,
    images: undefined,
    trackQuantity: Boolean((initialData as any)?.trackQuantity ?? false),
    hasVariants: hasInitialVariantChildren,
    locations: locationOptions.map((l) => ({
      id: l.id,
      name: l.name,
      qty: Number.isFinite(initialLocationQtyById.get(l.id) as number)
        ? (initialLocationQtyById.get(l.id) as number)
        : 0
    })),
    stockMax:
      typeof (initialData as any)?.stockMax === 'number'
        ? (initialData as any).stockMax
        : undefined,
    stockMin:
      typeof (initialData as any)?.stockMin === 'number'
        ? (initialData as any).stockMin
        : undefined
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [priceListOpen, setPriceListOpen] = React.useState(false);
  const [variantPriceListOpen, setVariantPriceListOpen] = React.useState(false);
  const [manageLocationsOpen, setManageLocationsOpen] = React.useState(false);
  const [confirmEnableVariantsOpen, setConfirmEnableVariantsOpen] =
    React.useState(false);

  // When the location list arrives, update the form while preserving existing quantities by location name.
  React.useEffect(() => {
    const current = form.getValues('locations') ?? [];
    const qtyById = new Map(current.map((l: any) => [l.id, l.qty]));
    const next = locationOptions.map((l) => ({
      id: l.id,
      name: l.name,
      qty: qtyById.get(l.id) ?? 0
    }));
    form.setValue('locations', next, { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryLocations.length]);

  // When the price list options arrive, merge them into the form while preserving include/price by id.
  React.useEffect(() => {
    const current = (form.getValues('priceLists') ?? []) as PriceListEntry[];
    const byId = new Map(current.map((p) => [p.id, p]));
    const next: PriceListEntry[] = priceListOptions.map((pl) => {
      const existing = byId.get(pl.id);
      return {
        id: pl.id,
        name: pl.name,
        include: existing?.include ?? false,
        price: Number(existing?.price ?? Number(initialData?.price ?? 0))
      };
    });
    form.setValue('priceLists', next, { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retailerPriceLists.length]);

  // Persist draft locally so refresh keeps state
  const DRAFT_STORAGE_KEY = 'vw_product_draft';
  const saveTimeoutRef = React.useRef<number | undefined>(undefined);
  const scheduleSaveDraft = React.useCallback(
    (draft: unknown) => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = window.setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        } catch {
          // ignore storage errors
        }
      }, 500);
    },
    [DRAFT_STORAGE_KEY]
  );
  // Load draft on mount
  React.useEffect(() => {
    try {
      // New product should always start clean (do not restore previous draft)
      if (isNewProduct) {
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // ignore storage errors
        }
        form.reset(defaultValues);
        setOptionGroups([]);
        setRemovedVariantCombos([]);
        setVariantPriceByCombo({});
        setVariantInventoryByCombo({});
        setVariantLocationPriceByCombo({});
        setVariantLocationSelectedByCombo({});
        setVariantLocationPriceListByCombo({});
        return;
      }

      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{
        formValues: any;
        draftProductId?: number | null;
        optionGroups: typeof optionGroups;
        removedVariantCombos: typeof removedVariantCombos;
        variantPriceByCombo: typeof variantPriceByCombo;
        variantInventoryByCombo: typeof variantInventoryByCombo;
        variantLocationPriceByCombo: typeof variantLocationPriceByCombo;
      }>;

      // Only restore drafts for the same product id (avoid leaking data between products)
      if (
        typeof parsed.draftProductId !== 'undefined' &&
        parsed.draftProductId !== (initialData?.id ?? null)
      ) {
        return;
      }

      if (parsed.formValues) {
        form.reset(parsed.formValues);
      }
      if (parsed.optionGroups) setOptionGroups(parsed.optionGroups);
      if (parsed.removedVariantCombos)
        setRemovedVariantCombos(parsed.removedVariantCombos);
      if (parsed.variantPriceByCombo)
        setVariantPriceByCombo(parsed.variantPriceByCombo);
      if (parsed.variantInventoryByCombo)
        setVariantInventoryByCombo(parsed.variantInventoryByCombo);
      if (parsed.variantLocationPriceByCombo)
        setVariantLocationPriceByCombo(parsed.variantLocationPriceByCombo);

      // If the draft includes variant configuration, treat variants as user-managed (dirty)
      if (
        parsed.optionGroups ||
        parsed.removedVariantCombos ||
        parsed.variantPriceByCombo ||
        parsed.variantInventoryByCombo ||
        parsed.variantLocationPriceByCombo
      ) {
        setVariantsDirty(true);
      }
    } catch {
      // ignore parse errors
    }
    // Variant child products cannot have variants
    if (isVariantChild) {
      form.reset({
        ...form.getValues(),
        hasVariants: false
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVariantChild, isNewProduct]);

  // Hydrate the Variants editor when editing a parent product that already has variant children.
  // This loads variant labels into option groups (inferred), hides non-existing combinations,
  // and pre-fills per-variant inventory/location selections from the child records.
  React.useEffect(() => {
    if (didHydrateExistingVariantsRef.current) return;
    if (!hasInitialVariantChildren) return;
    if (isNewProduct) return;
    if (variantsDirty) return; // draft/user state should win
    if (initialVariantLabels.length === 0) return;

    didHydrateExistingVariantsRef.current = true;
    skipVariantsDirtyRef.current = true;

    const labels = initialVariantLabels;
    const splitLabels = labels.map((l) =>
      l.split(' / ').map((s) => s.trim()).filter(Boolean)
    );
    const maxParts = splitLabels.reduce((m, parts) => Math.max(m, parts.length), 0);

    const inferredGroups: { name: string; values: string[] }[] = Array.from(
      { length: maxParts },
      (_, idx) => {
        const set = new Set<string>();
        for (const parts of splitLabels) {
          const v = parts[idx];
          if (v) set.add(v);
        }
        return { name: `Option ${idx + 1}`, values: Array.from(set) };
      }
    ).filter((g) => g.values.length > 0);

    // Build the cartesian product for inferred groups so we can hide combinations
    // that don't exist in the saved variant children.
    const generated = (() => {
      if (inferredGroups.length === 0) return [] as string[];
      const combine = (acc: string[], values: string[]) => {
        const result: string[] = [];
        for (const a of acc) {
          for (const v of values) result.push(a ? `${a} / ${v}` : v);
        }
        return result;
      };
      const initial: string[] = [''];
      const combos = inferredGroups.reduce<string[]>(
        (acc, g) => combine(acc, g.values),
        initial
      );
      return combos
        .map((s) => (s.startsWith(' / ') ? s.slice(3) : s))
        .filter((s) => s.length > 0);
    })();

    const existingSet = new Set(labels);
    const removed = generated.filter((c) => !existingSet.has(c));

    setOptionGroups(inferredGroups);
    setRemovedVariantCombos(removed);

    // Hydrate per-variant inventory + selected locations
    const byLabel = new Map<string, Product>();
    for (const v of initialVariants ?? []) {
      const label = String((v as any)?.variant_label ?? '').trim();
      if (label) byLabel.set(label, v);
    }

    const nextInventory: Record<string, any> = {};
    const nextSelectedLocations: Record<string, Record<string, boolean>> = {};
    for (const label of labels) {
      const child = byLabel.get(label);
      if (!child) continue;

      const rawStatus = String((child as any)?.status ?? 'active').trim();
      const status: 'active' | 'draft' | 'inactive' = ([
        'active',
        'draft',
        'inactive'
      ] as const).includes(rawStatus as any)
        ? (rawStatus as any)
        : 'active';

      nextInventory[label] = {
        status,
        track: Boolean((child as any)?.trackQuantity ?? false),
        stockMax:
          typeof (child as any)?.stockMax === 'number' ? (child as any).stockMax : undefined,
        stockMin:
          typeof (child as any)?.stockMin === 'number' ? (child as any).stockMin : undefined,
        images: [],
        description: String((child as any)?.description ?? '').trim() || undefined
      };

      const locs = Array.isArray((child as any)?.locations)
        ? ((child as any).locations as any[])
        : [];
      nextSelectedLocations[label] = Object.fromEntries(
        locs
          .map((l) => String(l?.id ?? '').trim())
          .filter(Boolean)
          .map((id) => [id, true] as const)
      );
    }

    setVariantInventoryByCombo((prev) => ({ ...nextInventory, ...prev }));
    setVariantLocationSelectedByCombo((prev) => ({
      ...nextSelectedLocations,
      ...prev
    }));

    // Hydration should not count as a user edit.
    setVariantsDirty(false);

    window.setTimeout(() => {
      skipVariantsDirtyRef.current = false;
    }, 0);
  }, [
    hasInitialVariantChildren,
    isNewProduct,
    variantsDirty,
    initialVariantLabels,
    initialVariants
  ]);

  // If the user changes variant-related state after hydration, mark variants as dirty
  // so we can safely decide when to overwrite variants on save.
  React.useEffect(() => {
    if (!hasInitialVariantChildren) return;
    if (isNewProduct) return;
    if (!didHydrateExistingVariantsRef.current) return;
    if (skipVariantsDirtyRef.current) return;
    setVariantsDirty(true);
  }, [
    hasInitialVariantChildren,
    isNewProduct,
    optionGroups,
    removedVariantCombos,
    variantPriceByCombo,
    variantInventoryByCombo,
    variantLocationPriceByCombo,
    variantLocationSelectedByCombo,
    variantLocationPriceListByCombo
  ]);

  // Watch form and state changes to persist
  const formRef = React.useRef(form);
  formRef.current = form;
  React.useEffect(() => {
    const subscription = formRef.current.watch((values) => {
      const draft = {
        draftProductId: initialData?.id ?? null,
        formValues: values,
        optionGroups,
        removedVariantCombos,
        variantPriceByCombo,
        variantInventoryByCombo,
        variantLocationPriceByCombo
      };
      scheduleSaveDraft(draft);
    });
    return () => subscription.unsubscribe();
  }, [
    initialData?.id,
    optionGroups,
    removedVariantCombos,
    variantPriceByCombo,
    variantInventoryByCombo,
    variantLocationPriceByCombo,
    scheduleSaveDraft
  ]);

  const hasVariants = form.watch('hasVariants');
  const parentHasVariants = Boolean(hasVariants) && !isVariantChild;

  const parentHasInventoryDetails = React.useCallback(() => {
    const trackQuantity = Boolean(form.getValues('trackQuantity'));
    const stockMax = form.getValues('stockMax');
    const stockMin = form.getValues('stockMin');
    const locations = (form.getValues('locations') ?? []) as any[];
    const hasQty = locations.some((l) => Number(l?.qty ?? 0) > 0);
    const hasAlerts =
      (typeof stockMax === 'number' && Number.isFinite(stockMax)) ||
      (typeof stockMin === 'number' && Number.isFinite(stockMin));
    return trackQuantity || hasQty || hasAlerts;
  }, [form]);

  // Parent products with variants cannot have their own inventory/stock thresholds.
  // Inventory and alerts should be managed per-variant.
  const prevParentHasVariantsRef = React.useRef<boolean>(parentHasVariants);
  React.useEffect(() => {
    const prev = prevParentHasVariantsRef.current;
    prevParentHasVariantsRef.current = parentHasVariants;
    if (!parentHasVariants) return;
    if (prev) return;

    form.setValue('trackQuantity', false, { shouldDirty: true });
    form.setValue('stockMax', undefined, { shouldDirty: true });
    form.setValue('stockMin', undefined, { shouldDirty: true });

    const currentLocations = form.getValues('locations') ?? [];
    form.setValue(
      'locations',
      currentLocations.map((l: any) => ({ ...l, qty: 0 })),
      { shouldDirty: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentHasVariants]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Build payload with only user-provided details
    const {
      priceLists,
      images,
      trackQuantity,
      locations,
      stockMax,
      stockMin,
      description,
      ...requiredFields
    } = values;

    const selectedPriceLists = (priceLists ?? [])
      .filter((pl) => pl.include)
      .map((pl) => ({ id: pl.id, name: pl.name, price: pl.price }));

    const selectedLocations =
      trackQuantity === true
        ? (locations ?? []).filter((loc) => Number(loc.qty) > 0)
        : [];

    const includeVariants =
      values.hasVariants &&
      displayedVariantCombinations.length > 0 &&
      (isNewProduct || !hasInitialVariantChildren || variantsDirty);

    const payload: Record<string, unknown> = {
      ...requiredFields // type, name, category, standardPrice, status
    };

    if (description && String(description).trim().length > 0) {
      payload.description = description.trim();
    }
    if (images && (Array.isArray(images) ? images.length > 0 : true)) {
      payload.images = images;
    }
    // Parent inventory only when there are no variants
    if (!includeVariants) {
    if (typeof stockMax === 'number') {
      payload.stockMax = stockMax;
    }
    if (typeof stockMin === 'number') {
      payload.stockMin = stockMin;
    }
    if (trackQuantity) {
      payload.trackQuantity = true;
      if (selectedLocations.length > 0) {
          payload.locations = selectedLocations.map((l) => ({
            locationId: l.id,
            locationName: l.name,
            qty: Number(l.qty)
          }));
        }
      }
    }
    if (selectedPriceLists.length > 0) {
      payload.priceLists = selectedPriceLists;
    }
    if (includeVariants) {
      payload.optionGroups = optionGroups;
      payload.variants = displayedVariantCombinations;
      const priceListMap = new Map(
        (values.priceLists ?? []).map((p) => [p.name, Number(p.price ?? 0)])
      );
      const stdPrice = Number(values.standardPrice ?? 0);
      payload.variantPricing = displayedVariantCombinations.map((variant) => {
        const option = variantPriceByCombo[variant] ?? 'Standard';
        const amount =
          option === 'Standard'
            ? stdPrice
            : (priceListMap.get(option) ?? stdPrice);
        return {
          variant,
          priceOption: option,
          priceAmount: amount
        };
      });
      payload.variantInventoryMeta = displayedVariantCombinations.map(
        (variant) => {
          const track = variantInventoryByCombo[variant]?.track ?? false;
          return {
            variant,
            status: variantInventoryByCombo[variant]?.status ?? 'active',
            description: variantInventoryByCombo[variant]?.description
              ? String(variantInventoryByCombo[variant]?.description).trim()
              : undefined,
            track,
            stockMax: variantInventoryByCombo[variant]?.stockMax,
            stockMin: variantInventoryByCombo[variant]?.stockMin,
            imageCount: variantInventoryByCombo[variant]?.images?.length ?? 0,
            selectedLocations: track
              ? Object.entries(variantLocationSelectedByCombo[variant] ?? {})
                  .filter(([, exists]) => exists)
                  .map(([location]) => location)
              : [],
            locationPrices: track
              ? (() => {
                  const lists = values.priceLists ?? [];
                  const priceListMap = new Map(
                    lists.map((p) => [p.name, Number(p.price ?? 0)])
                  );
                  const stdPrice = Number(values.standardPrice ?? 0);
                  const option = variantPriceByCombo[variant] ?? 'Standard';
                  const variantAmount =
                    option === 'Standard'
                      ? stdPrice
                      : Number(priceListMap.get(option) ?? stdPrice);
                  const selectedMap =
                    variantLocationSelectedByCombo[variant] ?? {};
                  const locationListMap =
                    variantLocationPriceListByCombo[variant] ?? {};
                  return Object.keys(selectedMap)
                    .filter((locId) => selectedMap[locId])
                    .map((locId) => {
                      const listName = locationListMap[locId];
                      const amount =
                        listName && priceListMap.has(listName)
                            ? Number(priceListMap.get(listName))
                            : variantAmount;
                      const locName =
                        (values.locations ?? []).find((l) => l.id === locId)
                          ?.name ?? locId;
                      return {
                        locationId: locId,
                        locationName: locName,
                        priceListOption: listName ?? 'VARIANT',
                        priceAmount: amount
                      };
                    });
                })()
              : []
          };
        }
      );
    }

    // Start saving
    setIsSaving(true);
    try {
      // Log payload for inspection
      // eslint-disable-next-line no-console
      console.log('Submitting product payload:', payload);

      const isEdit = initialData?.id != null;

      const variantsPayload =
        includeVariants && payload.variantPricing
          ? (payload.variantPricing as any[]).map((vp) => ({
              label: String(vp?.variant ?? '').trim(),
              price: Number(vp?.priceAmount)
            }))
          : [];

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify((() => {
          const body: Record<string, unknown> = {
          productId: isEdit ? Number(initialData?.id) : undefined,
          name: values.name,
          category: values.category,
          description: values.description ?? '',
          price: Number(values.standardPrice ?? 0),
          status: values.status,
          hasVariants: Boolean(values.hasVariants),
          trackQuantity: includeVariants ? false : Boolean(values.trackQuantity),
          stockMax:
            typeof values.stockMax === 'number' ? Number(values.stockMax) : undefined,
          stockMin:
            typeof values.stockMin === 'number' ? Number(values.stockMin) : undefined,
          locations: (values.locations ?? []).map((l) => ({
            id: String((l as any)?.id ?? ''),
            name: String((l as any)?.name ?? ''),
            qty: Number((l as any)?.qty ?? 0)
          })),
          priceLists: (values.priceLists ?? [])
            .filter((pl: any) => pl?.include === true)
            .map((pl: any) => ({
              id: String(pl?.id ?? ''),
              name: String(pl?.name ?? ''),
              price: Number(pl?.price ?? 0)
            })),
          };

          // Only send variants when the user is actively managing them.
          // - includeVariants: replace variants with the current combinations
          // - hasVariants=false: explicitly clear variants
          if (includeVariants) {
            body.variants = variantsPayload;
            body.variantInventoryMeta = payload.variantInventoryMeta;
          } else if (values.hasVariants === false) {
            body.variants = [];
          }

          return body;
        })())
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }

      // Success toast
      toast.success('Product saved', {
        description: `${values.name} has been saved${values.status ? ` (${values.status})` : ''}.`
      });

      // Clear local draft and return to list so the new/updated product appears in the table
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      router.push('/dashboard/product');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Save failed:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className='mx-auto w-full space-y-4'>
      <ProductFormHeader
        pageTitle={pageTitle}
        isSaving={isSaving}
        onBack={() => router.push('/dashboard/product')}
        onSave={() => form.handleSubmit(onSubmit)()}
      />

      <Form {...form}>
        <form
          // Prevent accidental submits (e.g. buttons without type="button" default to submit)
          // Saving should only happen via the explicit "Save" action in the header.
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className='grid grid-cols-1 gap-4 lg:grid-cols-3'
        >
          {/* Left column - main details */}
          <div className='space-y-4 lg:col-span-2'>
            <ProductDetailsCard form={form} />

            {/* (moved dropdown into Pricing card below Standard Price) */}

            {/* Pricing */}
            <PricingCard
              form={form}
              priceListOpen={priceListOpen}
              setPriceListOpen={setPriceListOpen}
            />

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Inventory</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <FormField
                    control={form.control}
                    name='trackQuantity'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center gap-3'>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(v) => {
                              if (parentHasVariants) return;
                              field.onChange(v);
                            }}
                            disabled={parentHasVariants}
                          />
                        </FormControl>
                        <FormLabel className='m-0'>Track Quantity</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {parentHasVariants && (
                  <div className='text-muted-foreground text-sm'>
                    This product has variants, so inventory is tracked on each
                    variant (not on the main product).
                  </div>
                )}

                {form.watch('trackQuantity') && !parentHasVariants && (
                  <div className='grid grid-cols-12 items-center gap-4'>
                    <div className='col-span-8'>
                      <Label className='text-muted-foreground text-xs'>
                        Locations
                      </Label>
                    </div>
                    <div className='col-span-4 flex justify-end'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-7 px-2'
                        onClick={() => setManageLocationsOpen(true)}
                      >
                        Manage
                      </Button>
                    </div>
                    <div className='col-span-4 text-right'>
                      <Label className='text-muted-foreground text-xs'>
                        Quantity
                      </Label>
                    </div>
                    <div className='col-span-12 mt-1 border-b' />
                    {form.watch('locations').map((loc, index) => (
                      <React.Fragment key={index}>
                        <div className='col-span-8'>
                          <div className='flex items-center gap-2'>
                            <span
                              className={`h-3 w-3 ${getLocationColorClass(
                                index
                              )}`}
                            />
                            <span className='text-sm'>{loc.name}</span>
                          </div>
                        </div>
                        <div className='col-span-4'>
                          <FormField
                            control={form.control}
                            name={`locations.${index}.qty` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type='text'
                                    inputMode='numeric'
                                    className='rounded-none border-0 border-b px-0 text-right focus-visible:ring-0'
                                    value={
                                      Number.isFinite(field.value)
                                        ? field.value
                                        : 0
                                    }
                                    onChange={(e) =>
                                      field.onChange(
                                        e.currentTarget.value === ''
                                          ? 0
                                          : parseInt(
                                              e.currentTarget.value.replace(
                                                /[^0-9]/g,
                                                ''
                                              ),
                                              10
                                            )
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <ManageLocationsDialog
                  open={manageLocationsOpen}
                  onOpenChange={setManageLocationsOpen}
                  value={(form.watch('locations') ?? []) as any}
                  onChange={(next) =>
                    form.setValue('locations', next as any, { shouldDirty: true })
                  }
                />
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Variants</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='hasVariants'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center gap-3'>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(v) => {
                            if (isVariantChild) return;
                            // If enabling variants would disable/clear parent inventory details,
                            // confirm first.
                            if (v === true && !field.value && parentHasInventoryDetails()) {
                              setConfirmEnableVariantsOpen(true);
                              return;
                            }
                            field.onChange(v);
                          }}
                          disabled={isVariantChild}
                        />
                      </FormControl>
                      <FormLabel className='m-0'>Enable Variants</FormLabel>
                    </FormItem>
                  )}
                />
                <AlertDialog
                  open={confirmEnableVariantsOpen}
                  onOpenChange={setConfirmEnableVariantsOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Enable variants?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This product already has inventory/stock alert details on the
                        parent. If you enable variants, parent inventory will be
                        disabled and cleared (inventory will be tracked per variant).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel type='button'>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        type='button'
                        onClick={() => {
                          form.setValue('hasVariants', true, { shouldDirty: true });
                        }}
                      >
                        Enable variants
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {isVariantChild && (
                  <div className='text-muted-foreground text-sm'>
                    This is a variant product. Variant products cannot have
                    variants.
                    </div>
                )}
                {form.watch('hasVariants') && (
                  <>
                    {showVariantDetails && (
                      <>
                        {hasInitialVariantChildren && (
                          <div className='rounded-md border p-4'>
                            <div className='mb-2 text-sm font-medium'>
                              Existing variants ({initialVariants?.length ?? 0})
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Variant</TableHead>
                                  <TableHead className='text-right'>Price</TableHead>
                                  <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(initialVariants ?? []).map((v) => (
                                  <TableRow key={String((v as any)?.id ?? v.name)}>
                                    <TableCell>
                                      {String(
                                        (v as any)?.variant_label ?? v.name ?? ''
                                      )}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                      {Number((v as any)?.price ?? 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                      <Button
                                        type='button'
                                        size='sm'
                                        variant='outline'
                                        onClick={() =>
                                          router.push(
                                            `/dashboard/product/${String(
                                              (v as any)?.id
                                            )}`
                                          )
                                        }
                                      >
                                        Edit
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        <div className='flex items-center gap-3'>
                          <Checkbox
                            checked={variantsEnabled}
                            onCheckedChange={(v) => setVariantsEnabled(!!v)}
                          />
                          <span className='text-sm'>
                            Product will have their quantities reduced when a
                            product is sold
                          </span>
                        </div>

                        <div className='rounded-md border'>
                          {optionGroups.map(
                            (
                              group: { name: string; values: string[] },
                              idx: number
                            ) => (
                              <div
                                key={group.name}
                                className='flex items-start justify-between gap-3 border-b p-4 last:border-b-0'
                              >
                                <div className='flex-1'>
                                  <div className='text-sm font-medium'>
                                    {group.name}
                                  </div>
                                  <div className='mt-3 flex flex-wrap items-center gap-2'>
                                    {group.values.map((v: string) => (
                                      <div
                                        key={v}
                                        className='bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm'
                                      >
                                        <span>{v}</span>
                                        <button
                                          type='button'
                                          className='text-muted-foreground hover:text-foreground'
                                          aria-label={`Remove ${v}`}
                                          onClick={() =>
                                            setOptionGroups((groups) => {
                                              const next = [...groups];
                                              next[idx] = {
                                                ...next[idx],
                                                values: next[idx].values.filter(
                                                  (x) => x !== v
                                                )
                                              };
                                              return next;
                                            })
                                          }
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                    <div className='flex items-center gap-2'>
                                      <Input
                                        placeholder='Add value'
                                        value={newValueByGroup[idx] ?? ''}
                                        onChange={(e) =>
                                          setNewValueByGroup((m) => ({
                                            ...m,
                                            [idx]: e.target.value
                                          }))
                                        }
                                        className='h-8 w-40'
                                      />
                                      <Button
                                        type='button'
                                        size='sm'
                                        variant='outline'
                                        onClick={() => {
                                          const val = (
                                            newValueByGroup[idx] ?? ''
                                          ).trim();
                                          if (
                                            val &&
                                            !group.values.includes(val)
                                          ) {
                                            setOptionGroups((groups) => {
                                              const next = [...groups];
                                              next[idx] = {
                                                ...next[idx],
                                                values: [
                                                  ...next[idx].values,
                                                  val
                                                ]
                                              };
                                              return next;
                                            });
                                          }
                                          setNewValueByGroup((m) => ({
                                            ...m,
                                            [idx]: ''
                                          }));
                                        }}
                                      >
                                        <IconPlus className='mr-1 h-4 w-4' />
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {idx === 0 && (
                                  <div className='flex items-center gap-2'>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-8 w-8'
                                      aria-label='Search variants'
                                    >
                                      <Search className='text-muted-foreground h-4 w-4' />
                                    </Button>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-8 w-8'
                                      aria-label='Filter variants'
                                    >
                                      <SlidersHorizontal className='text-muted-foreground h-4 w-4' />
                                    </Button>
                                    <Select defaultValue='all'>
                                      <SelectTrigger className='h-8 w-[140px]'>
                                        <SelectValue placeholder='All Locations' />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value='all'>
                                          All Locations
                                        </SelectItem>
                                        {locationOptions.map((loc) => (
                                          <SelectItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                <div className='flex items-center gap-2'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8'
                                    aria-label={`Remove ${group.name} option`}
                                    onClick={() =>
                                      setOptionGroups((groups) =>
                                        groups.filter((_, i) => i !== idx)
                                      )
                                    }
                                  >
                                    <IconX className='text-muted-foreground h-4 w-4' />
                                  </Button>
                                </div>
                              </div>
                            )
                          )}

                          <div className='p-4'>
                            <Popover
                              open={addOptionOpen}
                              onOpenChange={setAddOptionOpen}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type='button'
                                  className='text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm'
                                  aria-label='Add another option'
                                >
                                  <span className='inline-flex h-5 w-5 items-center justify-center rounded-full border'>
                                    <IconPlus className='h-3.5 w-3.5' />
                                  </span>
                                  Add another option
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className='w-56 p-1'>
                                <div className='text-muted-foreground px-2 py-1.5 text-xs'>
                                  Choose an option type
                                </div>
                                <div className='flex flex-col'>
                                  {availableOptionNames.map((name) => {
                                    const exists = optionGroups.some(
                                      (g) => g.name === name
                                    );
                                    return (
                                      <Button
                                        key={name}
                                        variant='ghost'
                                        size='sm'
                                        className='justify-start'
                                        disabled={exists}
                                        onClick={() => {
                                          if (!exists) {
                                            setOptionGroups((groups) => [
                                              ...groups,
                                              { name, values: [] }
                                            ]);
                                          }
                                          setAddOptionOpen(false);
                                        }}
                                      >
                                        {name}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {displayedVariantCombinations.length === 0 ? (
                          <div className='text-muted-foreground rounded-md border px-4 py-3 text-sm'>
                            Add option values (e.g. size, color, emblem) to generate variants.
                          </div>
                        ) : (
                        <div className='rounded-md border'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className='w-10'>
                                  <Checkbox aria-label='Select all variants' />
                                </TableHead>
                                <TableHead>Variants</TableHead>
                                <TableHead className='w-[140px]'>
                                  Available
                                </TableHead>
                                <TableHead className='w-[1%] whitespace-nowrap'>
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedVariantCombinations.map((v, idx) => (
                                  <TableRow key={v}>
                                    <TableCell className='align-middle'>
                                      <Checkbox aria-label={`Select ${v}`} />
                                    </TableCell>
                                    <TableCell className='text-primary underline'>
                                      {v}
                                    </TableCell>
                                    <TableCell>Standard</TableCell>
                                    <TableCell className='whitespace-nowrap'>
                                      <div className='flex w-full items-center justify-start gap-1'>
                                        <Button
                                          variant='outline'
                                          size='sm'
                                          onClick={() => {
                                            setCurrentVariantIndex(idx);
                                            setVariantDialogOpen(true);
                                          }}
                                        >
                                          Customize variant
                                        </Button>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='text-destructive hover:text-destructive'
                                          aria-label={`Remove ${v}`}
                                          onClick={() =>
                                            setRemovedVariantCombos((prev) =>
                                              prev.includes(v)
                                                ? prev
                                                : [...prev, v]
                                            )
                                          }
                                        >
                                          <IconX className='h-4 w-4' />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                        )}
                        {/* Global dialog to navigate variants */}
                        <VariantEditDialog
                          open={variantDialogOpen}
                          onOpenChange={setVariantDialogOpen}
                          variantName={
                            displayedVariantCombinations[currentVariantIndex] ??
                            'Variant'
                          }
                          productName={form.watch('name') || 'New Product'}
                        >
                            {displayedVariantCombinations.length > 0 && (
                              <>
                                <div className='flex items-start justify-between'>
                                  <div />
                                  <div />
                                </div>
                                {/* Two-column layout: details left, image right */}
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                  <div className='space-y-4 md:col-span-2'>
                                    {/* Status */}
                                    <div className='grid grid-cols-2 gap-3'>
                                      <div>
                                        <div className='text-muted-foreground mb-1 text-xs'>
                                          Status
                                        </div>
                                        <Select
                                          value={
                                            variantInventoryByCombo[
                                              displayedVariantCombinations[
                                                currentVariantIndex
                                              ]
                                            ]?.status ?? 'active'
                                          }
                                          onValueChange={(val) =>
                                            setVariantInventoryByCombo(
                                              (prev) => {
                                                const key =
                                                  displayedVariantCombinations[
                                                    currentVariantIndex
                                                  ];
                                                return {
                                                  ...prev,
                                                  [key]: {
                                                    ...prev[key],
                                                    status: val as
                                                      | 'active'
                                                      | 'draft'
                                                      | 'inactive'
                                                  }
                                                };
                                              }
                                            )
                                          }
                                        >
                                          <SelectTrigger className='h-8'>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value='active'>
                                              Active
                                            </SelectItem>
                                            <SelectItem value='draft'>
                                              Draft
                                            </SelectItem>
                                            <SelectItem value='inactive'>
                                              Inactive
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div />
                                    </div>
                                    {/* Price Option */}
                                    <div>
                                      <div className='text-muted-foreground mb-1 text-xs'>
                                        Price
                                      </div>
                                      <Popover
                                        open={variantPriceListOpen}
                                        onOpenChange={setVariantPriceListOpen}
                                      >
                                        <PopoverTrigger asChild>
                                          <div className='w-[200px]'>
                                            <button
                                              type='button'
                                              className='text-muted-foreground hover:text-foreground flex h-9 w-full items-center justify-between rounded-none border-0 border-b px-0 text-left text-sm focus-visible:ring-0'
                                            >
                                              <span className='truncate'>
                                                {(() => {
                                                  const std = Number(
                                                    form.watch(
                                                      'standardPrice'
                                                    ) ?? 0
                                                  );
                                                  const selected = (
                                                    form.watch('priceLists') ??
                                                    []
                                                  ).filter((p) => p.include);

                                                  if (selected.length === 0) {
                                                    return `Standard (US ${std})`;
                                                  }

                                                  const parts = selected.map(
                                                    (p) =>
                                                      `${p.name} (US ${Number(p.price ?? 0)})`
                                                  );

                                                  // Keep the trigger readable when many lists are selected
                                                  if (parts.length <= 2) {
                                                    return parts.join(', ');
                                                  }
                                                  return `${parts
                                                    .slice(0, 2)
                                                    .join(
                                                      ', '
                                                    )} +${parts.length - 2} more`;
                                                })()}
                                              </span>
                                              <IconChevronDown className='h-4 w-4 opacity-50' />
                                            </button>
                                          </div>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-[520px]'>
                                          <div className='space-y-3'>
                                            <div className='-mt-1 -mr-1 flex items-center justify-end'>
                                              <button
                                                type='button'
                                                onClick={() =>
                                                  setVariantPriceListOpen(false)
                                                }
                                                aria-label='Close'
                                                className='text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded-md'
                                              >
                                                <IconX className='h-4 w-4' />
                                              </button>
                                            </div>

                                            <div className='flex items-center justify-end'>
                                              <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                className='h-8 px-2'
                                                onClick={() => {
                                                  const key =
                                                    displayedVariantCombinations[
                                                      currentVariantIndex
                                                    ];
                                                  setVariantPriceByCombo(
                                                    (prev) => ({
                                                      ...prev,
                                                      [key]: 'Standard'
                                                    })
                                                  );
                                                  setVariantPriceListOpen(
                                                    false
                                                  );
                                                }}
                                              >
                                                Use Standard for this variant
                                              </Button>
                                            </div>

                                            <div className='grid grid-cols-12 items-center gap-3'>
                                              <div className='col-span-8'>
                                                <div className='flex items-center gap-3'>
                                                  <Checkbox
                                                    checked={form
                                                      .watch('priceLists')
                                                      .every((p) => p.include)}
                                                    onCheckedChange={(
                                                      checked
                                                    ) => {
                                                      const next = form
                                                        .watch('priceLists')
                                                        .map((p) => ({
                                                          ...p,
                                                          include: !!checked
                                                        }));
                                                      form.setValue(
                                                        'priceLists',
                                                        next,
                                                        { shouldDirty: true }
                                                      );

                                                      if (!checked) {
                                                        const key =
                                                          displayedVariantCombinations[
                                                            currentVariantIndex
                                                          ];
                                                        const option =
                                                          variantPriceByCombo[
                                                            key
                                                          ] ?? 'Standard';
                                                        if (
                                                          option !== 'Standard'
                                                        ) {
                                                          setVariantPriceByCombo(
                                                            (prev) => ({
                                                              ...prev,
                                                              [key]: 'Standard'
                                                            })
                                                          );
                                                        }
                                                      }
                                                    }}
                                                  />
                                                  <span className='text-sm font-medium'>
                                                    Select all Price Lists
                                                  </span>
                                                </div>
                                              </div>
                                              <div className='text-muted-foreground col-span-4 text-right text-sm'>
                                                Edit Standard Price
                                              </div>
                                            </div>

                                            <div className='space-y-2'>
                                              {form
                                                .watch('priceLists')
                                                .map((pl, idx) => (
                                                  <div
                                                    key={pl.id}
                                                    className='grid grid-cols-12 items-center gap-3'
                                                  >
                                                    <div className='col-span-8'>
                                                      <div className='flex items-center gap-3'>
                                                        <Checkbox
                                                          checked={pl.include}
                                                          onCheckedChange={(
                                                            checked
                                                          ) => {
                                                            const next = [
                                                              ...form.watch(
                                                                'priceLists'
                                                              )
                                                            ];
                                                            next[idx] = {
                                                              ...next[idx],
                                                              include: !!checked
                                                            };
                                                            form.setValue(
                                                              'priceLists',
                                                              next,
                                                              {
                                                                shouldDirty:
                                                                  true
                                                              }
                                                            );

                                                            const key =
                                                              displayedVariantCombinations[
                                                                currentVariantIndex
                                                              ];
                                                            if (checked) {
                                                              setVariantPriceByCombo(
                                                                (prev) => ({
                                                                  ...prev,
                                                                  [key]: pl.name
                                                                })
                                                              );
                                                            } else {
                                                              const option =
                                                                variantPriceByCombo[
                                                                  key
                                                                ] ?? 'Standard';
                                                              if (
                                                                option ===
                                                                pl.name
                                                              ) {
                                                                setVariantPriceByCombo(
                                                                  (prev) => ({
                                                                    ...prev,
                                                                    [key]:
                                                                      'Standard'
                                                                  })
                                                                );
                                                              }
                                                            }
                                                          }}
                                                        />
                                                        <span className='text-sm'>
                                                          {pl.name}
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <div className='col-span-4'>
                                                      <Input
                                                        type='text'
                                                        inputMode='decimal'
                                                        className='rounded-none border-0 border-b px-0 text-right focus-visible:ring-0'
                                                        value={
                                                          Number.isFinite(
                                                            pl.price
                                                          )
                                                            ? pl.price
                                                            : 0
                                                        }
                                                        onChange={(e) => {
                                                          const v =
                                                            e.currentTarget
                                                              .value === ''
                                                              ? 0
                                                              : parseFloat(
                                                                  e
                                                                    .currentTarget
                                                                    .value
                                                                );
                                                          const next = [
                                                            ...form.watch(
                                                              'priceLists'
                                                            )
                                                          ];
                                                          next[idx] = {
                                                            ...next[idx],
                                                            price: v
                                                          };
                                                          form.setValue(
                                                            'priceLists',
                                                            next,
                                                            {
                                                              shouldDirty: true
                                                            }
                                                          );
                                                        }}
                                                      />
                                                    </div>
                                                  </div>
                                                ))}
                                            </div>

                                            <div className='flex items-center justify-end pt-2'>
                                              <Button
                                                type='button'
                                                size='sm'
                                                onClick={() =>
                                                  setVariantPriceListOpen(false)
                                                }
                                              >
                                                Done
                                              </Button>
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    {/* Variant Description */}
                                    <div className='mt-3'>
                                      <div className='text-muted-foreground mb-1 text-xs'>
                                        Description
                                      </div>
                                      <Textarea
                                        placeholder='Add a description for this variant...'
                                        className='min-h-20'
                                        value={
                                          variantInventoryByCombo[
                                            displayedVariantCombinations[
                                              currentVariantIndex
                                            ]
                                          ]?.description ?? ''
                                        }
                                        onChange={(e) => {
                                          const key =
                                            displayedVariantCombinations[
                                              currentVariantIndex
                                            ];
                                          const next = e.currentTarget.value;
                                          setVariantInventoryByCombo(
                                            (prev) => ({
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                description: next
                                              }
                                            })
                                          );
                                        }}
                                      />
                                    </div>
                                    {/* Track Inventory toggle */}
                                    <div className='mt-2'>
                                      <div className='text-muted-foreground mb-1 text-xs'>
                                        Inventory Tracking
                                      </div>
                                      <div className='flex items-center gap-2'>
                                        <Switch
                                          checked={
                                            variantInventoryByCombo[
                                              displayedVariantCombinations[
                                                currentVariantIndex
                                              ]
                                            ]?.track ?? false
                                          }
                                          onCheckedChange={(val) => {
                                            const key =
                                              displayedVariantCombinations[
                                                currentVariantIndex
                                              ];
                                            setVariantInventoryByCombo(
                                              (prev) => ({
                                                ...prev,
                                                [key]: {
                                                  ...prev[key],
                                                  track: !!val
                                                }
                                              })
                                            );
                                          }}
                                        />
                                        <span className='text-sm'>
                                          Track inventory for this variant
                                        </span>
                                      </div>
                                    </div>
                                    {/* Locations with Quantity and Price */}
                                    {(variantInventoryByCombo[
                                      displayedVariantCombinations[
                                        currentVariantIndex
                                      ]
                                    ]?.track ??
                                      false) && (
                                      <div className='grid grid-cols-12 items-center gap-2'>
                                        <div className='col-span-5'>
                                          <div className='text-muted-foreground text-xs'>
                                            Location (select where variant
                                            exists)
                                          </div>
                                        </div>
                                        <div className='col-span-2 text-right'>
                                          <div className='text-muted-foreground text-xs'>
                                            Quantity
                                          </div>
                                        </div>
                                        <div className='col-span-5 text-right'>
                                          <div className='text-muted-foreground text-xs'>
                                            Price (Price List or Custom)
                                          </div>
                                        </div>
                                        <div className='col-span-12 mt-1 border-b' />
                                        {(form.watch('locations') ?? []).map(
                                          (l, i) => {
                                            const locId =
                                              (l as any)?.id ?? `loc-${i + 1}`;
                                            const locName =
                                              (l as any)?.name ??
                                              `Location ${i + 1}`;
                                            const variantKey =
                                              displayedVariantCombinations[
                                                currentVariantIndex
                                              ];
                                            const isTracked =
                                              variantInventoryByCombo[
                                                variantKey
                                              ]?.track ?? false;
                                            return (
                                              <div
                                                key={locId}
                                                className='contents'
                                              >
                                                <div className='col-span-5'>
                                                  <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                      checked={
                                                        variantLocationSelectedByCombo[
                                                          variantKey
                                                        ]?.[locId] ?? false
                                                      }
                                                      onCheckedChange={(
                                                        checked
                                                      ) => {
                                                        setVariantLocationSelectedByCombo(
                                                          (prev) => {
                                                            const current =
                                                              prev[
                                                                variantKey
                                                              ] ?? {};
                                                            return {
                                                              ...prev,
                                                              [variantKey]: {
                                                                ...current,
                                                                [locId]: !!checked
                                                              }
                                                            };
                                                          }
                                                        );
                                                      }}
                                                      aria-label={`Variant exists at ${locName}`}
                                                      disabled={!isTracked}
                                                    />
                                                    <span
                                                      className={`h-3 w-3 ${getLocationColorClass(i)}`}
                                                    />
                                                    <span className='text-sm'>
                                                      {locName}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className='col-span-2'>
                                                  <Input
                                                    type='text'
                                                    inputMode='numeric'
                                                    className='rounded-none border-0 border-b px-0 text-right focus-visible:ring-0'
                                                    defaultValue={0}
                                                    disabled={!isTracked}
                                                  />
                                                </div>
                                                <div className='col-span-5'>
                                                  {(() => {
                                                    const includedLists = form
                                                      .watch('priceLists')
                                                      .filter((p) => p.include);
                                                    const priceListMap =
                                                      new Map(
                                                        includedLists.map(
                                                          (p) => [
                                                            p.name,
                                                            Number(p.price ?? 0)
                                                          ]
                                                        )
                                                      );
                                                    const stdPrice = Number(
                                                      form.watch(
                                                        'standardPrice'
                                                      ) ?? 0
                                                    );
                                                    const variantOption =
                                                      variantPriceByCombo[
                                                        variantKey
                                                      ] ?? 'Standard';
                                                    const variantAmount =
                                                      variantOption ===
                                                      'Standard'
                                                        ? stdPrice
                                                        : Number(
                                                            priceListMap.get(
                                                              variantOption
                                                            ) ?? stdPrice
                                                          );
                                                    const selectedList =
                                                      variantLocationPriceListByCombo[
                                                        variantKey
                                                      ]?.[locId];
                                                    return (
                                                      <div className='flex flex-col items-end gap-1'>
                                                        <Select
                                                          value={
                                                            selectedList ??
                                                            'VARIANT'
                                                          }
                                                          onValueChange={(
                                                            val
                                                          ) => {
                                                            // Selecting a price implies this variant exists at this location
                                                            setVariantLocationSelectedByCombo(
                                                              (prev) => {
                                                                const current =
                                                                  prev[
                                                                    variantKey
                                                                  ] ?? {};
                                                                return {
                                                                  ...prev,
                                                                  [variantKey]:
                                                                    {
                                                                      ...current,
                                                                      [locId]:
                                                                        true
                                                                    }
                                                                };
                                                              }
                                                            );
                                                            setVariantLocationPriceListByCombo(
                                                              (prev) => {
                                                                const current =
                                                                  prev[
                                                                    variantKey
                                                                  ] ?? {};
                                                                return {
                                                                  ...prev,
                                                                  [variantKey]:
                                                                    val ===
                                                                    'VARIANT'
                                                                      ? (() => {
                                                                          const clone =
                                                                            {
                                                                              ...current
                                                                            };
                                                                          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                                                                          delete (
                                                                            clone as Record<
                                                                              string,
                                                                              string
                                                                            >
                                                                          )[
                                                                            locId
                                                                          ];
                                                                          return clone;
                                                                        })()
                                                                      : {
                                                                          ...current,
                                                                          [locId]:
                                                                            val
                                                                        }
                                                                };
                                                              }
                                                            );
                                                            // also keep numeric cache for convenience
                                                            setVariantLocationPriceByCombo(
                                                              (prev) => {
                                                                const current =
                                                                  prev[
                                                                    variantKey
                                                                  ] ?? {};
                                                                const amount =
                                                                  val === 'VARIANT'
                                                                    ? variantAmount
                                                                      : Number(
                                                                          priceListMap.get(
                                                                            val
                                                                          ) ??
                                                                            variantAmount
                                                                        );
                                                                return {
                                                                  ...prev,
                                                                  [variantKey]:
                                                                    {
                                                                      ...current,
                                                                      [locId]:
                                                                        amount
                                                                    }
                                                                };
                                                              }
                                                            );
                                                          }}
                                                          disabled={!isTracked}
                                                        >
                                                          <SelectTrigger className='h-8 w-[160px] sm:w-[180px]'>
                                                            <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            <SelectItem value='VARIANT'>
                                                              {variantOption}
                                                            </SelectItem>
                                                            {includedLists.map(
                                                              (p) => (
                                                                <SelectItem
                                                                  key={p.id}
                                                                  value={p.name}
                                                                >
                                                                  {p.name}
                                                                </SelectItem>
                                                              )
                                                            )}
                                                          </SelectContent>
                                                        </Select>
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                    {/* Stock Alerts */}
                                    {(variantInventoryByCombo[
                                      displayedVariantCombinations[
                                        currentVariantIndex
                                      ]
                                    ]?.track ??
                                      false) && (
                                      <div className='space-y-2'>
                                        <div className='text-sm font-medium'>
                                          Stock Alerts
                                        </div>
                                        <div className='text-muted-foreground text-xs'>
                                          Optional: set thresholds to receive
                                          alerts when this variant&apos;s
                                          inventory goes above Maximum or below
                                          Minimum at any location.
                                        </div>
                                        <div className='grid grid-cols-2 gap-3'>
                                          <div>
                                            <div className='text-muted-foreground mb-1 text-xs'>
                                              Maximum
                                            </div>
                                            <Input
                                              type='text'
                                              inputMode='numeric'
                                              className='rounded-none border-0 border-b px-0 text-right focus-visible:ring-0'
                                              value={
                                                variantInventoryByCombo[
                                                  displayedVariantCombinations[
                                                    currentVariantIndex
                                                  ]
                                                ]?.stockMax ?? ''
                                              }
                                              onChange={(e) => {
                                                const val =
                                                  e.currentTarget.value === ''
                                                    ? undefined
                                                    : parseInt(
                                                        e.currentTarget.value,
                                                        10
                                                      );
                                                const key =
                                                  displayedVariantCombinations[
                                                    currentVariantIndex
                                                  ];
                                                setVariantInventoryByCombo(
                                                  (prev) => ({
                                                    ...prev,
                                                    [key]: {
                                                      ...prev[key],
                                                      stockMax: val
                                                    }
                                                  })
                                                );
                                              }}
                                              disabled={
                                                !(
                                                  variantInventoryByCombo[
                                                    displayedVariantCombinations[
                                                      currentVariantIndex
                                                    ]
                                                  ]?.track ?? false
                                                )
                                              }
                                            />
                                          </div>
                                          <div>
                                            <div className='text-muted-foreground mb-1 text-xs'>
                                              Minimum
                                            </div>
                                            <Input
                                              type='text'
                                              inputMode='numeric'
                                              className='rounded-none border-0 border-b px-0 text-right focus-visible:ring-0'
                                              value={
                                                variantInventoryByCombo[
                                                  displayedVariantCombinations[
                                                    currentVariantIndex
                                                  ]
                                                ]?.stockMin ?? ''
                                              }
                                              onChange={(e) => {
                                                const val =
                                                  e.currentTarget.value === ''
                                                    ? undefined
                                                    : parseInt(
                                                        e.currentTarget.value,
                                                        10
                                                      );
                                                const key =
                                                  displayedVariantCombinations[
                                                    currentVariantIndex
                                                  ];
                                                setVariantInventoryByCombo(
                                                  (prev) => ({
                                                    ...prev,
                                                    [key]: {
                                                      ...prev[key],
                                                      stockMin: val
                                                    }
                                                  })
                                                );
                                              }}
                                              disabled={
                                                !(
                                                  variantInventoryByCombo[
                                                    displayedVariantCombinations[
                                                      currentVariantIndex
                                                    ]
                                                  ]?.track ?? false
                                                )
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className='space-y-2 md:col-span-1'>
                                    {/* Variant Image */}
                                    <div>
                                      <div className='text-muted-foreground mb-1 text-xs'>
                                        Variant Image
                                      </div>
                                      <FileUploader
                                        key={
                                          displayedVariantCombinations[
                                            currentVariantIndex
                                          ]
                                        }
                                        value={
                                          variantInventoryByCombo[
                                            displayedVariantCombinations[
                                              currentVariantIndex
                                            ]
                                          ]?.images
                                        }
                                        onValueChange={(files) => {
                                          const key =
                                            displayedVariantCombinations[
                                              currentVariantIndex
                                            ];
                                          setVariantInventoryByCombo(
                                            (prev) => ({
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                images: files as File[]
                                              }
                                            })
                                          );
                                        }}
                                        maxFiles={1}
                                        maxSize={5 * 1024 * 1024}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-3'>
                                    <span className='text-muted-foreground text-xs'>
                                      Navigate variants:
                                    </span>
                                    <Button
                                      variant='ghost'
                                      onClick={() => {
                                        if (currentVariantIndex <= 0) return;
                                        setIsVariantLoading(true);
                                        setCurrentVariantIndex((i) =>
                                          Math.max(0, i - 1)
                                        );
                                        window.setTimeout(
                                          () => setIsVariantLoading(false),
                                          200
                                        );
                                      }}
                                      disabled={
                                        currentVariantIndex <= 0 ||
                                        isVariantLoading
                                      }
                                    >
                                      Previous
                                    </Button>
                                    <span className='text-muted-foreground flex items-center gap-2 text-xs'>
                                      {isVariantLoading ? (
                                        <>
                                          <Loader2
                                            className='h-4 w-4 animate-spin'
                                            aria-hidden='true'
                                          />
                                          <span aria-live='polite'>
                                            Loading…
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          {currentVariantIndex + 1} of{' '}
                                          {displayedVariantCombinations.length}
                                        </>
                                      )}
                                    </span>
                                    <Button
                                      variant='ghost'
                                      onClick={() => {
                                        if (
                                          currentVariantIndex >=
                                          displayedVariantCombinations.length -
                                            1
                                        )
                                          return;
                                        setIsVariantLoading(true);
                                        setCurrentVariantIndex((i) =>
                                          Math.min(
                                            displayedVariantCombinations.length -
                                              1,
                                            i + 1
                                          )
                                        );
                                        window.setTimeout(
                                          () => setIsVariantLoading(false),
                                          200
                                        );
                                      }}
                                      disabled={
                                        currentVariantIndex >=
                                          displayedVariantCombinations.length -
                                            1 || isVariantLoading
                                      }
                                    >
                                      Next
                                    </Button>
                                  </div>
                                  <Button
                                    size='sm'
                                    onClick={() => {
                                      const variantName =
                                        displayedVariantCombinations[
                                          currentVariantIndex
                                        ] ?? 'Variant';
                                      toast.success(`Saved ${variantName}`);
                                    }}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </>
                            )}
                        </VariantEditDialog>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - side panels */}
          <div className='space-y-4'>
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='sr-only'>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full rounded-none border-0 border-b px-0 focus-visible:ring-0'>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='active'>Active</SelectItem>
                          <SelectItem value='draft'>Draft</SelectItem>
                          <SelectItem value='inactive'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Media</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='images'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='sr-only'>Media</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onValueChange={field.onChange}
                          maxFiles={10}
                          maxSize={5 * 1024 * 1024}
                          className='h-64'
                        />
                      </FormControl>
                      <div className='text-muted-foreground mt-2 text-xs'>
                        Accepts .jpg, .jpeg, .png and .webp
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Stock Alert Threshold */}
            {!parentHasVariants && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Stock Alert Threshold
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='stockMax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum</FormLabel>
                      <FormControl>
                        <Input
                            type='text'
                            inputMode='numeric'
                          className='rounded-none border-0 border-b px-0 text-right focus-visible:ring-0'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.currentTarget.value === ''
                                ? undefined
                                  : parseInt(
                                      e.currentTarget.value.replace(
                                        /[^0-9]/g,
                                        ''
                                      ),
                                      10
                                    )
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='stockMin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum</FormLabel>
                      <FormControl>
                        <Input
                            type='text'
                            inputMode='numeric'
                          className='rounded-none border-0 border-b px-0 text-right focus-visible:ring-0'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.currentTarget.value === ''
                                ? undefined
                                  : parseInt(
                                      e.currentTarget.value.replace(
                                        /[^0-9]/g,
                                        ''
                                      ),
                                      10
                                    )
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
