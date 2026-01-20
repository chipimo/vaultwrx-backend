import { NextResponse } from 'next/server';

// Dummy locations endpoint (replace with real API later)
export async function GET() {
  return NextResponse.json(
    {
      locations: [
        { id: 'loc-ny', name: 'New York Warehouse' },
        { id: 'loc-la', name: 'Los Angeles Distribution Center' },
        { id: 'loc-chi', name: 'Chicago Hub' },
        { id: 'loc-dal', name: 'Dallas DC' },
        { id: 'loc-mia', name: 'Miami Depot' }
      ]
    },
    { status: 200 }
  );
}


