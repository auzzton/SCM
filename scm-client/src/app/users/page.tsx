'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Shield, Check, X } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            api.get('/users')
                .then(res => setUsers(res.data))
                .catch(err => console.error(err));
        }
    }, [user]);

    if (user?.role !== 'ADMIN') {
        return <div className="p-8 text-red-600">Access Denied: Admin only.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                    {u.username}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                        <Shield className="h-3 w-3" />
                                        {u.role}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                    {u.active ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
