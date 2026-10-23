'use client'
import { useState } from 'react'
import Tabs from '@/components/Tabs'
import ProfileTab from '@/components/settings/ProfileTab'
import TeamTab from '@/components/settings/TeamTab'
import NotificationsTab from '@/components/settings/NotificationsTab'
import BillingTab from '@/components/settings/BillingTab'

const TABS = ['Profile', 'Team', 'Notifications', 'Billing']

export default function SettingsView(props: {
  profile: { id: string; full_name: string | null; email: string | null; company: string | null; phone: string | null }
  teammates: { id: string; email: string | null; full_name: string | null; company: string | null; created_at: string | null }[]
  prefs: { order_updates: boolean; new_messages: boolean; weekly_summary: boolean }
}) {
  const [tab, setTab] = useState('Profile')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 760 }}>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'Profile' && <ProfileTab profile={props.profile} />}
      {tab === 'Team' && <TeamTab currentUserId={props.profile.id} teammates={props.teammates} />}
      {tab === 'Notifications' && <NotificationsTab userId={props.profile.id} prefs={props.prefs} />}
      {tab === 'Billing' && <BillingTab />}
    </div>
  )
}
