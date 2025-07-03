'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { Camera, Mail, User, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export type ProfileForm = {
        full_name: string
        role: 'student' | 'teacher' | ''
        teacher_id: string | null
        email: string
        id: string
        created_at: string
        avatar_url: string
}

export default function TeacherProfile() {
        const supabase = createClient()
        const [profile, setProfile] = useState<ProfileForm>({
                full_name: '',
                role: '',
                teacher_id: null,
                email: '',
                id: '',
                created_at: '',
                avatar_url: '',
        })
        const [previewUrl, setPreviewUrl] = useState<string | null>(null)
        const [copied, setCopied] = useState<boolean>(false)
        const [id, setId] = useState<string>()
        const [email, setEmail] = useState<string>()

        const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0]
                if (file) {
                        const url = URL.createObjectURL(file)
                        setPreviewUrl(url)
                }
        }
        async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
                const file = e.target.files?.[0]
                if (!file) return

                const fileExt = file.name.split('.').pop()
                const fileName = `${profile.id}.${fileExt}`
                const filePath = `${fileName}`

                const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
                        upsert: true,
                        cacheControl: '3600',
                })
                if (!error) {
                        const {
                                data: { publicUrl },
                        } = supabase.storage.from('avatars').getPublicUrl(filePath)
                        if (publicUrl) {
                                await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
                        }
                }
        }
        const handleIdCopy = () => {
                navigator.clipboard.writeText(profile.id)
                setCopied(true)
        }
        useEffect(() => {
                const fetchUser = async () => {
                        const {
                                data: { user },
                        } = await supabase.auth.getUser()
                        if (user) {
                                setEmail(user.email)
                                setId(user.id)
                        }
                }

                fetchUser()
        }, [])
        useEffect(() => {
                const fetchProfile = async () => {
                        const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
                        if (data) setProfile({ ...data, email: email, id: id })
                }
                if (id && email) {
                        fetchProfile()
                }
        }, [id, email])
        useEffect(() => {
                const timeout = setTimeout(() => {
                        setCopied(false)
                }, 2000)
                return () => {
                        clearTimeout(timeout)
                }
        }, [copied])
        return (
                <div className='space-y-6'>
                        <div>
                                <h1 className='text-3xl font-bold text-gray-900'>Profile Settings</h1>
                                <p className='text-gray-600'>Manage your account information and preferences</p>
                        </div>

                        <div className='grid gap-6 max-w-2xl'>
                                <Card>
                                        <CardHeader>
                                                <CardTitle>Profile Picture</CardTitle>
                                                <CardDescription>Upload a profile picture to personalize your account</CardDescription>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                                <div className='flex items-center space-x-4'>
                                                        <Avatar className='w-20 h-20'>
                                                                {previewUrl ? (
                                                                        <Image
                                                                                src={previewUrl}
                                                                                alt='preview'
                                                                                className='w-full h-full object-cover rounded-full'
                                                                                width={30}
                                                                                height={30}
                                                                        />
                                                                ) : profile.avatar_url ? (
                                                                        <Image
                                                                                src={profile.avatar_url}
                                                                                alt='profile'
                                                                                className='w-full h-full object-cover rounded-full'
                                                                                width={30}
                                                                                height={30}
                                                                                quality={100}
                                                                                unoptimized
                                                                        />
                                                                ) : (
                                                                        <AvatarFallback className='text-2xl'>
                                                                                {profile.full_name
                                                                                        .split(' ')
                                                                                        .map((n) => n[0])
                                                                                        .join('')}
                                                                        </AvatarFallback>
                                                                )}
                                                        </Avatar>
                                                        <div className='space-y-2'>
                                                                <Input
                                                                        type='file'
                                                                        accept='image/*'
                                                                        onChange={(e) => {
                                                                                handleImageChange(e)
                                                                                handleAvatarChange(e)
                                                                        }}
                                                                        className='hidden'
                                                                        id='profile-image'
                                                                />

                                                                <Button
                                                                        variant='outline'
                                                                        onClick={() => document.getElementById('profile-image')?.click()}
                                                                >
                                                                        <Camera className='w-4 h-4 mr-2' />
                                                                        Change Picture
                                                                </Button>
                                                                <p className='text-xs text-gray-500'>JPG, PNG or GIF. Max size 2MB.</p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>

                                <Card>
                                        <CardHeader>
                                                <CardTitle>Personal Information</CardTitle>
                                                <CardDescription>Update your personal details and contact information</CardDescription>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                                <div className='space-y-2'>
                                                        <Label htmlFor='fullName'>Full Name</Label>
                                                        <div className='relative'>
                                                                <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                <Input
                                                                        id='fullName'
                                                                        value={profile.full_name}
                                                                        className='pl-10'
                                                                        readOnly
                                                                />
                                                        </div>
                                                </div>

                                                <div className='space-y-2'>
                                                        <Label htmlFor='email'>Email Address</Label>
                                                        <div className='relative'>
                                                                <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                <Input
                                                                        id='email'
                                                                        type='email'
                                                                        value={profile.email}
                                                                        className='pl-10'
                                                                        readOnly
                                                                />
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>

                                <Card>
                                        <CardHeader>
                                                <CardTitle>Account Information</CardTitle>
                                                <CardDescription>View your account details and status</CardDescription>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                        <div>
                                                                <Label className='text-sm font-medium text-gray-500'>Account Type</Label>
                                                                <p className='text-sm font-semibold text-gray-900'>{new Date(profile.created_at).toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                                <Label className='text-sm font-medium text-gray-500'>Member Since</Label>
                                                                <p className='text-sm font-semibold text-gray-900'>January 2025</p>
                                                        </div>
                                                        <div className='relative'>
                                                                <Label className='text-sm font-medium text-gray-500'>Teacher ID</Label>
                                                                <Input
                                                                        className='text-sm font-semibold text-gray-900'
                                                                        value={profile.id}
                                                                        readOnly
                                                                        onClick={handleIdCopy}
                                                                />
                                                                {copied && (
                                                                        <div className='absolute top-1/2 -right-20 mt-1 mr-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded shadow'>
                                                                                Copied!
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>

                                {/* Closed for further development */}
                                {/* <Card>
                                                <CardHeader>
                                                        <CardTitle>Teaching Information</CardTitle>
                                                        <CardDescription>Your teaching credentials and subjects</CardDescription>
                                                </CardHeader>
                                                <CardContent className='space-y-4'>
                                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                                <div>
                                                                        <Label className='text-sm font-medium text-gray-500'>Department</Label>
                                                                        <p className='text-sm font-semibold text-gray-900'>Science</p>
                                                                </div>
                                                                <div>
                                                                        <Label className='text-sm font-medium text-gray-500'>Subjects</Label>
                                                                        <p className='text-sm font-semibold text-gray-900'>Environmental Science, Chemistry</p>
                                                                </div>
                                                                <div>
                                                                        <Label className='text-sm font-medium text-gray-500'>Students</Label>
                                                                        <p className='text-sm font-semibold text-gray-900'>45 Active</p>
                                                                </div>
                                                                <div>
                                                                        <Label className='text-sm font-medium text-gray-500'>Assignments</Label>
                                                                        <p className='text-sm font-semibold text-gray-900'>12 Pending Review</p>
                                                                </div>
                                                        </div>
                                                </CardContent>
                                        </Card> */}

                                <div className='flex justify-end'>
                                        <Button className='flex items-center'>
                                                <Save className='w-4 h-4 mr-2' />
                                                Save Changes
                                        </Button>
                                </div>
                        </div>
                </div>
        )
}
