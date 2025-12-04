/**
 * Deduplicates Company objects in a nested structure by replacing duplicate Company objects (by ID) with references.
 * Only Company objects are deduplicated - other entities (Customer, User, etc.) are kept in full.
 * The first occurrence of a Company is kept in full, subsequent occurrences are replaced with just the ID.
 * 
 * @param obj - The object to deduplicate
 * @param seen - Map of seen Company objects by their ID
 * @returns The deduplicated object
 */
export function deduplicateObjects(obj: any, seen: Map<string, any> = new Map()): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deduplicateObjects(item, seen));
  }

  // Handle primitive types
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj;
  }

  // Only deduplicate Company objects - check if this is a Company
  const isCompany = obj.id && typeof obj.id === 'string' && obj.name && obj.email && (obj.type === 'retailer' || obj.type === 'company');
  
  if (isCompany) {
    const key = `Company_${obj.id}`;
    
    if (seen.has(key)) {
      // Return a reference object with just the ID
      return { id: obj.id };
    }
    
    // Mark this Company as seen
    seen.set(key, obj);
  }

  // Recursively process all properties
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = deduplicateObjects(value, seen);
  }

  return result;
}

