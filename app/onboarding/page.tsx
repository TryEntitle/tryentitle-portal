import { redirect } from 'next/navigation'

// Business info is collected via BusinessInfoModal after login — this route
// only remains so old bookmarks/email links don't 404.
export default function OnboardingRedirect() {
  redirect('/')
}
