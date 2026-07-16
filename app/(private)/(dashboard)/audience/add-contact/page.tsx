"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/app/trpc';
import Button from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useToast } from '@/app/hooks/useToast';
import { useBusinessStore } from '@/app/store/useBusinessStore';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddContactPage() {
  const router = useRouter();
  const { addToast: showToast } = useToast();
  const activeBusinessId = useBusinessStore(state => state.activeBusinessId);
  
  // Form State
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthday, setBirthday] = useState('');
  const [company, setCompany] = useState('');
  
  // Address State
  const [address, setAddress] = useState({
    street: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  // Tags State
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // API Hooks
  const { data: tagsData, refetch: refetchTags } = trpc.tags.getTags.useQuery(
    { businessId: activeBusinessId || '' },
    { enabled: !!activeBusinessId }
  );
  const tags = (tagsData && 'tags' in tagsData ? tagsData.tags : []) || [];

  const addContactMutation = trpc.audience.addContact.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        showToast(('message' in data ? data.message : undefined) || 'Contact added', 'success');
        router.push('/audience');
      } else {
        showToast(('error' in data ? data.error : undefined) || 'Failed to add contact', 'error');
      }
    }
  });

  const addTagMutation = trpc.tags.addTag.useMutation({
    onSuccess: (data) => {
      if (data.success && 'tag' in data && data.tag) {
        setSelectedTagIds(prev => [...prev, data.tag!.id]);
        setNewTagName('');
        refetchTags();
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusinessId) {
      showToast('No active workspace selected', 'error');
      return;
    }
    if (!email) {
      showToast('Email is required', 'error');
      return;
    }

    addContactMutation.mutate({
      businessId: activeBusinessId,
      email,
      firstName,
      lastName,
      phoneNumber,
      birthday,
      company,
      address,
      selectedTagIds,
      subscriptionStatus: consent ? 'Subscribed' : 'Non-subscribed',
      updateExisting,
      source: 'Manual'
    });
  };

  const handleCreateTag = () => {
    if (newTagName.trim() && activeBusinessId) {
      addTagMutation.mutate({ businessId: activeBusinessId, name: newTagName.trim() });
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  if (!activeBusinessId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please select or create a workspace to manage audience contacts.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <div className="mb-6">
        <Link href="/audience" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Contacts
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add contact</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Marketing consent */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Marketing consent</h3>
            <p className="text-sm text-gray-500 mb-6">
              To send marketing-related emails, you must comply with local laws and regulations and obtain opt-in consent from your contacts.
            </p>
            <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-6">
              <Input 
                label="Email Address"
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
              
              <div className="mt-6">
                <Checkbox 
                  label="Email marketing consent"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                />
                <p className="text-xs text-gray-500 ml-8 mt-1">This person granted explicit consent to receive marketing-related emails.</p>
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input 
                label="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="John"
              />
              <Input 
                label="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Doe"
              />
              <Input 
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
              />
              <div>
                <Input 
                  label="Birthday"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  placeholder="MM/DD"
                />
                <p className="text-xs text-gray-500 mt-1">Used for automations, like annual birthday emails</p>
              </div>
              <div className="sm:col-span-2">
                <Input 
                  label="Company"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Company Name"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Address */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Address</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input 
                label="Street Address"
                value={address.street}
                onChange={e => setAddress({...address, street: e.target.value})}
                placeholder="123 Main St"
              />
              <Input 
                label="Address Line 2"
                value={address.line2}
                onChange={e => setAddress({...address, line2: e.target.value})}
                placeholder="Apt, Suite, etc."
              />
              <Input 
                label="City"
                value={address.city}
                onChange={e => setAddress({...address, city: e.target.value})}
                placeholder="City"
              />
              <Input 
                label="State/Prov/Region"
                value={address.state}
                onChange={e => setAddress({...address, state: e.target.value})}
                placeholder="State"
              />
              <Input 
                label="Postal/Zip"
                value={address.zip}
                onChange={e => setAddress({...address, zip: e.target.value})}
                placeholder="Zip Code"
              />
              <div className="flex flex-col space-y-2 w-full max-w-[440px]">
                <label className="text-sm font-semibold text-gray-900">Country</label>
                <select 
                  value={address.country}
                  onChange={e => setAddress({...address, country: e.target.value})}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#007c89]/50 focus:border-[#007c89] transition-all"
                >
                  <option value="">Select a country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Tags */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add tags</h3>
            <p className="text-sm text-gray-500 mb-6">
              Tags let you track insights about your contacts that are important to you.
            </p>
            <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Tags</label>
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag: any) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-[#007c89] text-white shadow-sm'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tag.name}
                    {selectedTagIds.includes(tag.id) && <Check className="w-3.5 h-3.5 ml-1.5" />}
                  </button>
                ))}
                {tags.length === 0 && <span className="text-sm text-gray-500 italic">No tags created yet.</span>}
              </div>
              <div className="flex gap-3 items-end max-w-sm">
                <Input 
                  label="Create a new tag"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="e.g. VIP Customer"
                />
                <Button 
                  type="button" 
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || addTagMutation.isLoading}
                  className="!bg-[#007c89] hover:!bg-[#006570] !text-white !h-11"
                >
                  Create
                </Button>
              </div>
            </div>
          </section>

          <div className="pt-4">
            <Checkbox 
              label="If this person is already in my audience, update their profile."
              checked={updateExisting}
              onChange={e => setUpdateExisting(e.target.checked)}
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <Button 
              type="submit" 
              disabled={addContactMutation.isLoading}
              className="!bg-[#007c89] hover:!bg-[#006570] !text-white !px-8 !py-3 !font-semibold text-base w-full sm:w-auto"
            >
              {addContactMutation.isLoading ? 'Adding...' : 'Add contact'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
