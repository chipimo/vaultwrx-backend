'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Loader2, AlertCircle, FileText, RefreshCw, ChevronLeft, ChevronRight, Filter, X, Calendar } from 'lucide-react';
import { getAuditLogs, AuditLog, AuditAction, AuditResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Map action types to human-readable descriptions
const actionDescriptions: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'created',
  [AuditAction.UPDATE]: 'updated',
  [AuditAction.DELETE]: 'deleted',
  [AuditAction.VIEW]: 'viewed',
  [AuditAction.LOGIN]: 'logged in',
  [AuditAction.LOGOUT]: 'logged out',
  [AuditAction.EXPORT]: 'exported',
  [AuditAction.IMPORT]: 'imported',
};

// Map action types to display labels for filter
const actionLabels: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Create',
  [AuditAction.UPDATE]: 'Update',
  [AuditAction.DELETE]: 'Delete',
  [AuditAction.VIEW]: 'View',
  [AuditAction.LOGIN]: 'Login',
  [AuditAction.LOGOUT]: 'Logout',
  [AuditAction.EXPORT]: 'Export',
  [AuditAction.IMPORT]: 'Import',
};

// Map resource types to human-readable names
const resourceNames: Record<AuditResource, string> = {
  [AuditResource.ORDER]: 'order',
  [AuditResource.PRODUCT]: 'product',
  [AuditResource.CUSTOMER]: 'customer',
  [AuditResource.STAFF]: 'staff member',
  [AuditResource.LOCATION]: 'location',
  [AuditResource.COLOR]: 'color',
  [AuditResource.SERVICE_EXTRA]: 'service extra',
  [AuditResource.COMPANY]: 'company',
  [AuditResource.USER]: 'user',
  [AuditResource.RETAILER]: 'retailer',
  [AuditResource.FUNERAL_DIRECTOR]: 'funeral director',
};

// Map resource types to display labels for filter
const resourceLabels: Record<AuditResource, string> = {
  [AuditResource.ORDER]: 'Orders',
  [AuditResource.PRODUCT]: 'Products',
  [AuditResource.CUSTOMER]: 'Customers',
  [AuditResource.STAFF]: 'Staff',
  [AuditResource.LOCATION]: 'Locations',
  [AuditResource.COLOR]: 'Colors',
  [AuditResource.SERVICE_EXTRA]: 'Service Extras',
  [AuditResource.COMPANY]: 'Company',
  [AuditResource.USER]: 'Users',
  [AuditResource.RETAILER]: 'Retailers',
  [AuditResource.FUNERAL_DIRECTOR]: 'Funeral Directors',
};

// Date preset options
const datePresets = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'Last 90 Days', value: '90days' },
  { label: 'Custom Range', value: 'custom' },
];

// Get appropriate color for action type
const getActionColor = (action: AuditAction): string => {
  switch (action) {
    case AuditAction.CREATE:
      return 'bg-emerald-500';
    case AuditAction.UPDATE:
      return 'bg-blue-500';
    case AuditAction.DELETE:
      return 'bg-red-500';
    case AuditAction.VIEW:
      return 'bg-gray-400';
    case AuditAction.LOGIN:
    case AuditAction.LOGOUT:
      return 'bg-purple-500';
    case AuditAction.EXPORT:
    case AuditAction.IMPORT:
      return 'bg-amber-500';
    default:
      return 'bg-gray-400';
  }
};

// Format the log description
const formatLogDescription = (log: AuditLog): string => {
  const actionText = actionDescriptions[log.action] || log.action;
  const resourceText = resourceNames[log.resource] || log.resource;
  
  if (log.description) {
    return log.description;
  }
  
  const userName = log.userName || 'Unknown user';
  return `${userName} ${actionText} ${resourceText}`;
};

