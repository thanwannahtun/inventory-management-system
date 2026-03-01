'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { SearchIcon, EditIcon, TrashIcon, PlusIcon, UserIcon, ShieldIcon, MailIcon, CalendarIcon } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: number;
    name: string;
    description: string;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          roleId: 1,
          isActive: true,
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          role: {
            id: 1,
            name: 'Administrator',
            description: 'System administrator with full access'
          }
        },
        {
          id: 2,
          username: 'manager',
          email: 'manager@example.com',
          firstName: 'Store',
          lastName: 'Manager',
          roleId: 2,
          isActive: true,
          lastLogin: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-14T15:45:00Z',
          role: {
            id: 2,
            name: 'Manager',
            description: 'Store manager with limited admin access'
          }
        },
        {
          id: 3,
          username: 'user',
          email: 'user@example.com',
          firstName: 'Regular',
          lastName: 'User',
          roleId: 3,
          isActive: true,
          lastLogin: '2024-01-13T09:20:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-13T09:20:00Z',
          role: {
            id: 3,
            name: 'User',
            description: 'Regular user with basic access'
          }
        }
      ];
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUsers(users.filter(user => user.id !== id));
          alert('User deleted successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === id ? { ...user, isActive: !currentStatus } : user
        ));
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role?.name === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Administrator': return 'bg-red-900 text-red-300';
      case 'Manager': return 'bg-blue-900 text-blue-300';
      case 'User': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-1">Manage system users and permissions</p>
          </div>
          <Link
            href="/admin/users/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add User</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Total Users: {users.length}</span>
              <span>Active: {users.filter(u => u.isActive).length}</span>
              <span>Inactive: {users.filter(u => !u.isActive).length}</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role?.name || '')}`}>
                        <ShieldIcon className="h-3 w-3 mr-1" />
                        {user.role?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          user.isActive 
                            ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/users/edit/${user.id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No users found matching your criteria</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
