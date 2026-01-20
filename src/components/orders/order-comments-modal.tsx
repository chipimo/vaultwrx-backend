'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  IconMoodSmile,
  IconAt,
  IconPaperclip,
  IconDots
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
// Date formatting utilities
const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
  } catch {
    return '';
  }
};

const formatTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  } catch {
    return '';
  }
};
import { getOrder, updateOrder } from '@/lib/api-client';
import { Order } from '@/types/order';
import { toast } from 'sonner';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: Date | string;
}

interface Activity {
  id: string;
  type: 'order_created' | 'order_updated' | 'order_status_changed';
  message: string;
  orderNumber?: string;
  createdAt: Date | string;
}

interface OrderCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function OrderCommentsModal({
  isOpen,
  onClose,
  orderId
}: OrderCommentsModalProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get user display name from user data
  const getUserDisplayName = (userData: any): string => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    if (userData?.email) {
      return userData.email.split('@')[0];
    }
    return 'User';
  };

  // Fetch order data and comments
  useEffect(() => {
    if (isOpen && orderId) {
      const fetchOrderData = async () => {
        setIsLoading(true);
        try {
          const response = await getOrder(orderId, {
            relations: ['customer', 'staff', 'retailer']
          });

          if (response.success && response.data) {
            setOrder(response.data);

            // Parse comments from order.comments (if it's a string, parse it)
            // For now, we'll create mock comments from the order data
            // In a real implementation, you'd have a separate comments endpoint
            const orderComments = response.data.comments;
            if (orderComments) {
              // If comments is a string, try to parse it as JSON
              // Otherwise, treat it as a single comment
              try {
                const parsed =
                  typeof orderComments === 'string'
                    ? JSON.parse(orderComments)
                    : orderComments;
                if (Array.isArray(parsed)) {
                  setComments(parsed);
                } else if (parsed) {
                  setComments([parsed]);
                }
              } catch {
                // If parsing fails, treat as plain text
                if (orderComments) {
                  setComments([
                    {
                      id: '1',
                      userId: user?.id || '',
                      userName: getUserDisplayName(user),
                      userEmail: user?.email || '',
                      message: orderComments,
                      createdAt: response.data.createdAt
                    }
                  ]);
                }
              }
            }

            // Create activity feed from order creation
            const orderActivities: Activity[] = [
              {
                id: '1',
                type: 'order_created',
                message: `You created order #${orderId.slice(0, 8)} for this customer`,
                orderNumber: `#${orderId.slice(0, 8)}`,
                createdAt: response.data.createdAt
              }
            ];
            setActivities(orderActivities);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
          toast.error('Failed to load order comments');
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrderData();
    }
  }, [isOpen, orderId, user]);

  const handlePostComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      // Update order with new comment
      // In a real implementation, you'd have a separate comments API endpoint
      const currentComments = comments || [];
      // Get user display name
      const userName = getUserDisplayName(user);
      const userEmail = user?.email || '';

      const newComment: Comment = {
        id: Date.now().toString(),
        userId: user?.id || '',
        userName: userName,
        userEmail: userEmail,
        message: comment,
        createdAt: new Date().toISOString()
      };

      // For now, we'll append to the comments field
      // In production, you'd call a dedicated comments API
      const updatedComments = [...currentComments, newComment];
      const commentsString = JSON.stringify(updatedComments);

      const response = await updateOrder(orderId, {
        comments: commentsString
      });

      if (response.success) {
        setComments([...currentComments, newComment]);
        setComment('');
        toast.success('Comment posted successfully');
      } else {
        toast.error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('An error occurred while posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserInitials = (name: string, email: string): string => {
    if (name && name !== 'User') {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name[0]?.toUpperCase() || 'U';
    }
    return email[0]?.toUpperCase() || 'U';
  };

  const formatTimestamp = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - dateObj.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60)
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }
      if (diffInMinutes < 2880)
        return 'Yesterday at ' + format(dateObj, 'h:mm a');
      return format(dateObj, 'd MMMM') + ' at ' + format(dateObj, 'h:mm a');
    } catch {
      return 'Recently';
    }
  };

  const formatActivityDate = (date: Date | string): string => {
    return formatDate(date);
  };

  const formatActivityTime = (date: Date | string): string => {
    return formatTime(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col'>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className='flex min-h-0 flex-1 flex-col'>
          {/* Comment Input Section */}
          <div className='space-y-2 border-b pb-4'>
            <p className='text-muted-foreground text-xs'>
              This is visible only to your members of staff
            </p>
            <div className='flex gap-3'>
              <Avatar className='h-8 w-8 shrink-0'>
                <AvatarFallback className='bg-purple-100 text-purple-700'>
                  {getUserInitials(getUserDisplayName(user), user?.email || '')}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 space-y-2'>
                <Textarea
                  placeholder='Start typing your comment or message'
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className='min-h-[80px] resize-none'
                  disabled={isSubmitting || isLoading}
                />
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      type='button'
                    >
                      <IconMoodSmile className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      type='button'
                    >
                      <IconAt className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      type='button'
                    >
                      <IconPaperclip className='h-4 w-4' />
                    </Button>
                  </div>
                  <Button
                    onClick={handlePostComment}
                    disabled={!comment.trim() || isSubmitting || isLoading}
                    size='sm'
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments and Activity Feed */}
          <ScrollArea className='mt-4 flex-1'>
            <div className='space-y-4'>
              {/* Comments Section */}
              {comments.length > 0 && (
                <div className='space-y-3'>
                  {comments.map((commentItem) => (
                    <div
                      key={commentItem.id}
                      className='flex gap-3 rounded-lg border bg-gray-50 p-3'
                    >
                      <Avatar className='h-8 w-8 shrink-0'>
                        <AvatarFallback className='bg-purple-100 text-purple-700'>
                          {getUserInitials(
                            commentItem.userName,
                            commentItem.userEmail
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-semibold'>
                                {commentItem.userName}
                              </span>
                              <span className='text-muted-foreground text-xs'>
                                {formatTimestamp(commentItem.createdAt)}
                              </span>
                            </div>
                            <p className='mt-1 text-sm text-gray-700'>
                              {commentItem.message}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6'
                              >
                                <IconDots className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem className='text-red-600'>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Feed Section */}
              {activities.length > 0 && (
                <div className='mt-6 space-y-4'>
                  <div className='flex items-center gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='h-4 w-0.5 bg-gray-300'></div>
                      <div className='mt-1 h-3 w-3 rounded-full bg-green-500'></div>
                      <div className='mt-1 h-4 w-0.5 bg-gray-300'></div>
                      <div className='mt-1 h-3 w-3 rounded-full bg-green-500'></div>
                      <div className='mt-1 w-0.5 flex-1 bg-gray-300'></div>
                    </div>
                    <div className='flex-1 space-y-4'>
                      {activities.map((activity, index) => {
                        const prevActivity = activities[index - 1];
                        const showDate =
                          !prevActivity ||
                          formatActivityDate(activity.createdAt) !==
                            formatActivityDate(prevActivity.createdAt);

                        return (
                          <div key={activity.id} className='space-y-1'>
                            {showDate && (
                              <div className='mb-2 text-sm font-medium text-gray-700'>
                                {formatActivityDate(activity.createdAt)}
                              </div>
                            )}
                            <div className='flex items-start justify-between gap-2'>
                              <p className='text-sm text-gray-700'>
                                {activity.message.split('#').map((part, i) => {
                                  if (i === 0) return part;
                                  const orderNum =
                                    activity.orderNumber?.replace('#', '') ||
                                    '';
                                  return (
                                    <span key={i}>
                                      <span className='font-medium text-blue-600'>
                                        #{orderNum}
                                      </span>
                                      {part}
                                    </span>
                                  );
                                })}
                              </p>
                              <span className='text-muted-foreground shrink-0 text-xs'>
                                {formatActivityTime(activity.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {comments.length === 0 &&
                activities.length === 0 &&
                !isLoading && (
                  <div className='text-muted-foreground py-8 text-center'>
                    No comments or activity yet
                  </div>
                )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
