import { NextResponse } from 'next/server';

// Dummy retailer price lists endpoint (replace with real API later)
export async function GET() {
  return NextResponse.json(
    {
      priceLists: [
        { id: 'pl-retail', name: 'Retail (MSRP)' },
        { id: 'pl-fh', name: 'Funeral Home Retail' },
        { id: 'pl-cemetery', name: 'Cemetery Contract' },
        { id: 'pl-wholesale', name: 'Wholesale' },
        { id: 'pl-promo', name: 'Promotional / Seasonal' }
      ]
    },
    { status: 200 }
  );
}


