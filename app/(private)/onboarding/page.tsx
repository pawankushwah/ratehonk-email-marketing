import { redirect } from 'next/navigation';

export default function OnboardingIndexPage() {
  // Automatically redirect the base /onboarding URL to the first step of the flow
  redirect('/onboarding/profile');
}
