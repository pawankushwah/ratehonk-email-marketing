"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { trpc } from '@/app/trpc';
import { User, Building2, Plus, Edit2, ArrowLeft, Mail, Phone, X, Globe, Copy, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';
import { useToast } from '@/app/hooks/useToast';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import Button from '@/app/components/ui/button';
import { PhoneInput } from '@/app/components/ui/PhoneInput';
import { useFormik } from 'formik';
import { z } from 'zod';
import { validateZodSchema } from '@/app/lib/formikZodAdapter';
import { useSearchParams } from 'next/navigation';
import { useBusinessStore } from '@/app/store/useBusinessStore';
import { ImageUploadField } from '@/app/components/ui/ImageUploadField';
import { countries } from '@/app/lib/countries';

// --- Zod Schemas ---
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  contactNumber: z.string().optional(),
  countryCode: z.string().optional(),
  profilePictureUrl: z.string().optional().or(z.literal(''))
});

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
  bannerUrl: z.string().optional().or(z.literal(''))
});



function DomainsTab() {
  const [email, setEmail] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  // New states for Modal and Actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'send' | 'verify' | 'start_auth' | 'results'>('send');
  const [tokenInput, setTokenInput] = useState('');
  const [authDomainInput, setAuthDomainInput] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [domainStatuses, setDomainStatuses] = useState<Record<string, string>>({});
  const [isCheckingStatus, setIsCheckingStatus] = useState<Record<string, boolean>>({});

  const utils = trpc.useUtils();

  const { data: userDomainsData, refetch: refetchDomains } = trpc.getUserDomains.useQuery();
  const domains = userDomainsData?.domains || [];

  const deleteDomainMutation = trpc.deleteDomain.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        refetchDomains();
        setActiveMenuId(null);
      } else {
        setErrorMsg(data.error || "Failed to delete domain");
      }
    }
  });

  const confirmTokenMutation = trpc.confirmDomainToken.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsModalOpen(false);
        setModalStep('send');
        setTokenInput('');
        setEmail('');
        refetchDomains();
      } else {
        setErrorMsg(data.error || "Failed to confirm token");
      }
    }
  });

  const sendEmailMutation = trpc.sendDomainVerificationEmail.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setErrorMsg(data.error || "Failed to send verification email.");
      } else {
        setErrorMsg('');
        setModalStep('verify');
        refetchDomains();
      }
    },
    onError: (err) => {
      setErrorMsg(err.message || "An error occurred");
    }
  });

  const verifyDomainMutation = trpc.domainVerification.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setErrorMsg(data.error || "Failed to authenticate domain.");
        setVerificationResult(null);
      } else {
        setErrorMsg('');
        setVerificationResult(data);
        refetchDomains(); // Ensure new domains appear in the list
      }
    },
    onError: (err) => {
      setErrorMsg(err.message || "An error occurred");
      setVerificationResult(null);
    }
  });

  const handleSendVerification = () => {
    if (!email) {
      setErrorMsg('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setErrorMsg('');
    sendEmailMutation.mutate({ email });
  };

  const handleAuthenticate = (domainName: string) => {
    setErrorMsg('');
    setIsModalOpen(true);
    setModalStep('results');
    setActiveMenuId(null); // Close the menu if open
    verifyDomainMutation.mutate({ domain: domainName });
  };

  const handleCheckStatus = async (domainName: string) => {
    setIsCheckingStatus(prev => ({ ...prev, [domainName]: true }));
    try {
      const result = await utils.domainStatus.fetch({ domain: domainName });
      if (result.success) {
        setDomainStatuses(prev => ({ ...prev, [domainName]: result.status }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCheckingStatus(prev => ({ ...prev, [domainName]: false }));
    }
  };

  const handleVerifyToken = () => {
    if (!tokenInput) {
      setErrorMsg('Verification token is required');
      return;
    }
    setErrorMsg('');
    confirmTokenMutation.mutate({ token: tokenInput });
  };

  const handleStartAuthentication = () => {
    if (!authDomainInput) {
      setErrorMsg('Domain is required');
      return;
    }
    setErrorMsg('');
    setModalStep('results');
    verifyDomainMutation.mutate({ domain: authDomainInput });
  };

  const copyToClipboard = (text: string, index: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setCopiedItems(prev => new Set(prev).add(index));
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-10">
        <h3 className="text-xl font-bold text-text mb-2">Email domains</h3>
        <p className="text-text-dim text-sm mb-4">
          Your email domains control how your emails are sent through Ratehonk. Customers who authenticated their domain saw an average 51% decrease in email delivery bounce rate.
        </p>

        <div className="mb-6 flex gap-3">
          <Button type="button" size="sm" onClick={() => {
            setIsModalOpen(true);
            setModalStep('send');
            setEmail('');
            setTokenInput('');
            setErrorMsg('');
          }}>
            Add and Verify Domain
          </Button>
          <Button type="button" size="sm" className="!bg-white !text-main !border !border-main hover:!bg-main/5" onClick={() => {
            setIsModalOpen(true);
            setModalStep('start_auth');
            setAuthDomainInput('');
            setErrorMsg('');
          }}>
            Start Authentication
          </Button>
        </div>

        {/* List of User Domains */}
        {domains.length > 0 && (
          <div className="mb-6 space-y-4">
            {domains.map((d: any) => (
              <div key={d.id} className="p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-bold text-text">{d.domain}</div>
                  <div className="text-sm text-text-dim">{d.email}</div>
                </div>
                  <div className="flex items-center gap-3">
                  {d.status === 'pending' ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">Pending Email Verification</span>
                  ) : (
                    <>
                      {domainStatuses[d.domain] ? (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${domainStatuses[d.domain] === 'Success' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                          DKIM: {domainStatuses[d.domain]}
                        </span>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckStatus(d.domain)}
                        disabled={isCheckingStatus[d.domain]}
                        className="text-xs !py-1 !px-2 h-7"
                      >
                        {isCheckingStatus[d.domain] ? "Checking..." : "Check Status"}
                      </Button>
                    </>
                  )}

                  <div className="relative">
                    <button type="button" onClick={() => setActiveMenuId(activeMenuId === d.id ? null : d.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenuId === d.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-lg z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {d.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setIsModalOpen(true);
                                setModalStep('verify');
                                setEmail(d.email);
                                setTokenInput('');
                                setErrorMsg('');
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Verify Token
                            </button>
                          )}
                          {d.status === 'verified' && (
                            <button
                              type="button"
                              onClick={() => handleAuthenticate(d.domain)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Show DNS Records
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this domain?')) {
                                deleteDomainMutation.mutate({ id: d.id });
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Domain
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}




        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-text-dim">
            Public domains like Gmail, Yahoo, and Hotmail don't need to be verified or authenticated.
          </p>
          <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md">
            <span className="text-sm font-medium text-text">gmail.com</span>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded">Not Allowed for Sending</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-10">
        <h3 className="text-xl font-bold text-text mb-2">Website domains</h3>
        <p className="text-text-dim text-sm mb-4 max-w-xl">
          If you already own a domain from another domain provider, you can connect it to give your landing pages and website a more professional look.
        </p>
        <Button type="button" size="sm" className="!bg-white !text-main !border !border-main hover:!bg-main/5">Connect a domain</Button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-text">
                {modalStep === 'send' ? 'Add Domain' : 'Verify Domain'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                  {errorMsg}
                </div>
              )}

              {modalStep === 'send' && (
                <>
                  <p className="text-sm text-text-dim mb-4">
                    Enter an email address on the domain you wish to add. We will send a verification link to this address.
                  </p>
                  <div className="mb-6">
                    <Input
                      label="Domain Email"
                      placeholder="e.g. admin@yourdomain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={sendEmailMutation.isPending}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="button" size="sm" onClick={handleSendVerification} disabled={!email || sendEmailMutation.isPending}>
                      {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
                    </Button>
                  </div>
                </>
              )}

              {modalStep === 'verify' && (
                <>
                  <p className="text-sm text-text-dim mb-4">
                    We've sent a verification email to <strong>{email}</strong>. Click the link in the email, or paste the verification token here:
                  </p>
                  <div className="mb-6">
                    <Input
                      label="Verification Token"
                      placeholder="Paste token..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      disabled={confirmTokenMutation.isPending}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                    <Button type="button" size="sm" onClick={handleVerifyToken} disabled={!tokenInput || confirmTokenMutation.isPending}>
                      {confirmTokenMutation.isPending ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </>
              )}

              {modalStep === 'start_auth' && (
                <>
                  <p className="text-sm text-text-dim mb-4">
                    Directly authenticate a domain via AWS SES to generate your DKIM records.
                  </p>
                  <div className="mb-6">
                    <Input
                      label="Domain Name"
                      placeholder="e.g. yourdomain.com"
                      value={authDomainInput}
                      onChange={(e) => setAuthDomainInput(e.target.value)}
                      disabled={verifyDomainMutation.isPending}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="button" size="sm" onClick={handleStartAuthentication} disabled={!authDomainInput || verifyDomainMutation.isPending}>
                      {verifyDomainMutation.isPending ? "Generating..." : "Generate Records"}
                    </Button>
                  </div>
                </>
              )}

              {modalStep === 'results' && (
                <>
                  {verifyDomainMutation.isPending ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="w-10 h-10 border-4 border-main border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-text-dim">Generating DKIM records...</p>
                    </div>
                  ) : verificationResult && verificationResult.success ? (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 className="text-green-500 w-6 h-6" />
                        <h4 className="font-bold text-lg">Domain verified successfully</h4>
                      </div>

                      {verificationResult.provider && verificationResult.provider !== 'Other' && verificationResult.provider !== 'Unknown' && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
                          We detected your domain is hosted on <strong>{verificationResult.provider}</strong>. Please log into your {verificationResult.provider} account and add the following CNAME records to your DNS settings.
                        </div>
                      )}
                      {(verificationResult.provider === 'Other' || verificationResult.provider === 'Unknown') && (
                        <div className="mb-6 p-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 text-sm">
                          Please log into your DNS provider and add the following CNAME records to your DNS settings to authenticate your domain.
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-sm text-text">DNS Records to Add</h4>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {verificationResult.records?.filter((_: any, i: number) => copiedItems.has(`${i}-name`) && copiedItems.has(`${i}-value`)).length || 0} / {verificationResult.records?.length || 0} records copied
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-[40vh] custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-text-dim font-bold uppercase">
                              <th className="p-3">Record Type</th>
                              <th className="p-3">Host Name</th>
                              <th className="p-3">Required Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {verificationResult.records?.map((record: any, index: number) => {
                              const isNameCopied = copiedIndex === `${index}-name`;
                              const isValueCopied = copiedIndex === `${index}-value`;

                              const hasNameBeenCopiedEver = copiedItems.has(`${index}-name`);
                              const hasValueBeenCopiedEver = copiedItems.has(`${index}-value`);

                              return (
                                <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                                  <td className="p-3 text-sm font-semibold text-text align-top">
                                    {record.type}
                                  </td>
                                  <td className="p-3 align-top">
                                    <div className={`flex items-center justify-between font-mono text-xs break-all p-1.5 border rounded gap-2 ${hasNameBeenCopiedEver ? 'bg-red-50 border-red-200 text-red-800' : 'bg-teal-50/30 border-teal-200 text-teal-800'}`}>
                                      <span className="pl-1 truncate" title={record.name}>{record.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(record.name, `${index}-name`)}
                                        className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded transition-colors ${isNameCopied ? 'bg-red-400 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
                                      >
                                        {isNameCopied ? "Copied!" : "Copy"}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="p-3 align-top">
                                    <div className={`flex items-center justify-between font-mono text-xs break-all p-1.5 border rounded gap-2 ${hasValueBeenCopiedEver ? 'bg-red-50 border-red-200 text-red-800' : 'bg-teal-50/30 border-teal-200 text-teal-800'}`}>
                                      <span className="pl-1 line-clamp-2" title={record.value}>{record.value}</span>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(record.value, `${index}-value`)}
                                        className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded transition-colors ${isValueCopied ? 'bg-red-400 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
                                      >
                                        {isValueCopied ? "Copied!" : "Copy"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Provider API Scaffolding (OAuth) */}
                      <div className="mt-8 border-t border-gray-200 pt-6">
                        <h5 className="font-bold text-text mb-2 text-sm">Auto-Configure DNS</h5>
                        <p className="text-xs text-text-dim mb-4">
                          Alternatively, connect directly to your provider to authenticate automatically.
                        </p>
                        <div className="flex flex-col gap-3">
                          <Button type="button" size="sm" className="!bg-white !text-blue-600 !border !border-blue-600 hover:!bg-blue-50 w-full" onClick={() => alert('Connect Cloudflare OAuth flow goes here.')}>
                            Connect Cloudflare
                          </Button>
                          <Button type="button" size="sm" className="!bg-white !text-green-600 !border !border-green-600 hover:!bg-green-50 w-full" onClick={() => alert('Connect GoDaddy OAuth flow goes here.')}>
                            Connect GoDaddy
                          </Button>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                        <Button type="button" size="sm" onClick={() => {
                          setVerificationResult(null);
                          setIsModalOpen(false);
                        }} className="!py-2 !px-4 !bg-white !text-text !border !border-gray-200 hover:!bg-gray-50">
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ProfilePageContent() {
  const { data: sessionData, refetch: refetchSession } = trpc.auth.getSession.useQuery();
  const user = sessionData?.user;

  const [activeTab, setActiveTab] = useState<'profile' | 'businesses' | 'domains'>('profile');
  const searchParams = useSearchParams();

  // --- Businesses Tab State ---
  type BusinessView = 'list' | 'add' | 'edit';
  const [businessView, setBusinessView] = useState<BusinessView>('list');
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);

  const { data: businessesData, refetch: refetchBusinesses, isLoading: isBusinessesLoading } = trpc.user.getBusinesses.useQuery(undefined, { enabled: activeTab === 'businesses' });
  const businesses = businessesData?.businesses || [];

  const { activeBusinessId } = useBusinessStore();

  useEffect(() => {
    const tab = searchParams.get('tab');
    const editParam = searchParams.get('edit');
    if (tab === 'businesses') {
      setActiveTab('businesses');
    }

    // Automatically open edit view for the active business if requested from dashboard
    if (tab === 'businesses' && editParam === 'true' && activeBusinessId && businesses.length > 0) {
      const bizToEdit = businesses.find((b: any) => b.id === activeBusinessId);
      if (bizToEdit) {
        setEditingBusinessId(bizToEdit.id);
        setBusinessView('edit');
      }
    }
  }, [searchParams, businesses, activeBusinessId]);


  const { addToast } = useToast();

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: (data) => {
      addToast(data.message, 'success');
      refetchSession();
    },
    onError: (error) => addToast(error.message, 'error')
  });

  const createBizMutation = trpc.user.createBusiness.useMutation({
    onSuccess: () => {
      addToast("Business created!", "success");
      setBusinessView('list');
      refetchBusinesses();
    },
    onError: (err) => addToast(err.message, "error")
  });

  const updateBizMutation = trpc.user.updateBusiness.useMutation({
    onSuccess: () => {
      addToast("Business updated!", "success");
      setBusinessView('list');
      refetchBusinesses();
    },
    onError: (err) => addToast(err.message, "error")
  });

  // Profile Formik
  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      contactNumber: user?.contactNumber || '',
      countryCode: user?.countryCode || 'US',
      profilePictureUrl: user?.profilePictureUrl || ''
    },
    enableReinitialize: true,
    validate: validateZodSchema(profileSchema),
    onSubmit: (values) => {
      updateProfileMutation.mutate(values);
    }
  });

  // Business Formik
  const currentBiz = businessView === 'edit' ? businesses.find((b: any) => b.id === editingBusinessId) : null;
  const businessFormik = useFormik({
    initialValues: {
      name: currentBiz?.name || '',
      websiteUrl: currentBiz?.websiteUrl || '',
      description: currentBiz?.description || '',
      contactEmail: currentBiz?.contactEmail || '',
      contactPhone: currentBiz?.contactPhone || '',
      contactCountryCode: currentBiz?.contactCountryCode || 'US',
      logoUrl: currentBiz?.logoUrl || '',
      bannerUrl: currentBiz?.bannerUrl || ''
    },
    enableReinitialize: true,
    validate: validateZodSchema(businessSchema),
    onSubmit: (values) => {
      if (businessView === 'edit' && currentBiz) {
        updateBizMutation.mutate({ id: currentBiz.id, ...values });
      } else {
        createBizMutation.mutate(values);
      }
    }
  });


  if (!user) {
    return (
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-gray-50/50 p-6 gap-6">
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col h-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-pulse"></div>
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm p-8 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-gray-50/50 p-6 gap-6">

      {/* Left Column - Fixed User Card */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col h-full">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-main/10 to-main/30"></div>

          <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center mb-4 z-10 overflow-hidden text-main font-bold text-3xl">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.firstName ? user.firstName[0] : 'U'
            )}
          </div>
          <h2 className="text-xl font-bold text-text mb-1">
            {user.firstName} {user.lastName}
          </h2>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-text-dim mb-4">
            {user.role}
          </span>

          <div className="w-full space-y-3 text-sm text-text-dim mt-4 border-t border-gray-100 pt-6 text-left">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4" />
              <span className="truncate" title={user.email}>{user.email}</span>
            </div>
            {user.contactNumber && (
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4" />
                <span>
                  {user.countryCode ? `${countries.find(c => c.code === user.countryCode)?.dialCode || ''} ` : ''}
                  {user.contactNumber}
                </span>
              </div>
            )}
          </div>

          {user.userSubscriptions?.plan && (
            <div className="w-full mt-6 pt-6 border-t border-gray-100 text-left">
              <h3 className="text-sm font-bold text-text mb-3">Active Subscription</h3>
              <div className="bg-main/5 border border-main/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-main">{user.userSubscriptions.plan.name}</span>
                  <span className="text-[10px] font-bold bg-main text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                </div>
                <div className="space-y-2 mt-3 text-xs text-text-dim">
                  <div className="flex justify-between">
                    <span>Emails / month</span>
                    <span className="font-medium text-text">{user.userSubscriptions.plan.emailLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Contacts</span>
                    <span className="font-medium text-text">{user.userSubscriptions.plan.contactLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Limit</span>
                    <span className="font-medium text-text">{user.userSubscriptions.plan.dailyEmailLimit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Tabs and Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 shrink-0 overflow-hidden">
          <div className="flex overflow-x-auto custom-scrollbar">
            <button
              onClick={() => { setActiveTab('profile'); setBusinessView('list'); }}
              className={`flex items-center px-6 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-main text-main' : 'border-transparent text-text-dim hover:text-text'}`}
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('businesses')}
              className={`flex items-center px-6 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'businesses' ? 'border-main text-main' : 'border-transparent text-text-dim hover:text-text'}`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Businesses
            </button>
            <button
              onClick={() => setActiveTab('domains')}
              className={`flex items-center px-6 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'domains' ? 'border-main text-main' : 'border-transparent text-text-dim hover:text-text'}`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Domains
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 overflow-y-auto custom-scrollbar relative">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="p-8 max-w-2xl">
              <h3 className="text-xl font-bold text-text mb-6">Personal Information</h3>

              <form onSubmit={profileFormik.handleSubmit} className="space-y-6">

                <ImageUploadField
                  label="Profile Picture"
                  uploadType="profilePicture"
                  value={profileFormik.values.profilePictureUrl}
                  onChange={(url: string) => profileFormik.setFieldValue('profilePictureUrl', url)}
                  error={profileFormik.touched.profilePictureUrl && profileFormik.errors.profilePictureUrl ? profileFormik.errors.profilePictureUrl as string : undefined}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    placeholder="e.g. John"
                    {...profileFormik.getFieldProps('firstName')}
                    error={profileFormik.touched.firstName && profileFormik.errors.firstName ? profileFormik.errors.firstName as string : undefined}
                  />
                  <Input
                    label="Last Name"
                    placeholder="e.g. Doe"
                    {...profileFormik.getFieldProps('lastName')}
                    error={profileFormik.touched.lastName && profileFormik.errors.lastName ? profileFormik.errors.lastName as string : undefined}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="opacity-60 pointer-events-none">
                    <Input label="Email Address"
                      placeholder="e.g. [EMAIL_ADDRESS]" value={user.email} type="email" disabled onChange={() => { }} />
                  </div>
                  <div>
                    <PhoneInput
                      label="Contact Number"
                      value={profileFormik.values.contactNumber}
                      onChange={(val) => profileFormik.setFieldValue('contactNumber', val)}
                      selectedCountryCode={profileFormik.values.countryCode}
                      onCountryChange={(code) => profileFormik.setFieldValue('countryCode', code)}
                    />
                    {profileFormik.touched.contactNumber && profileFormik.errors.contactNumber && (
                      <div className="text-red-500 text-xs mt-1">{profileFormik.errors.contactNumber as string}</div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* BUSINESSES TAB */}
          {activeTab === 'businesses' && (
            <div className="p-8">
              {businessView === 'list' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-text">Your Businesses</h3>
                    <Button type="button" onClick={() => setBusinessView('add')} className="!py-2 !px-4 text-sm">
                      <div className='flex items-center gap-2'>
                        <Plus className="w-5 h-5" />
                        <span>Add New Business</span>
                      </div>
                    </Button>
                  </div>

                  {isBusinessesLoading ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {[1, 2].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-xl"></div>)}
                    </div>
                  ) : businesses.length === 0 ? (
                    <div className="text-center py-12 text-text-dim border-2 border-dashed border-gray-200 rounded-xl">No businesses found.</div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {businesses.map((biz: any) => (
                        <div key={biz.id} className="group border border-gray-100 rounded-xl p-5 flex items-start space-x-4 hover:border-main/30 hover:shadow-md transition-all bg-white relative overflow-hidden">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-main/10 to-main/5 border border-main/10 flex items-center justify-center flex-shrink-0 text-main font-bold text-2xl shadow-inner">
                            {biz.logoUrl ? <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover rounded-xl" /> : biz.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <h4 className="font-bold text-text text-base truncate">{biz.name}</h4>
                            {biz.websiteUrl ? (
                              <a href={biz.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block mt-0.5 mb-3">{biz.websiteUrl}</a>
                            ) : (
                              <p className="text-xs text-text-dim mt-0.5 mb-3 italic">No website provided</p>
                            )}
                          </div>

                          <button
                            onClick={() => { setEditingBusinessId(biz.id); setBusinessView('edit'); }}
                            className="absolute top-4 right-4 p-2 text-text-dim hover:text-main hover:bg-main-dim rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {(businessView === 'add' || businessView === 'edit') && (
                <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <button onClick={() => { setBusinessView('list'); businessFormik.resetForm(); }} className="flex items-center text-sm font-semibold text-text-dim hover:text-text mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Business List
                  </button>

                  <h3 className="text-xl font-bold text-text mb-6">{businessView === 'edit' ? 'Edit Business Details' : 'Add New Business'}</h3>

                  <form onSubmit={businessFormik.handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ImageUploadField
                        label="Business Logo"
                        uploadType="brandLogo"
                        value={businessFormik.values.logoUrl}
                        onChange={(url: string) => businessFormik.setFieldValue('logoUrl', url)}
                        error={businessFormik.touched.logoUrl && businessFormik.errors.logoUrl ? businessFormik.errors.logoUrl as string : undefined}
                      />
                      <ImageUploadField
                        label="Dashboard Banner"
                        uploadType="businessBanner"
                        value={businessFormik.values.bannerUrl}
                        onChange={(url: string) => businessFormik.setFieldValue('bannerUrl', url)}
                        error={businessFormik.touched.bannerUrl && businessFormik.errors.bannerUrl ? businessFormik.errors.bannerUrl as string : undefined}
                        aspectRatio={1.91 / 1}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Business Name"
                        placeholder="e.g. Jaa Maa Enterprises"
                        {...businessFormik.getFieldProps('name')}
                        error={businessFormik.touched.name && businessFormik.errors.name ? businessFormik.errors.name as string : undefined}
                      />
                      <Input
                        label="Website URL"
                        type="url"
                        placeholder="e.g. https://example.com"
                        {...businessFormik.getFieldProps('websiteUrl')}
                        error={businessFormik.touched.websiteUrl && businessFormik.errors.websiteUrl ? businessFormik.errors.websiteUrl as string : undefined}
                      />
                    </div>

                    <Textarea
                      label="Business Description"
                      placeholder="Enter business description"
                      {...businessFormik.getFieldProps('description')}
                      error={businessFormik.touched.description && businessFormik.errors.description ? businessFormik.errors.description as string : undefined}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Contact Email"
                        type="email"
                        placeholder="Enter contact email"
                        {...businessFormik.getFieldProps('contactEmail')}
                        error={businessFormik.touched.contactEmail && businessFormik.errors.contactEmail ? businessFormik.errors.contactEmail as string : undefined}
                      />
                      <div>
                        <PhoneInput
                          label="Contact Phone"
                          value={businessFormik.values.contactPhone}
                          onChange={(val) => businessFormik.setFieldValue('contactPhone', val)}
                          selectedCountryCode={businessFormik.values.contactCountryCode}
                          onCountryChange={(code) => businessFormik.setFieldValue('contactCountryCode', code)}
                        />
                        {businessFormik.touched.contactPhone && businessFormik.errors.contactPhone && (
                          <div className="text-red-500 text-xs mt-1">{businessFormik.errors.contactPhone as string}</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <Button type="submit" disabled={createBizMutation.isPending || updateBizMutation.isPending}>
                        {(createBizMutation.isPending || updateBizMutation.isPending) ? "Saving..." : "Save Business"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* DOMAINS TAB */}
          {activeTab === 'domains' && (
            <DomainsTab />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-dim">Loading profile...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
