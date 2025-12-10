# Quick Implementation Guide - Phase 2 UX Improvements

This guide provides ready-to-implement code for the recommended Phase 2 enhancements.

---

## 1. Success Toast Notifications

### Create Toast Component
**File:** `components/ui/toast.tsx`

```typescript
"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}
```

### Usage in NotificationsClient
**File:** `app/mathlete/(dashboard)/notifications/components/NotificationsClient.tsx`

```typescript
// Add to imports
import { Toast } from "@/components/ui/toast";

// Add state
const [toast, setToast] = useState<{type: 'success'|'error', message: string} | null>(null);

// Update handleAccept
const handleAccept = async (invitationId: string) => {
  setProcessingId(invitationId);
  setError("");

  const result = await acceptTeamInvitation(invitationId);

  if (result.success) {
    setToast({ type: 'success', message: 'Successfully joined team!' });
    router.refresh();
  } else {
    setError(result.error || "Failed to accept invitation");
  }

  setProcessingId(null);
};

// Add to JSX (before closing fragment)
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}
```

---

## 2. Delete Team Warning for Active Registrations

### Update TeamDetailsClient
**File:** `app/mathlete/(dashboard)/teams/[id]/components/TeamDetailsClient.tsx`

```typescript
// Add to interface
interface TeamDetailsClientProps {
  // ... existing props
  activeRegistrationCount: number; // Add this
}

// Update delete confirmation modal
{showDeleteConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
      <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Team?</h3>
      <p className="text-slate-600 mb-4">
        Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone.
      </p>
      
      {activeRegistrationCount > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-800">Warning</p>
              <p className="text-sm text-yellow-700">
                This team has <strong>{activeRegistrationCount}</strong> active competition registration{activeRegistrationCount !== 1 ? 's' : ''}. 
                All registrations will be cancelled.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowDeleteConfirm(false)}
          disabled={isProcessing}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteTeam}
          disabled={isProcessing}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isProcessing ? "Deleting..." : "Delete Team"}
        </button>
      </div>
    </div>
  </div>
)}
```

### Update Server-Side Page
**File:** `app/mathlete/(dashboard)/teams/[id]/page.tsx`

```typescript
// Add after team query
// Get active registration count
const { count: activeRegistrationCount } = await supabase
  .from("competition_registrations")
  .select("*", { count: "exact", head: true })
  .eq("team_id", id)
  .eq("status", "registered");

// Pass to component
return (
  <TeamDetailsClient 
    team={team}
    membersList={membersList}
    currentMemberCount={currentMemberCount}
    isLeader={isLeader}
    userId={user.id}
    activeRegistrationCount={activeRegistrationCount || 0} // Add this
  />
);
```

---

## 3. Show Team Registrations in Team Details

### Update TeamDetailsClient
**File:** `app/mathlete/(dashboard)/teams/[id]/components/TeamDetailsClient.tsx`

```typescript
// Add to interface
interface Competition {
  id: string;
  name: string;
  start_datetime: string;
  participation_type: string;
}

interface TeamRegistration {
  id: string;
  status: string;
  registered_at: string;
  competition: Competition;
}

interface TeamDetailsClientProps {
  // ... existing props
  teamRegistrations: TeamRegistration[]; // Add this
}

// Add section in JSX (after Members section)
{/* Team Registrations */}
{teamRegistrations.length > 0 && (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="px-6 py-4 border-b border-slate-200">
      <h2 className="text-xl font-bold text-slate-900">Competition Registrations</h2>
      <p className="text-sm text-slate-600 mt-1">Active competitions this team is registered for</p>
    </div>
    <div className="divide-y divide-slate-200">
      {teamRegistrations.map((registration) => {
        const startTime = new Date(registration.competition.start_datetime);
        const now = new Date();
        const isUpcoming = startTime > now;

        return (
          <div key={registration.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{registration.competition.name}</h3>
                  {isUpcoming && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Upcoming
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{startTime.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/mathlete"
                className="px-4 py-2 text-sm text-[#25346A] hover:text-[#2A64d1] font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
```

### Update Server-Side Page
**File:** `app/mathlete/(dashboard)/teams/[id]/page.tsx`

```typescript
// Add after members query
// Fetch team registrations
const { data: registrations } = await supabase
  .from("competition_registrations")
  .select(`
    id,
    status,
    registered_at,
    competitions (
      id,
      name,
      start_datetime,
      participation_type
    )
  `)
  .eq("team_id", id)
  .eq("status", "registered")
  .order("registered_at", { ascending: false });

const teamRegistrations = registrations?.map((reg: any) => ({
  id: reg.id,
  status: reg.status,
  registered_at: reg.registered_at,
  competition: reg.competitions
})) || [];

// Pass to component
return (
  <TeamDetailsClient 
    team={team}
    membersList={membersList}
    currentMemberCount={currentMemberCount}
    isLeader={isLeader}
    userId={user.id}
    activeRegistrationCount={activeRegistrationCount || 0}
    teamRegistrations={teamRegistrations} // Add this
  />
);
```

---

## 4. Notification Count Caching

### Update Layout
**File:** `app/mathlete/(dashboard)/layout.tsx`

```typescript
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MathleteSidebar from "@/app/mathlete/components/MathleteSidebar";

// Add revalidation
export const revalidate = 30; // Cache for 30 seconds

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch notification count (will be cached for 30 seconds)
  const { count: pendingInvites } = await supabase
    .from("team_invitations")
    .select("*", { count: "exact", head: true })
    .eq("invitee_id", user.id)
    .eq("status", "pending");

  const { count: unreadResponses } = await supabase
    .from("team_invitations")
    .select("*", { count: "exact", head: true })
    .eq("inviter_id", user.id)
    .in("status", ["accepted", "rejected"])
    .eq("inviter_notified", false);

  const notificationCount = (pendingInvites || 0) + (unreadResponses || 0);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MathleteSidebar notificationCount={notificationCount} />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
```

---

## 5. Add Tailwind Animation for Toast

### Update Tailwind Config
**File:** `tailwind.config.ts`

```typescript
// Add to theme.extend
theme: {
  extend: {
    // ... existing config
    animation: {
      'slide-up': 'slideUp 0.3s ease-out',
    },
    keyframes: {
      slideUp: {
        '0%': { transform: 'translateY(100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
  },
}
```

---

## Testing Checklist

After implementing these improvements:

- [ ] Toast shows on successful invitation acceptance
- [ ] Toast shows on successful invitation rejection
- [ ] Toast shows when leaving team
- [ ] Delete team modal shows registration count warning
- [ ] Team details page shows registered competitions
- [ ] Notification badge updates correctly (cached)
- [ ] Animations work smoothly
- [ ] Mobile responsive design maintained

---

## Estimated Implementation Time

- **Toast Component:** 30 minutes
- **Delete Warning:** 45 minutes
- **Team Registrations Section:** 1 hour
- **Notification Caching:** 15 minutes
- **Testing:** 1 hour

**Total:** ~3.5 hours for all Phase 2 improvements

---

## Next Steps

After Phase 2 implementation:
1. Gather user feedback on toast notifications
2. Monitor notification count query performance
3. Plan Phase 3 (performance optimizations)
4. Consider Phase 4 (advanced features like team statistics)
