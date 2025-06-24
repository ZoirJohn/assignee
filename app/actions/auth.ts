'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function signin(formData: FormData) {
        const supabase = await createClient()

        const data = {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
        }

        const { error } = await supabase.auth.signInWithPassword(data)

        if (error) {
                redirect('/error')
        }

        const {
                data: { user },
        } = await supabase.auth.getUser()

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

        const {
                data: { user },
                error,
        } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { role, fullName } },
        })

        if (error) {
                redirect('/error')
        }

        if (user) {
                const { error } = await supabase.from('profiles').insert({
                        id: user.id,
                        full_name: user.user_metadata.fullName,
                        role: user.user_metadata.role,
                        teacher_id: user.user_metadata.role === 'student' ? teacherId : null,
                })
                if (error) {
                        console.error('Failed to add', error)
                        redirect('/insert')
                }
        }

        revalidatePath('/', 'layout')
        redirect('/confirm')
}

export async function signout() {
        const supabase = await createClient()

        const { error } = await supabase.auth.signOut()

        if (error) {
                throw new Error('Error has occured:', error)
        }

        revalidatePath('dashboard')
        redirect('/')
}
// await supabase.from('profiles').insert({
// id: 'ebd02e7d-b302-4d3a-a102-42ad3f53a212',
//         full_name: 'Bul Bul',
//         role: 'student',
//         teacher_id: null,
// })
