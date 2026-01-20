'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconArrowLeft, IconLoader2, IconTrash, IconEdit } from '@tabler/icons-react';
import { toast } from 'sonner';
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getColors,
  createColor,
  LocationData,
  ColorData,
  ColorType
} from '@/lib/api-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type LocationsView = 'main' | 'add-location' | 'edit-location';

interface Location {
  id: string;
  name: string;
  address: string;
  color: string;
  isDefault: boolean;
}

export function LocationsTab() {
  const [view, setView] = useState<LocationsView>('main');
  const [locations, setLocations] = useState<Location[]>([]);
  const [colors, setColors] = useState<ColorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getLocations();
      if (response.success && response.data) {
        const mappedLocations: Location[] = response.data.rows.map((loc: LocationData) => ({
          id: loc.id,
          name: loc.name,
          address: loc.address || '',
          color: loc.color || '#6b7280',
          isDefault: loc.isDefault || false
        }));
        setLocations(mappedLocations);
      } else {
        toast.error('Failed to load locations');
      }
    } catch {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchColors = useCallback(async () => {
    try {
      const response = await getColors({ 'filter[type]': ColorType.LOCATION_COLOR });
      if (response.success && response.data) {
        setColors(response.data.rows);
      }
    } catch {
      // Colors are optional, don't show error
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    fetchColors();
  }, [fetchLocations, fetchColors]);

  const handleAddLocation = () => {
    setEditingLocation(null);
    setView('add-location');
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setView('edit-location');
  };

  const handleDeleteLocation = async () => {
    if (!deletingLocation) return;
    
    try {
      const response = await deleteLocation(deletingLocation.id);
      if (response.success) {
        toast.success('Location deleted successfully');
        fetchLocations();
      } else {
        toast.error(response.error?.message || 'Failed to delete location');
      }
    } catch {
      toast.error('Failed to delete location');
    } finally {
      setDeletingLocation(null);
    }
  };

  const handleFormDone = () => {
    setView('main');
    setEditingLocation(null);
    fetchLocations();
  };

  if (view === 'add-location') {
    return (
      <AddLocationForm
        onBack={() => setView('main')}
        onDone={handleFormDone}
        colors={colors}
        onColorCreated={fetchColors}
      />
    );
  }

  if (view === 'edit-location' && editingLocation) {
    return (
      <AddLocationForm
        onBack={() => setView('main')}
        onDone={handleFormDone}
        colors={colors}
        onColorCreated={fetchColors}
        editLocation={editingLocation}
      />
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='p-6'>
          <div className='mb-4 flex items-start justify-between'>
            <h3 className='text-sm font-semibold text-foreground'>
              All Locations
            </h3>
            <Button
              variant='outline'
              size='sm'
              onClick={handleAddLocation}
            >
              Add Location
            </Button>
          </div>
          
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <IconLoader2 className='size-6 animate-spin text-muted-foreground' />
            </div>
          ) : locations.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <p className='text-sm text-muted-foreground'>No locations found</p>
              <Button
                variant='link'
                size='sm'
                onClick={handleAddLocation}
                className='mt-2'
              >
                Add your first location
              </Button>
            </div>
          ) : (
            <div className='space-y-3'>
              {locations.map((location) => (
                <LocationRow
                  key={location.id}
                  location={location}
                  onEdit={() => handleEditLocation(location)}
                  onDelete={() => setDeletingLocation(location)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingLocation} onOpenChange={() => setDeletingLocation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingLocation?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocation} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LocationRow({
  location,
  onEdit,
  onDelete
}: {
  location: Location;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className='flex items-center justify-between rounded-lg border p-4'>
      <div>
        <p className='text-sm font-medium text-foreground'>{location.name}</p>
        <p className='text-sm text-muted-foreground'>{location.address}</p>
      </div>
      <div className='flex items-center gap-2'>
        {location.isDefault && (
          <Badge
            variant='outline'
            className='border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-400'
          >
            Default
          </Badge>
        )}
        <div
          className='size-5 rounded'
          style={{ backgroundColor: location.color }}
        />
        <Button variant='ghost' size='icon' onClick={onEdit}>
          <IconEdit className='size-4' stroke={1.5} />
        </Button>
        <Button variant='ghost' size='icon' onClick={onDelete}>
          <IconTrash className='size-4 text-destructive' stroke={1.5} />
        </Button>
      </div>
    </div>
  );
}

// Color Picker Component
function ColorPicker({
  color,
  onChange,
  savedColors,
  onSaveColor
}: {
  color: string;
  onChange: (color: string) => void;
  savedColors: ColorData[];
  onSaveColor?: (color: string, name: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [colorName, setColorName] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowSaveInput(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const colorVal = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * colorVal)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const handleSatLightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const newSat = Math.round(x * 100);
    const newLight = Math.round((1 - y) * 50 + (1 - x) * (1 - y) * 50);
    setSaturation(newSat);
    setLightness(newLight);
    onChange(hslToHex(hue, newSat, newLight));
  };

  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const newHue = Math.round(y * 360);
    setHue(newHue);
    onChange(hslToHex(newHue, saturation, lightness));
  };

  const handleSaveColor = () => {
    if (onSaveColor && colorName.trim()) {
      onSaveColor(color, colorName.trim());
      setColorName('');
      setShowSaveInput(false);
    }
  };

  return (
    <div className='relative' ref={pickerRef}>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='size-6 rounded border border-input shadow-sm'
        style={{ backgroundColor: color }}
      />
      {isOpen && (
        <div className='absolute right-0 top-8 z-50 rounded-lg bg-background p-3 shadow-lg border min-w-[280px]'>
          {/* Saved Colors */}
          {savedColors.length > 0 && (
            <div className='mb-3'>
              <p className='text-xs font-medium text-muted-foreground mb-2'>Saved Colors</p>
              <div className='flex flex-wrap gap-1'>
                {savedColors.map((c) => (
                  <button
                    key={c.id}
                    type='button'
                    onClick={() => {
                      onChange(c.hexCode || '#6b7280');
                      setIsOpen(false);
                    }}
                    className='size-6 rounded border border-input shadow-sm hover:ring-2 hover:ring-primary'
                    style={{ backgroundColor: c.hexCode || '#6b7280' }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className='flex gap-2'>
            {/* Saturation/Lightness picker */}
            <div
              onClick={handleSatLightClick}
              className='relative size-32 cursor-crosshair rounded'
              style={{
                background: `
                  linear-gradient(to bottom, transparent, black),
                  linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
                `
              }}
            >
              <div
                className='absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow'
                style={{
                  left: `${saturation}%`,
                  top: `${100 - lightness * 2}%`,
                  backgroundColor: color
                }}
              />
            </div>
            {/* Hue slider */}
            <div
              onClick={handleHueClick}
              className='relative h-32 w-4 cursor-pointer rounded'
              style={{
                background:
                  'linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}
            >
              <div
                className='absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow'
                style={{
                  top: `${(hue / 360) * 100}%`,
                  backgroundColor: `hsl(${hue}, 100%, 50%)`
                }}
              />
            </div>
          </div>

          {/* Save Color */}
          {onSaveColor && (
            <div className='mt-3 border-t pt-3'>
              {showSaveInput ? (
                <div className='flex gap-2'>
                  <Input
                    placeholder='Color name'
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    className='h-8 text-xs'
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveColor()}
                  />
                  <Button size='sm' onClick={handleSaveColor} className='h-8'>
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowSaveInput(true)}
                  className='w-full h-8 text-xs'
                >
                  Save this color
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Add Location Form Component
function AddLocationForm({
  onBack,
  onDone,
  colors,
  onColorCreated,
  editLocation
}: {
  onBack: () => void;
  onDone: () => void;
  colors: ColorData[];
  onColorCreated: () => void;
  editLocation?: Location;
}) {
  const [color, setColor] = useState(editLocation?.color || '#1a1a1a');
  const [name, setName] = useState(editLocation?.name || '');
  const [address, setAddress] = useState(editLocation?.address || '');
  const [isDefault, setIsDefault] = useState(editLocation?.isDefault || false);
  const [saving, setSaving] = useState(false);

  const handleSaveColor = async (hexCode: string, colorName: string) => {
    try {
      const response = await createColor({
        name: colorName,
        hexCode: hexCode,
        type: ColorType.LOCATION_COLOR,
        isActive: true
      });
      if (response.success) {
        toast.success('Color saved successfully');
        onColorCreated();
      } else {
        toast.error(response.error?.message || 'Failed to save color');
      }
    } catch {
      toast.error('Failed to save color');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    setSaving(true);
    try {
      const locationData = {
        name: name.trim(),
        address: address.trim() || undefined,
        color,
        isDefault
      };

      let response;
      if (editLocation) {
        response = await updateLocation(editLocation.id, locationData);
      } else {
        response = await createLocation(locationData);
      }

      if (response.success) {
        toast.success(editLocation ? 'Location updated successfully' : 'Location created successfully');
        onDone();
      } else {
        toast.error(response.error?.message || 'Failed to save location');
      }
    } catch {
      toast.error('Failed to save location');
    } finally {
      setSaving(false);
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
          {editLocation ? 'EDIT LOCATION' : 'ADD LOCATION'}
        </span>
      </button>

      <Card>
        <CardContent className='space-y-6 p-6'>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>
              Location details
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Choose a color and give this location a short, identifiable name.
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <Input
              placeholder='Location name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='flex-1 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
            <ColorPicker
              color={color}
              onChange={setColor}
              savedColors={colors}
              onSaveColor={handleSaveColor}
            />
          </div>

          <Input
            placeholder='Address'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='isDefault'
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className='rounded border-input'
            />
            <label htmlFor='isDefault' className='text-sm text-muted-foreground'>
              Set as default location
            </label>
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={onBack} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <IconLoader2 className='mr-2 size-4 animate-spin' />}
              {editLocation ? 'Update' : 'Done'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
