import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  return (
    <div className="flex flex-col w-full">
      <AdminHeader />
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
}
