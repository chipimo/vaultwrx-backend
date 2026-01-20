import { fakeProducts } from '@/constants/mock-api';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const rawId = url.searchParams.get('id') ?? url.searchParams.get('productId');

  let id = rawId ? Number(rawId) : NaN;

  // Allow DELETE body as a fallback (some clients prefer that)
  if (!Number.isFinite(id)) {
    try {
      const body = (await req.json()) as { productId?: number; id?: number };
      const bodyId = body?.productId ?? body?.id;
      id = typeof bodyId === 'number' ? bodyId : Number(bodyId);
    } catch {
      // ignore JSON parse errors
    }
  }

  if (!Number.isFinite(id)) {
    return NextResponse.json(
      { message: 'id (or productId) is required' },
      { status: 400 }
    );
  }

  const result = fakeProducts.deleteProduct(id);
  if (!result.ok) {
    if (result.reason === 'not_found') {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    if (result.reason === 'has_variants') {
      return NextResponse.json(
        { message: 'Cannot delete product until all variants are deleted.' },
        { status: 409 }
      );
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      productId?: number;
      name?: string;
      category?: string;
      description?: string;
      price?: number;
      photo_url?: string;
      hasVariants?: boolean;
      variants?: { label: string; price?: number }[];
      status?: string;
      trackQuantity?: boolean;
      stockMax?: number;
      stockMin?: number;
      locations?: { id?: string; name?: string; qty?: number }[];
      priceLists?: { id?: string; name?: string; price?: number }[];
      variantInventoryMeta?: {
        variant?: string;
        status?: string;
        description?: string;
        trackQuantity?: boolean;
        stockMax?: number;
        stockMin?: number;
        selectedLocations?: string[];
        locationPrices?: {
          locationId?: string;
          locationName?: string;
          priceListOption?: string;
          priceAmount?: number;
        }[];
      }[];
    };

    const name = String(body.name ?? '').trim();
    const category = String(body.category ?? '').trim();
    const price = Number(body.price);

    if (!name) {
      return NextResponse.json({ message: 'name is required' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json(
        { message: 'category is required' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(price)) {
      return NextResponse.json(
        { message: 'price must be a number' },
        { status: 400 }
      );
    }

    const variantsProvided = Object.prototype.hasOwnProperty.call(body, 'variants');
    const variants =
      variantsProvided && Array.isArray(body.variants)
        ? body.variants
            .map((v) => ({
              label: String(v?.label ?? '').trim(),
              price:
                v?.price === undefined || v?.price === null
                  ? undefined
                  : Number(v.price)
            }))
            .filter((v) => v.label.length > 0)
        : [];

    const status = body.status != null ? String(body.status).trim() : undefined;
    const trackQuantity = body.trackQuantity === true;
    const stockMax =
      body.stockMax === undefined || body.stockMax === null
        ? undefined
        : Number(body.stockMax);
    const stockMin =
      body.stockMin === undefined || body.stockMin === null
        ? undefined
        : Number(body.stockMin);

    const locations = Array.isArray(body.locations)
      ? body.locations
          .map((l) => ({
            id: String(l?.id ?? '').trim(),
            name: String(l?.name ?? '').trim(),
            qty: Number(l?.qty ?? 0)
          }))
          .filter((l) => l.id.length > 0 && l.name.length > 0)
          .map((l) => ({
            ...l,
            qty: Number.isFinite(l.qty) ? Math.max(0, Math.trunc(l.qty)) : 0
          }))
      : undefined;

    const priceLists = Array.isArray(body.priceLists)
      ? body.priceLists
          .map((p) => ({
            id: String(p?.id ?? '').trim(),
            name: String(p?.name ?? '').trim(),
            price: Number(p?.price ?? 0)
          }))
          .filter((p) => p.id.length > 0 && p.name.length > 0)
          .map((p) => ({
            ...p,
            price: Number.isFinite(p.price) ? p.price : 0
          }))
      : undefined;

    const variantMeta = Array.isArray(body.variantInventoryMeta)
      ? body.variantInventoryMeta
          .map((m) => ({
            variant: String(m?.variant ?? '').trim(),
            status: m?.status != null ? String(m.status).trim() : undefined,
            description:
              m?.description != null ? String(m.description).trim() : undefined,
            trackQuantity: m?.trackQuantity === true,
            stockMax:
              m?.stockMax === undefined || m?.stockMax === null
                ? undefined
                : Number(m.stockMax),
            stockMin:
              m?.stockMin === undefined || m?.stockMin === null
                ? undefined
                : Number(m.stockMin),
            selectedLocations: Array.isArray(m?.selectedLocations)
              ? m.selectedLocations
                  .map((id) => String(id ?? '').trim())
                  .filter((id) => id.length > 0)
              : [],
            locationPrices: Array.isArray(m?.locationPrices)
              ? m.locationPrices.map((lp) => ({
                  locationId: String(lp?.locationId ?? '').trim(),
                  locationName: String(lp?.locationName ?? '').trim(),
                  priceListOption: String(lp?.priceListOption ?? '').trim(),
                  priceAmount:
                    lp?.priceAmount === undefined || lp?.priceAmount === null
                      ? undefined
                      : Number(lp.priceAmount)
                }))
              : []
          }))
          .filter((m) => m.variant.length > 0)
      : [];

    const productId = body.productId;
    if (typeof productId === 'number' && Number.isFinite(productId)) {
      const existing = fakeProducts.records.find((p) => p.id === productId);
      if (existing?.parent_id) {
        // Variant products cannot have variants
        if (variantsProvided && variants.length > 0) {
          return NextResponse.json(
            { message: 'Variant products cannot have variants' },
            { status: 400 }
          );
        }
      }

      const photo_url = String(body.photo_url ?? '').trim();
      const updated = fakeProducts.updateProduct(productId, {
        name,
        category,
        description: body.description ?? '',
        price,
        ...(photo_url ? { photo_url } : {}),
        status,
        trackQuantity,
        stockMax: Number.isFinite(stockMax as number) ? stockMax : undefined,
        stockMin: Number.isFinite(stockMin as number) ? stockMin : undefined,
        locations,
        priceLists
      });
      if (!updated) {
        return NextResponse.json(
          { message: 'Product not found' },
          { status: 404 }
        );
      }

      // Only parent products can manage variants
      if (!existing?.parent_id) {
        // Variants behavior:
        // - hasVariants === false: explicitly clear all variant children
        // - variants provided: replace variant children for this parent
        // - variants omitted: do not modify existing variant children
        if (body.hasVariants === false) {
          fakeProducts.deleteVariantsForParent(updated.id);
        } else if (variantsProvided) {
          // Preserve existing variant inventory (especially location quantities) when updating.
          // Instead of delete+recreate (which resets qty to 0), we:
          // - delete variants that were removed
          // - update variants that still exist
          // - create new variants
          const desiredLabels = new Set(variants.map((v) => v.label));
          const existingChildren = fakeProducts.records.filter(
            (p) => (p as any)?.parent_id === updated.id
          );
          const existingByLabel = new Map<string, (typeof existingChildren)[number]>();
          for (const child of existingChildren) {
            const lbl = String((child as any)?.variant_label ?? '').trim();
            if (lbl) existingByLabel.set(lbl, child);
          }

          // Remove children not present anymore
          const nextRecords = fakeProducts.records.filter((p) => {
            const isChild = (p as any)?.parent_id === updated.id;
            if (!isChild) return true;
            const lbl = String((p as any)?.variant_label ?? '').trim();
            return lbl ? desiredLabels.has(lbl) : false;
          });
          fakeProducts.records.length = 0;
          fakeProducts.records.push(...nextRecords);

          for (const v of variants) {
            const variantPrice = Number.isFinite(v.price as number)
              ? (v.price as number)
              : updated.price;
            const meta = variantMeta.find((m) => m.variant === v.label);

            const locNameById = new Map<string, string>(
              (meta?.locationPrices ?? [])
                .filter(
                  (lp) => lp.locationId.length > 0 && lp.locationName.length > 0
                )
                .map((lp) => [lp.locationId, lp.locationName] as const)
            );

            const existingChild = existingByLabel.get(v.label);
            const existingLocations = Array.isArray((existingChild as any)?.locations)
              ? (((existingChild as any).locations as any[]) ?? [])
              : [];
            const qtyByLocId = new Map<string, number>(
              existingLocations
                .map((l) => [
                  String(l?.id ?? '').trim(),
                  Number(l?.qty ?? 0)
                ] as const)
                .filter(([id]) => id.length > 0)
            );
            const nameByLocId = new Map<string, string>(
              existingLocations
                .map(
                  (l) =>
                    [String(l?.id ?? '').trim(), String(l?.name ?? '').trim()] as const
                )
                .filter(([id, nm]) => id.length > 0 && nm.length > 0)
            );

            const track = meta?.trackQuantity === true;
            const selected = meta?.selectedLocations ?? [];
            const variantLocations: { id: string; name: string; qty: number }[] | undefined =
              track && selected.length > 0
                ? selected.map((id) => ({
                    id,
                    name:
                      locNameById.get(id) ??
                      nameByLocId.get(id) ??
                      id,
                    // Preserve existing qty if present; otherwise start at 0
                    qty: Number.isFinite(qtyByLocId.get(id))
                      ? (qtyByLocId.get(id) as number)
                      : 0
                  }))
                : track
                  ? []
                  : undefined;

            const childStatusRaw =
              meta?.status != null && String(meta.status).trim().length > 0
                ? String(meta.status).trim()
                : (existingChild as any)?.status != null
                  ? String((existingChild as any).status).trim()
                  : status;
            const childDescription =
              meta?.description && String(meta.description).trim().length > 0
                ? String(meta.description).trim()
                : (existingChild as any)?.description ?? updated.description;

            if (existingChild) {
              fakeProducts.updateProduct(existingChild.id, {
                name: `${updated.name} - ${v.label}`,
                category: updated.category,
                description: childDescription,
                price: variantPrice,
                status: childStatusRaw,
                trackQuantity: track,
                stockMax:
                  meta && Number.isFinite(meta.stockMax as number)
                    ? meta.stockMax
                    : (existingChild as any)?.stockMax,
                stockMin:
                  meta && Number.isFinite(meta.stockMin as number)
                    ? meta.stockMin
                    : (existingChild as any)?.stockMin,
                locations: variantLocations
              });
            } else {
              fakeProducts.createProduct({
                name: `${updated.name} - ${v.label}`,
                category: updated.category,
                description: childDescription,
                price: variantPrice,
                parent_id: updated.id,
                variant_label: v.label,
                status: childStatusRaw,
                trackQuantity: track,
                stockMax:
                  meta && Number.isFinite(meta.stockMax as number)
                    ? meta.stockMax
                    : undefined,
                stockMin:
                  meta && Number.isFinite(meta.stockMin as number)
                    ? meta.stockMin
                    : undefined,
                locations: variantLocations
              });
            }
          }
        }
      }

      return NextResponse.json({ product: updated }, { status: 200 });
    }

    const created = fakeProducts.createProduct({
      name,
      category,
      description: body.description ?? '',
      price,
      photo_url: String(body.photo_url ?? '').trim() || undefined,
      status,
      trackQuantity,
      stockMax: Number.isFinite(stockMax as number) ? stockMax : undefined,
      stockMin: Number.isFinite(stockMin as number) ? stockMin : undefined,
      locations,
      priceLists
    });

    // Create variant children as individual products (only if variants were provided)
    if (variantsProvided) {
      for (const v of variants) {
        const variantPrice = Number.isFinite(v.price as number)
          ? (v.price as number)
          : created.price;
        const meta = variantMeta.find((m) => m.variant === v.label);
        const locNameById = new Map(
          (meta?.locationPrices ?? [])
            .filter(
              (lp) => lp.locationId.length > 0 && lp.locationName.length > 0
            )
            .map((lp) => [lp.locationId, lp.locationName] as const)
        );
        const variantLocations =
          meta && meta.selectedLocations.length > 0
            ? meta.selectedLocations.map((id) => ({
                id,
                name: locNameById.get(id) ?? id,
                qty: 0
              }))
            : undefined;
        fakeProducts.createProduct({
          name: `${created.name} - ${v.label}`,
          category: created.category,
          description: created.description,
          price: variantPrice,
          parent_id: created.id,
          variant_label: v.label,
          status,
          trackQuantity: meta?.trackQuantity === true,
          stockMax:
            meta && Number.isFinite(meta.stockMax as number)
              ? meta.stockMax
              : undefined,
          stockMin:
            meta && Number.isFinite(meta.stockMin as number)
              ? meta.stockMin
              : undefined,
          locations: variantLocations
        });
      }
    }

    return NextResponse.json({ product: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}


