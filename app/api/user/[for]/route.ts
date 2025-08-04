import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, context: { params: { for: string } }) {
        try {
                const supabase = await createClient();

                const { data, error } = await supabase.auth.getClaims();
                const user = data?.claims;
                if (error) {
                        return new Response(JSON.stringify({ error: '' }), {
                                status: 404,
                                headers: { 'Content-Type': 'application/json' },
                        });
                }
                const userName = user?.user_metadata.fullName;
                const userType = user?.user_metadata.role;
                const {
                        params: { for: reason },
                } = context;
                if (reason == 'dashboard') {
                        return new Response(JSON.stringify({ userName, userType }), {
                                status: 200,
                                headers: { 'Content-Type': 'application/json' },
                        });
                }
        } catch (error) {
                return new Response(JSON.stringify({ error: 'Server error', details: (error as Error).message }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                });
        }
}
