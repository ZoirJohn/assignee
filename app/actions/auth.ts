'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
        if (user?.user_metadata.role == 'student') {
                redirect('/dashboard/student')
        } else if (user?.user_metadata.role == 'teacher') {
                redirect('/dashboard/teacher')
        } else {
                redirect('/')
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
                options: { data: { role, fullName, teacherId }, emailRedirectTo: 'https://assignee-psi.vercel.app/signin' },
        })

        if (error) {
                return { error: error.message }
        }

        revalidatePath('/', 'layout')
        redirect('/confirm')
}

export async function signout() {
        const supabase = await createClient()

        const { error } = await supabase.auth.signOut()

        if (error) {
                return { error: 'Error has occurred: ' + error.message }
        }

        revalidatePath('/', 'layout')
        redirect('/')
}

export async function reset(formData: FormData) {
        const supabase = await createClient()

        const email = formData.get('email') as string

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://assignee-psi.vercel.app/signin',
        })

        if (error) {
                return { error: error.message }
        }
}
