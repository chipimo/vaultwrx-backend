'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import {
  getStaff,
  getUsers,
  createStaff,
  createUser,
  StaffMember,
  UserMember,
  getUserData
} from '@/lib/api-client';
import { toast } from 'sonner';

type StaffView = 'main' | 'add-user' | 'add-staff';

export function StaffTab() {
  const [view, setView] = useState<StaffView>('main');
  const [users, setUsers] = useState<UserMember[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, staffResponse] = await Promise.all([
        getUsers({ includes: 'role,retailer' }),
        getStaff({ includes: 'user,user.role' })
      ]);

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data.rows || []);
      }

      if (staffResponse.success && staffResponse.data) {
        setStaff(staffResponse.data.rows || []);
      }
    } catch (error) {
      console.error('Failed to fetch users and staff:', error);
      toast.error('Failed to load users and staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserAdded = () => {
    fetchData();
    setView('main');
  };

  const handleStaffAdded = () => {
    fetchData();
    setView('main');
  };

  if (view === 'add-user') {
    return <AddUserForm onBack={() => setView('main')} onDone={handleUserAdded} />;
  }

  if (view === 'add-staff') {
    return <AddStaffForm onBack={() => setView('main')} onDone={handleStaffAdded} users={users} />;
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <IconLoader2 className='size-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Users Section */}
      <Card>
        <CardContent className='p-6'>
          <div className='mb-4 flex items-start justify-between'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>Users</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                They have credentials to login
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={() => setView('add-user')}>
              Add Users
            </Button>
          </div>
          <div className='space-y-3'>
            {users.length === 0 ? (
              <p className='py-4 text-center text-sm text-muted-foreground'>
                No users found
              </p>
            ) : (
              users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Section */}
      <Card>
        <CardContent className='p-6'>
          <div className='mb-4 flex items-start justify-between'>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>Staff</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                They get assigned to orders
              </p>
            </div>
            <Button variant='outline' size='sm' onClick={() => setView('add-staff')}>
              Add Staff
            </Button>
          </div>
          <div className='space-y-3'>
            {staff.length === 0 ? (
              <p className='py-4 text-center text-sm text-muted-foreground'>
                No staff found
              </p>
            ) : (
              staff.map((member) => (
                <StaffRow key={member.id} staff={member} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({ user }: { user: UserMember }) {
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
  const roleName = user.role?.name || 'User';

  return (
    <div className='flex items-center justify-between rounded-lg border p-4'>
      <div className='flex items-center gap-8'>
        <div>
          <p className='text-sm font-medium text-foreground'>{fullName}</p>
          <p className='text-sm text-muted-foreground'>{user.email}</p>
        </div>
      </div>
      <Badge
        variant='outline'
        className='border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
      >
        {roleName}
      </Badge>
    </div>
  );
}

function StaffRow({ staff }: { staff: StaffMember }) {
  const fullName = staff.user
    ? `${staff.user.first_name || ''} ${staff.user.last_name || ''}`.trim()
    : 'N/A';
  const email = staff.user?.email || 'N/A';
  const position = staff.position || staff.department || '';

  return (
    <div className='flex items-center justify-between rounded-lg border p-4'>
      <div className='flex items-center gap-8'>
        <div>
          <p className='text-sm font-medium text-foreground'>{fullName}</p>
          <p className='text-sm text-muted-foreground'>{email}</p>
        </div>
        {position && (
          <p className='text-sm text-muted-foreground'>{position}</p>
        )}
      </div>
      <Badge
        variant={staff.isActive ? 'outline' : 'secondary'}
        className={staff.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : ''}
      >
        {staff.isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
}

// Add User Form Component
function AddUserForm({
  onBack,
  onDone
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ''
  });

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const userData = getUserData();
      const response = await createUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role_id: formData.role || 'user',
        company_id: userData?.company_id
      });

      if (response.success) {
        toast.success('User created successfully');
        onDone();
      } else {
        toast.error(response.error?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
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
          ADD USER
        </span>
      </button>

      <Card>
        <CardContent className='space-y-6 p-6'>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>Users</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              They have credentials to login
            </p>
          </div>

          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger className='w-full border-0 border-b rounded-none px-0 focus:ring-0'>
              <SelectValue placeholder='Role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='admin'>Admin</SelectItem>
              <SelectItem value='manager'>Manager</SelectItem>
              <SelectItem value='staff'>Staff</SelectItem>
              <SelectItem value='viewer'>Viewer</SelectItem>
            </SelectContent>
          </Select>

          <div className='grid grid-cols-2 gap-4'>
            <Input
              placeholder='First Name *'
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
            <Input
              placeholder='Last Name'
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
            />
          </div>

          <Input
            placeholder='Email *'
            type='email'
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <Input
            placeholder='Password *'
            type='password'
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={onBack} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <IconLoader2 className='mr-2 size-4 animate-spin' /> : null}
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Staff Form Component
function AddStaffForm({
  onBack,
  onDone,
  users
}: {
  onBack: () => void;
  onDone: () => void;
  users: UserMember[];
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    department: '',
    position: ''
  });

  const handleSubmit = async () => {
    if (!formData.userId) {
      toast.error('Please select a user');
      return;
    }

    setLoading(true);
    try {
      const userData = getUserData();
      const response = await createStaff({
        user_id: formData.userId,
        company_id: userData?.company_id || '',
        department: formData.department || undefined,
        position: formData.position || undefined,
        isActive: true
      });

      if (response.success) {
        toast.success('Staff member added successfully');
        onDone();
      } else {
        toast.error(response.error?.message || 'Failed to add staff member');
      }
    } catch (error) {
      console.error('Failed to add staff:', error);
      toast.error('Failed to add staff member');
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
          ADD STAFF
        </span>
      </button>

      <Card>
        <CardContent className='space-y-6 p-6'>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>Staff</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              They get assigned to orders
            </p>
          </div>

          <Select
            value={formData.userId}
            onValueChange={(value) => setFormData({ ...formData, userId: value })}
          >
            <SelectTrigger className='w-full border-0 border-b rounded-none px-0 focus:ring-0'>
              <SelectValue placeholder='Select User *' />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder='Department'
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <Input
            placeholder='Position'
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className='border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground'
          />

          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={onBack} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <IconLoader2 className='mr-2 size-4 animate-spin' /> : null}
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
