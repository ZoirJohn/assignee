import DashboardLayoutSidebar from '@/components/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { ReactNode } from 'react'

export default async function DashboardLayoutMain({ children }: { children: ReactNode }) {
        const supabase = await createClient()
        const {
                data: { user },
        } = await supabase.auth.getUser()
        const userName = user?.user_metadata.fullName
        const role = user?.user_metadata.role
        return (
                <DashboardLayoutSidebar
                        userName={userName}
                        userType={role}
                >
                        {children}
                </DashboardLayoutSidebar>
        )
}
