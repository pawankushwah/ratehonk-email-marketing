"use client";
import React from 'react';
import Link from 'next/link';
import { trpc } from '@/app/trpc';
import { useBusinessStore } from '@/app/store/useBusinessStore';
import { Users, Mail, MousePointerClick, Activity, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

// Dummy data for charts
const emailPerformanceData = [
  { name: 'Mon', sent: 4000, opened: 2400, clicked: 1200 },
  { name: 'Tue', sent: 3000, opened: 1398, clicked: 800 },
  { name: 'Wed', sent: 2000, opened: 9800, clicked: 2400 },
  { name: 'Thu', sent: 2780, opened: 3908, clicked: 1800 },
  { name: 'Fri', sent: 1890, opened: 4800, clicked: 2100 },
  { name: 'Sat', sent: 2390, opened: 3800, clicked: 1900 },
  { name: 'Sun', sent: 3490, opened: 4300, clicked: 2100 },
];

export default function BusinessDashboard() {
  const { data: sessionData } = trpc.auth.getSession.useQuery();
  const user = sessionData?.user;

  const { activeBusinessId } = useBusinessStore();

  // We fetch businesses and use the active one
  const { data: businessesData } = trpc.user.getBusinesses.useQuery(undefined, { enabled: !!user });
  const businesses = businessesData?.businesses || [];
  const activeBusiness = businesses.find((b: any) => b.id === activeBusinessId) || businesses[0];

  if (!user || !activeBusiness) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
        <div className="h-96 bg-gray-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Business Header & Banner */}
      <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm relative group">
        
        {/* Edit Button */}
        <Link 
          href={`/dashboard/profile?tab=businesses&edit=true`}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-text px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border border-gray-200 backdrop-blur-sm transition-all flex items-center opacity-0 group-hover:opacity-100"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Details
        </Link>

        {/* Banner Area */}
        <div className={`h-48 w-full relative ${!activeBusiness.bannerUrl ? 'bg-gradient-to-r from-main/80 to-main' : 'bg-gray-100'}`}>
          {activeBusiness.bannerUrl && (
            <img 
              src={activeBusiness.bannerUrl} 
              alt="Business Banner" 
              className="w-full h-full object-cover"
            />
          )}
          {/* Decorative Pattern (only if no banner) */}
          {!activeBusiness.bannerUrl && (
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          )}
        </div>

        {/* Business Info Overlay */}
        <div className="px-8 pb-8 relative flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex-shrink-0 z-10 -mt-12 sm:-mt-16">
            <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-4xl font-bold text-main border border-gray-100 overflow-hidden">
              {activeBusiness.logoUrl ? (
                <img src={activeBusiness.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                activeBusiness.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          
          <div className="flex-1 pt-4 sm:pt-6 flex flex-col sm:flex-row gap-6 justify-between items-start w-full">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text">{activeBusiness.name}</h1>
              <p className="text-text-dim mt-1 max-w-2xl leading-relaxed">
                {activeBusiness.description || 'Welcome to your business dashboard. Configure your business description in settings.'}
              </p>
            </div>

            <div className="flex flex-col space-y-2 bg-gray-50 px-4 py-3 rounded-xl border border-border sm:max-w-xs w-full sm:w-auto">
              <div className="flex items-center text-sm text-text-dim">
                <Mail className="w-4 h-4 mr-2 text-main flex-shrink-0" />
                <span className="truncate">{activeBusiness.contactEmail || user.email}</span>
              </div>
              <div className="flex items-center text-sm text-text-dim">
                <Activity className="w-4 h-4 mr-2 text-main flex-shrink-0" />
                <a href={activeBusiness.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-main transition-colors truncate">
                  {activeBusiness.websiteUrl || 'No website'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Matrix */}
      <div>
        <h3 className="text-xl font-bold text-text mb-4">Overview Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5E8EB] flex flex-col relative group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 rounded-full bg-[#0EA5E9] ring-4 ring-white flex items-center justify-center text-white">
                <Users className="w-6 h-6" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
            <h4 className="text-[#374151] text-[17px] font-medium mb-3">Total Contacts</h4>
            <div className="flex items-end justify-between">
              <p className="text-[40px] leading-none font-black text-[#374151] tracking-tight">{activeBusiness.contactCount || '1,245'}</p>
              <div className="flex items-center text-[#51C85F] text-[15px] font-medium bg-[#D7FFDC] border border-[#51C85F] px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                12%
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5E8EB] flex flex-col relative group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 rounded-full bg-[#0EA5E9] ring-4 ring-white flex items-center justify-center text-white">
                <Mail className="w-6 h-6" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
            <h4 className="text-[#374151] text-[17px] font-medium mb-3">Emails sent</h4>
            <div className="flex items-end justify-between">
              <p className="text-[40px] leading-none font-black text-[#374151] tracking-tight">5,189</p>
              <div className="flex items-center text-[#51C85F] text-[15px] font-medium bg-[#D7FFDC] border border-[#51C85F] px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                100%
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5E8EB] flex flex-col relative group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 rounded-full bg-[#0EA5E9] ring-4 ring-white flex items-center justify-center text-white">
                <Activity className="w-6 h-6" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
            <h4 className="text-[#374151] text-[17px] font-medium mb-3">Open Rate</h4>
            <div className="flex items-end justify-between">
              <p className="text-[40px] leading-none font-black text-[#374151] tracking-tight">42.8%</p>
              <div className="flex items-center text-red-600 text-[15px] font-medium bg-red-50 border border-red-500 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                2%
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5E8EB] flex flex-col relative group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 rounded-full bg-[#0EA5E9] ring-4 ring-white flex items-center justify-center text-white">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </div>
            <h4 className="text-[#374151] text-[17px] font-medium mb-3">Click Rate</h4>
            <div className="flex items-end justify-between">
              <p className="text-[40px] leading-none font-black text-[#374151] tracking-tight">15.2%</p>
              <div className="flex items-center text-[#51C85F] text-[15px] font-medium bg-[#D7FFDC] border border-[#51C85F] px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                5%
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white border border-border rounded-3xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text">Email Performance</h3>
            <select className="bg-gray-50 border border-border text-sm rounded-lg px-3 py-1.5 outline-none font-medium text-text">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emailPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{stroke: '#e5e7eb', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="opened" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorOpened)" />
                <Area type="monotone" dataKey="clicked" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorClicked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Bar Chart */}
        <div className="bg-white border border-border rounded-3xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-text mb-6">Campaign Types</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emailPerformanceData.slice(0, 4)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="sent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
