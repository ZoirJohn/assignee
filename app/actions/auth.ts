'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import arcjet, { detectBot, request, shield, validateEmail } from '@arcjet/next';

const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        shield({ mode: 'LIVE' }),
        detectBot({
            mode: 'LIVE',
            allow: [],
        }),
        validateEmail({
            mode: 'LIVE',
            deny: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
        }),
    ],
});

export async function signin(formData: FormData) {
    const supabase = await createClient();
    const req = await request();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const decision = await aj.protect(req, { email });
    if (decision.isDenied()) {
        const decisionMessage = decision.reason.type?.split('_') as string[];
        let message: string = '';
        for (let i = 0; i < decisionMessage.length; i++) {
            message += decisionMessage[i].charAt(0) + decisionMessage[i].toLowerCase() + ' ';
        }
        throw new Error(message);
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        return { error: error.message };
    }

    const { claims } = (await supabase.auth.getClaims()).data || {};
    const { data: profiles } = await supabase.from('profiles').select('*').eq('id', claims?.sub);
    if (!profiles?.length) {
        const { error: insertionError } = await supabase.from('profiles').insert({
            id: claims?.sub,
            full_name: claims?.user_metadata.fullName,
            role: claims?.user_metadata.role,
            teacher_id: claims?.user_metadata.role == 'student' ? claims?.user_metadata.teacherId : null,
        });
        if (insertionError) {
            console.error(insertionError);
        }
    }

    revalidatePath('/', 'layout');
    if (claims?.user_metadata.role == 'student') {
        redirect('/dashboard/student');
    } else if (claims?.user_metadata.role == 'teacher') {
        redirect('/dashboard/teacher');
    } else {
        redirect('/');
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient();
	const req = await request();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;
    const teacherId = formData.get('teacherId');

	const decision = await aj.protect(req, { email });
	if (decision.isDenied()) {
		const decisionMessage= decision.reason.type?.split('_') as string[];
		let message: string = '';
		for (let i = 0; i < decisionMessage.length; i++) {
			message += decisionMessage[i].charAt(0) + decisionMessage[i].toLowerCase() + ' ';
		}
		throw new Error(message);
	}

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, fullName, teacherId }, emailRedirectTo: 'https://assignee-psi.vercel.app/signin' },
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/confirm');
}

export async function signout() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        return { error: 'Error has occurred: ' + error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

export async function reset(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://assignee-psi.vercel.app/signin',
    });

    if (error) {
        return { error: error.message };
    }
}
