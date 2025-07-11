import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { for: string } }) {
        try {
                const supabase = await createClient()
                const { data, error } = await supabase.auth.getUser()
                console.log(data)
                const userName = data.user?.user_metadata.fullName
                const userType = data.user?.user_metadata.role

                if (error || !data) {
                        return new Response(JSON.stringify({ error: error?.message || 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
                }
                if (params.for == 'dashboard') {
                        return new Response(JSON.stringify({ userName, userType }), {
                                status: 200,
                                headers: { 'Content-Type': 'application/json' },
                        })
                }
        } catch (error) {
                return new Response(JSON.stringify({ error: 'Server error', details: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
}
