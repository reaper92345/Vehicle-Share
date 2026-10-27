import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  // Placeholder – you can later add charts or analytics here
  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-700">
        Welcome, admin! Use the sidebar to navigate to user management or other admin tools.
      </p>
      <div className="mt-6">
        <Link href="/admin/users" className="text-blue-600 hover:underline">
          Manage Users →
        </Link>
      </div>
    </section>
  );
}
