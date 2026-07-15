"use client";
import React, { useState } from 'react';
import { trpc } from '@/app/trpc';
import { useToast } from '@/app/hooks/useToast';
import { CreditCard, Users, Plus, Check, LayoutGrid, Activity, Briefcase } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import Button from '@/app/components/ui/button';

type Tab = 'plans' | 'subscriptions';

const AVAILABLE_MODULES = [
  { id: 'campaigns', name: 'Email Campaigns', icon: <Activity className="w-5 h-5" />, features: ['Drag & Drop Builder', 'A/B Testing', 'Scheduling'] },
  { id: 'automations', name: 'Automations', icon: <LayoutGrid className="w-5 h-5" />, features: ['Workflow Builder', 'Trigger Rules', 'Conditional Logic'] },
  { id: 'audience', name: 'Audience Management', icon: <Users className="w-5 h-5" />, features: ['Segmentation', 'Custom Fields', 'Tags'] },
  { id: 'analytics', name: 'Advanced Analytics', icon: <Activity className="w-5 h-5" />, features: ['Heatmaps', 'Geo-tracking', 'Click Maps'] },
];

export default function SaasDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('plans');
  const { addToast } = useToast();

  const { data: plansData, refetch: refetchPlans } = trpc.saas.getPlans.useQuery();
  const plans = plansData?.plans || [];

  const { data: subsData, refetch: refetchSubs } = trpc.saas.getActiveSubscriptions.useQuery();
  const subscriptions = subsData?.subscriptions || [];

  const { data: usersData } = trpc.saas.getUsers.useQuery();
  const allUsers = usersData?.users || [];

  // Plan Creation State
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [price, setPrice] = useState(0);
  const [emailsLimit, setEmailsLimit] = useState(1000);
  const [contactsLimit, setContactsLimit] = useState(500);
  const [dailyLimit, setDailyLimit] = useState(100);
  const [templatesAllowed, setTemplatesAllowed] = useState('basic');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const createPlanMutation = trpc.saas.createPlan.useMutation({
    onSuccess: () => {
      addToast("Plan created successfully", "success");
      setIsCreatingPlan(false);
      refetchPlans();
    },
    onError: (err) => addToast(err.message, "error")
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    createPlanMutation.mutate({
      name: planName,
      description: planDesc,
      monthlyPrice: Number(price),
      emailLimit: Number(emailsLimit),
      contactLimit: Number(contactsLimit),
      dailyEmailLimit: Number(dailyLimit),
      templatesAllowed,
      modules: selectedModules
    });
  };

  const toggleModule = (id: string) => {
    setSelectedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  // Subscription Assignment State
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const assignMutation = trpc.saas.assignSubscription.useMutation({
    onSuccess: () => {
      addToast("Subscription assigned!", "success");
      setIsAssigning(false);
      refetchSubs();
    },
    onError: (err) => addToast(err.message, "error")
  });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedPlanId) return addToast("Please select user and plan", "error");
    assignMutation.mutate({ userId: selectedUserId, planId: selectedPlanId });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">SaaS Administration</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex overflow-hidden">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 flex items-center justify-center px-6 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'plans' ? 'border-main text-main bg-main/5' : 'border-transparent text-text-dim hover:text-text hover:bg-gray-50'}`}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 flex items-center justify-center px-6 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'subscriptions' ? 'border-main text-main bg-main/5' : 'border-transparent text-text-dim hover:text-text hover:bg-gray-50'}`}
        >
          <Users className="w-4 h-4 mr-2" />
          Active Subscriptions
        </button>
      </div>

      {/* PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {!isCreatingPlan ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text">Available Plans</h3>
                <Button onClick={() => setIsCreatingPlan(true)} className="!py-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Plan
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan: any) => (
                  <div key={plan.id} className="border border-gray-200 rounded-2xl p-6 flex flex-col bg-gray-50/50">
                    <h4 className="text-xl font-bold text-text mb-2">{plan.name}</h4>
                    <p className="text-sm text-text-dim mb-4 line-clamp-2 min-h-[40px]">{plan.description || 'No description'}</p>
                    <div className="text-3xl font-black text-text mb-6">
                      ${plan.monthlyPrice} <span className="text-sm font-normal text-text-dim">/mo</span>
                    </div>
                    <div className="space-y-3 mb-6 flex-1 text-sm text-text">
                      <div className="flex justify-between"><span>Emails:</span> <span className="font-bold">{plan.emailLimit}</span></div>
                      <div className="flex justify-between"><span>Contacts:</span> <span className="font-bold">{plan.contactLimit}</span></div>
                      <div className="flex justify-between"><span>Daily Emails:</span> <span className="font-bold">{plan.dailyEmailLimit}</span></div>
                      <div className="flex justify-between"><span>Templates:</span> <span className="font-bold capitalize">{plan.templatesAllowed}</span></div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs font-semibold text-text-dim mb-2 uppercase tracking-wider">Modules Included</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.modules.length > 0 ? plan.modules.map((m: string) => (
                          <span key={m} className="px-2 py-1 bg-main/10 text-main rounded text-xs font-semibold">{m}</span>
                        )) : <span className="text-xs text-text-dim">None</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-text">Create Subscription Plan</h3>
                <button onClick={() => setIsCreatingPlan(false)} className="text-text-dim hover:text-text font-semibold text-sm">Cancel</button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Plan Name" value={planName} onChange={e => setPlanName(e.target.value)} required />
                  <Input label="Monthly Price ($)" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                  <div className="md:col-span-2">
                    <Input label="Description" value={planDesc} onChange={e => setPlanDesc(e.target.value)} />
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h4 className="text-lg font-bold text-text mb-4">Plan Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Input label="Max Emails" type="number" value={emailsLimit} onChange={e => setEmailsLimit(Number(e.target.value))} required />
                    <Input label="Max Contacts" type="number" value={contactsLimit} onChange={e => setContactsLimit(Number(e.target.value))} required />
                    <Input label="Daily Email Limit" type="number" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} required />
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-semibold text-text">Templates Allowed</label>
                      <select 
                        value={templatesAllowed} 
                        onChange={e => setTemplatesAllowed(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-main text-text"
                      >
                        <option value="basic">Basic Only</option>
                        <option value="basic+pro">Basic + Pro</option>
                        <option value="all">All Templates</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modules Selection */}
                <div>
                  <h4 className="text-lg font-bold text-text mb-4">Select Modules & Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {AVAILABLE_MODULES.map(module => {
                      const isSelected = selectedModules.includes(module.id);
                      return (
                        <div 
                          key={module.id} 
                          onClick={() => toggleModule(module.id)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-main bg-main/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-main text-white' : 'bg-gray-100 text-text-dim'}`}>
                                {module.icon}
                              </div>
                              <h5 className="font-bold text-text text-lg">{module.name}</h5>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-main bg-main' : 'border-gray-300'}`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {module.features.map(feat => (
                              <div key={feat} className="flex items-center space-x-2 text-sm text-text-dim">
                                <div className="w-1.5 h-1.5 rounded-full bg-main/50"></div>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <Button type="submit" disabled={createPlanMutation.isPending} className="px-8">
                    {createPlanMutation.isPending ? "Creating..." : "Create Subscription Plan"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {!isAssigning ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text">Active Subscriptions</h3>
                <Button onClick={() => setIsAssigning(true)} className="!py-2">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Assign Plan to User
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm text-text-dim">
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Plan Name</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-text-dim">No active subscriptions found.</td>
                      </tr>
                    ) : subscriptions.map((sub: any) => (
                      <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-medium text-text">
                          {sub.user.firstName} {sub.user.lastName} <br/>
                          <span className="text-xs text-text-dim font-normal">{sub.user.email}</span>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full">
                            {sub.plan.name}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-green-50 text-green-700 font-semibold text-xs rounded-full capitalize">
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-text-dim">
                          {new Date(sub.startDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text">Assign Subscription Plan</h3>
                <button onClick={() => setIsAssigning(false)} className="text-text-dim hover:text-text font-semibold text-sm">Cancel</button>
              </div>

              <form onSubmit={handleAssign} className="space-y-6">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-text">Select User</label>
                  <select 
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-main text-text"
                    required
                  >
                    <option value="" disabled>Select a user...</option>
                    {allUsers.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-text">Select Plan</label>
                  <select 
                    value={selectedPlanId}
                    onChange={e => setSelectedPlanId(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-main text-text"
                    required
                  >
                    <option value="" disabled>Select a plan...</option>
                    {plans.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} - ${p.monthlyPrice}/mo</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={assignMutation.isPending} className="w-full">
                    {assignMutation.isPending ? "Assigning..." : "Assign Plan"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}