'use client';

import React, { useState, useEffect, use } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowLeftIcon, SaveIcon, EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    roleId: '',
    isActive: true
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          fetch(`/api/admin/users/${id}`),
          fetch('/api/admin/roles')
        ]);

        if (userRes.ok && rolesRes.ok) {
          const userData = await userRes.json();
          const rolesData = await rolesRes.json();
          
          setRoles(rolesData);
          setFormData({
            username: userData.username,
            email: userData.email,
            password: '', // Keep empty unless changing
            confirmPassword: '',
            firstName: userData.firstName,
            lastName: userData.lastName,
            roleId: userData.roleId.toString(),
            isActive: userData.isActive
          });
        } else {
          alert('User not found');
          router.push('/admin/users');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.roleId) {
      alert('Please fill in all required fields');
      return;
    }

    // Password match validation (only if password is being changed)
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          roleId: parseInt(formData.roleId),
          // Send password only if it's not empty
          password: formData.password || undefined 
        }),
      });

      if (response.ok) {
        alert('User updated successfully!');
        router.push('/admin/users');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        <div className="flex items-center space-x-4">
          <Link href="/admin/users" className="p-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit User</h1>
            <p className="text-gray-400 mt-1">Update details for {formData.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info Section */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                <select name="roleId" value={formData.roleId} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                  <option value="">Select Role</option>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 bg-gray-800 border-gray-600 rounded text-blue-600" />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">Account Active</label>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-blue-400 mb-4 italic">Leave password blank if you do not want to change it.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white pr-10 outline-none focus:border-blue-500" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">{showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}</button>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white pr-10 outline-none focus:border-blue-500" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-gray-400">{showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link href="/admin/users" className="px-6 py-2 text-gray-300 hover:text-white">Cancel</Link>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <SaveIcon className="h-4 w-4" />
              <span>{isSaving ? 'Updating...' : 'Update User'}</span>
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}