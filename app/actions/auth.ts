'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function signin(formData: FormData) {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
                return { error: error.message }
        }

        const {
                data: { user },
        } = await supabase.auth.getUser()

        const { data: profiles } = await supabase.from('profiles').select('*').eq('id', user?.id)
        if (!profiles?.length) {
                const { error: insertionError } = await supabase.from('profiles').insert({
                        id: user?.id,
                        full_name: user?.user_metadata.fullName,
                        role: user?.user_metadata.role,
                        teacher_id: user?.user_metadata.role == 'student' ? user?.user_metadata.teacherId : null,
                })
                if (insertionError) {
                        console.error(insertionError)
                }
        }

        revalidatePath('/', 'layout')

        // Return success with redirect path instead of redirecting directly
        if (user?.user_metadata.role == 'student') {
                return { success: true, redirectTo: '/dashboard/student' }
        } else if (user?.user_metadata.role == 'teacher') {
                return { success: true, redirectTo: '/dashboard/teacher' }
        } else {
                return { success: true, redirectTo: '/' }
        }
}

export async function signup(formData: FormData) {
        const supabase = await createClient()
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const role = formData.get('role') as string
        const teacherId = formData.get('teacherId')

        const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { role, fullName, teacherId } },
        })

        if (error) {
                return { error: error.message }
        }

        revalidatePath('/', 'layout')
        return { success: true, redirectTo: '/confirm' }
}

export async function signout() {
        const supabase = await createClient()

        const { error } = await supabase.auth.signOut()

        if (error) {
                return { error: 'Error has occurred: ' + error.message }
        }

        revalidatePath('dashboard')
        return { success: true, redirectTo: '/' }
}