// Get link for resource if applicable
const getResourceLink = (log: AuditLog): { href: string; label: string } | null => {
  if (!log.resourceId) return null;
  
  switch (log.resource) {
    case AuditResource.ORDER:
      return {
        href: `/dashboard/orders/${log.resourceId}`,
        label: `#${log.resourceId.slice(0, 8)}`,
      };
    case AuditResource.CUSTOMER:
      return {
        href: `/dashboard/customers/${log.resourceId}`,
        label: log.resourceId.slice(0, 8),
      };
    case AuditResource.PRODUCT:
      return {
        href: `/dashboard/products/${log.resourceId}`,
        label: log.resourceId.slice(0, 8),
      };
    default:
      return null;
  }
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Get date range from preset
const getDateRange = (preset: string, customStart?: string, customEnd?: string): { start?: Date; end?: Date } => {
  const now = new Date();
  
  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    case '7days':
      return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
    case '30days':
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
    case '90days':
      return { start: startOfDay(subDays(now, 90)), end: endOfDay(now) };
    case 'custom':
      return {
        start: customStart ? startOfDay(new Date(customStart)) : undefined,
        end: customEnd ? endOfDay(new Date(customEnd)) : undefined,
      };
    default:
      return {};
  }
};

export function LogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filter state
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams: Record<string, string> = {
        'pagination[skip]': ((currentPage - 1) * pageSize).toString(),
        'pagination[take]': pageSize.toString(),
      };

      // Add filters if selected
      if (actionFilter && actionFilter !== 'all') {
        queryParams['filters[action]'] = actionFilter;
      }
      if (resourceFilter && resourceFilter !== 'all') {
        queryParams['filters[resource]'] = resourceFilter;
      }

      // Add date range filter
      const dateRange = getDateRange(datePreset, customStartDate, customEndDate);
      if (dateRange.start) {
        queryParams['filters[createdAt][gte]'] = dateRange.start.toISOString();
      }
      if (dateRange.end) {
        queryParams['filters[createdAt][lte]'] = dateRange.end.toISOString();
      }

      const response = await getAuditLogs(queryParams);
      
      if (response.success && response.data) {
        setLogs(response.data.rows || []);
        setTotalCount(response.data.total_data || 0);
      } else {
        setError(response.error?.message || 'Failed to fetch audit logs');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching logs');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, actionFilter, resourceFilter, datePreset, customStartDate, customEndDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, resourceFilter, datePreset, customStartDate, customEndDate, pageSize]);

  const handleClearFilters = () => {
    setActionFilter('all');
    setResourceFilter('all');
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = actionFilter !== 'all' || resourceFilter !== 'all' || datePreset !== 'all';
  const activeFilterCount = 
    (actionFilter !== 'all' ? 1 : 0) + 
    (resourceFilter !== 'all' ? 1 : 0) + 
    (datePreset !== 'all' ? 1 : 0);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (error && logs.length === 0) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-red-300 bg-red-50/50'>
        <AlertCircle className='size-8 text-red-500' />
        <p className='text-sm text-red-600'>{error}</p>
        <Button variant='outline' size='sm' onClick={fetchLogs}>
          <RefreshCw className='mr-2 size-4' />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className='flex h-[calc(100vh-16rem)] flex-col'>
      {/* Filters Section - Fixed at top */}
      <div className='shrink-0 space-y-4 pb-4'>
        {/* Filter Toggle & Refresh */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Button 
              variant={showFilters ? 'secondary' : 'outline'} 
              size='sm' 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className='mr-2 size-4' />
              Filters
              {hasActiveFilters && (
                <span className='ml-2 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant='ghost' size='sm' onClick={handleClearFilters}>
                <X className='mr-1 size-4' />
                Clear
              </Button>
            )}
          </div>
          <Button variant='ghost' size='sm' onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`mr-2 size-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className='space-y-4 rounded-lg border bg-muted/30 p-4'>
            <div className='flex flex-wrap gap-4'>
              <div className='min-w-[140px] flex-1'>
                <label className='mb-1.5 block text-xs font-medium text-muted-foreground'>
                  Action Type
                </label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='All Actions' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Actions</SelectItem>
                    {Object.entries(actionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='min-w-[140px] flex-1'>
                <label className='mb-1.5 block text-xs font-medium text-muted-foreground'>
                  Resource Type
                </label>
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='All Resources' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Resources</SelectItem>
                    {Object.entries(resourceLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='min-w-[140px] flex-1'>
                <label className='mb-1.5 block text-xs font-medium text-muted-foreground'>
                  <Calendar className='mr-1 inline size-3' />
                  Date Range
                </label>
                <Select value={datePreset} onValueChange={setDatePreset}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='All Time' />
                  </SelectTrigger>
                  <SelectContent>
                    {datePresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='min-w-[100px]'>
                <label className='mb-1.5 block text-xs font-medium text-muted-foreground'>
                  Per Page
                </label>
                <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Date Range */}
            {datePreset === 'custom' && (
              <div className='flex flex-wrap items-end gap-4 border-t pt-4'>
                <div className='min-w-[150px] flex-1'>
                  <label className='mb-1.5 block text-xs font-medium text-muted-foreground'>
                    Start Date
                  </label>
                  <Input
                    type='date'
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className='w-full'
                  />
                </div>
                <div className='min-w-[150px] flex-1'>
                  <label className='mb-1.5 block text-xs font-medium text-muted-foreground'>
                    End Date
                  </label>
                  <Input
                    type='date'
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className='w-full'
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        <p className='text-sm text-muted-foreground'>
          {isLoading ? (
            'Loading...'
          ) : (
            <>
              Showing {logs.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} activities
            </>
          )}
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className='relative min-h-0 flex-1 overflow-y-auto rounded-lg border'>
        {/* Loading overlay */}
        {isLoading && logs.length > 0 && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/50'>
            <Loader2 className='size-8 animate-spin text-muted-foreground' />
          </div>
        )}

        {/* Initial loading state */}
        {isLoading && logs.length === 0 && (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='size-8 animate-spin text-muted-foreground' />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && logs.length === 0 && (
          <div className='flex h-full flex-col items-center justify-center gap-4 p-8'>
            <FileText className='size-8 text-muted-foreground' />
            <p className='text-muted-foreground'>
              {hasActiveFilters ? 'No logs match your filters' : 'No activity logs yet'}
            </p>
            <p className='text-sm text-muted-foreground/70'>
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Activity logs will appear here as actions are performed'}
            </p>
            {hasActiveFilters && (
              <Button variant='outline' size='sm' onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Timeline */}
        {logs.length > 0 && (
          <div className='p-4'>
            {logs.map((log, index) => {
              const resourceLink = getResourceLink(log);
              const createdDate = new Date(log.createdAt);
              
              return (
                <div key={log.id} className='relative flex gap-6 pb-6 last:pb-0'>
                  {/* Timeline line and dot */}
                  <div className='flex flex-col items-center'>
                    {/* Colored dot based on action */}
                    <div className={`z-10 size-3 rounded-full ${getActionColor(log.action)}`} />
                    {/* Vertical line */}
                    {index < logs.length - 1 && (
                      <div className='h-full w-px flex-1 bg-gray-200' />
                    )}
                  </div>

                  {/* Content */}
                  <div className='flex flex-1 items-start justify-between pt-0'>
                    <div className='space-y-1'>
                      <p className='text-sm text-muted-foreground'>
                        {format(createdDate, 'd MMMM yyyy')}
                      </p>
                      <p className='text-sm text-foreground'>
                        {formatLogDescription(log)}
                        {resourceLink && (
                          <>
                            {' '}
                            <a
                              href={resourceLink.href}
                              className='text-blue-600 hover:underline'
                            >
                              {resourceLink.label}
                            </a>
                          </>
                        )}
                      </p>
                      {log.userEmail && log.userEmail !== log.userName && (
                        <p className='text-xs text-muted-foreground/70'>
                          {log.userEmail}
                        </p>
                      )}
                    </div>
                    <span className='shrink-0 text-sm text-muted-foreground'>
                      {format(createdDate, 'h:mm a')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination - Fixed at bottom */}
      {totalPages > 0 && (
        <div className='shrink-0 flex items-center justify-between border-t bg-background pt-4'>
          <p className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </p>
          
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className='size-4' />
            </Button>
            
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <Button
                  key={index}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size='sm'
                  className='min-w-[36px]'
                  onClick={() => goToPage(page)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              ) : (
                <span key={index} className='px-2 text-muted-foreground'>
                  {page}
                </span>
              )
            ))}
            
            <Button
              variant='outline'
              size='sm'
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className='size-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
