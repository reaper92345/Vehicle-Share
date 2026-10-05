"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const equipment = [
  {
    id: '1',
    title: 'Heavy Duty Power Tiller',
    category: 'Agriculture',
    location: 'Nagpur',
    price: '₹1,500/day',
    image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '2',
    title: 'Concrete Mixer 10/7 Cu. Ft.',
    category: 'Construction',
    location: 'Pune',
    price: '₹2,800/day',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '3',
    title: 'Aluminum Scaffolding Tower',
    category: 'Construction',
    location: 'Bhopal',
    price: '₹1,200/day',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/equipment?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/equipment');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100">
      <header className="w-full">
        <nav className="flex items-center justify-between w-full border border-slate-200 bg-white/80 py-4 backdrop-blur-sm shadow-sm">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">E</div>
            <div>
              <p className="text-lg font-semibold text-slate-900">EquipShare</p>
              <p className="text-xs text-slate-500">Rent heavy equipment smarter</p>
            </div>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <Link href="/equipment" className="font-medium hover:text-slate-900">Browse Equipment</Link>
            <a href="#discover" className="hover:text-slate-900">Discover</a>
            <a href="#how-it-works" className="hover:text-slate-900">How it works</a>
            <a href="#owners" className="hover:text-slate-900">For owners</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Peer-to-peer rental marketplace
          </p>
          <h1 className="max-w-xl text-4xl font-black leading-tight text-slate-900 md:text-6xl">
            Rent trusted farm and construction gear in hours.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            EquipShare matches equipment owners and renters with a simple, fast booking flow for power tillers, concrete mixers, scaffolding, and more.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/equipment" className="btn-primary px-6 py-3 text-base">
              Find Equipment
            </Link>
            <Link href="/equipment/create" className="btn-primary bg-slate-900 hover:bg-slate-800 px-6 py-3 text-base">
              List Your Equipment
            </Link>
          </div>

          <div className="mt-8 flex gap-8 text-sm text-slate-600">
            <div>
              <p className="text-2xl font-bold text-slate-900">2k+</p>
              <p>Active listings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">98%</p>
              <p>Booking satisfaction</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">24/7</p>
              <p>Rental support</p>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden p-4">
          <div className="rounded-2xl bg-slate-100 p-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 rounded-xl bg-white p-2 shadow-sm">
              <input
                className="input border-none shadow-none focus:ring-0"
                placeholder="Search equipment or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary whitespace-nowrap px-4 py-2">
                Search
              </button>
            </form>

            <div className="mt-4 flex gap-2">
              <Link href="/equipment?category=Agriculture" className="rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-900">
                Agriculture
              </Link>
              <Link href="/equipment?category=Construction" className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-300">
                Construction
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {equipment.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-md">
                  <img src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.category} • {item.location}</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Available</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{item.price}</p>
                      <Link href="/equipment" className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-800">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-700">Popular categories</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Explore the equipment you need</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: 'Agriculture', category: 'Agriculture', desc: 'Power tillers, irrigation pumps, harvest tools', count: '460 listings' },
            { name: 'Construction', category: 'Construction', desc: 'Concrete mixers, compactors, scaffolding', count: '780 listings' },
            { name: 'Heavy duty', category: '', desc: 'Industrial support machinery and tools', count: '320 listings' },
          ].map((cat) => (
            <Link key={cat.name} href={cat.category ? `/equipment?category=${cat.category}` : '/equipment'} className="card block p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-700">⚙️</div>
              <h3 className="text-xl font-semibold text-slate-900">{cat.name}</h3>
              <p className="mt-2 text-slate-600">{cat.desc}</p>
              <p className="mt-6 text-sm font-medium text-brand-700">{cat.count} &rarr;</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-100">How it works</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Fast, transparent, and secure</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ['1', 'Search & compare', 'Find equipment by category, location, and rental price.'],
              ['2', 'Book securely', 'Request a date range; owners approve or reject in-app.'],
              ['3', 'Use & review', 'Complete the rental, then leave a rating and feedback.'],
            ].map(([step, title, text]) => (
              <div key={step} className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white">{step}</div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="owners" className="mx-auto max-w-7xl px-6 py-20">
        <div className="card p-8 md:flex md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-700">For equipment owners</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Turn idle machines into recurring income.</h2>
          </div>
          <Link href="/equipment/create" className="mt-5 btn-primary md:mt-0 text-center">Start listing now</Link>
        </div>
      </section>
    </main>
  );
}
