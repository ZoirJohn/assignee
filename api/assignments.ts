import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
        try {
                const supabase = await createClient()
                const { data, error } = await supabase.from('assignments').select('*').eq('created_by', params.id).single()

                if (error || !data) {
                        return new Response(JSON.stringify({ error: error?.message || 'Assignment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
                }

                return new Response(JSON.stringify(data), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                })
        } catch (error) {
                return new Response(JSON.stringify({ error: 'Server error', details: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
}
