"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Stats = {
  totalUsers: number;
  totalEquipment: number;
  activeBookings: number;
  totalRevenue: number;
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchStats = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = localStorage.getItem('equipshare_token');
    try {
      const res = await fetch(`${apiUrl}/api/admin/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (e) {
      setError('Network error while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p className="p-6">Loading analytics...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  const chartData = {
    labels: ['Users', 'Equipment', 'Bookings', 'Revenue'],
    datasets: [
      {
        label: 'Counts / Amount',
        data: stats ? [stats.totalUsers, stats.totalEquipment, stats.activeBookings, stats.totalRevenue] : [],
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Admin Metrics Overview' },
    },
  };

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
      {stats && <Bar data={chartData} options={chartOptions} />}
    </section>
  );
}
