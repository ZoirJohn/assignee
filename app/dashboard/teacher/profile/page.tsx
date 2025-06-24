'use client'

import { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import { Camera, Mail, User, Save, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import DashboardLayout from '@/components/dashboard-layout'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

type ProfileForm = {
        fullName: string
        role: 'student' | 'teacher' | ''
        teacher_id: string | null
        email: string
}

export default function TeacherProfile() {
        const supabase = createClient()
        const [profile, setProfile] = useState<ProfileForm>({
                fullName: '',
                role: '',
                teacher_id: null,
                email: '',
        })
        const [profileImage, setProfileImage] = useState<File | null>(null)
        const [previewUrl, setPreviewUrl] = useState<string | null>(null)

        const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0]
                if (file) {
                        setProfileImage(file)
                        const url = URL.createObjectURL(file)
                        setPreviewUrl(url)
                }
        }
        const handleSave = (event: MouseEvent<HTMLButtonElement>) => {}
        useEffect(() => {
                const getUser = async () => {
                        return (await supabase.auth.getUser()).data.user
                }
                const fetchProfile = async () => {
                        const userData = await getUser()
                        const { data } = await supabase.from('profiles').select('*').eq('id', userData?.id).single()

                        if (data) setProfile(data)
                }

                fetchProfile()
        }, [])

        return (
                <DashboardLayout
                        userType='teacher'
                        userName='Dr. Smith'
                >
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
                                                                                        alt='Profile'
                                                                                        className='w-full h-full object-cover rounded-full'
                                                                                />
                                                                        ) : (
                                                                                <AvatarFallback className='text-2xl'>
                                                                                        {profile.fullName
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
                                                                                onChange={handleImageChange}
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
                                                                                value={profile.fullName}
                                                                                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                                                                className='pl-10'
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
                                                                        <p className='text-sm font-semibold text-gray-900 capitalize'>Teacher</p>
                                                                </div>
                                                                <div>
                                                                        <Label className='text-sm font-medium text-gray-500'>Member Since</Label>
                                                                        <p className='text-sm font-semibold text-gray-900'>January 2025</p>
                                                                </div>
                                                                <div>
                                                                        <Label className='text-sm font-medium text-gray-500'>Teacher ID</Label>
                                                                        <p className='text-sm font-semibold text-gray-900'>#TCH-2025-001</p>
                                                                </div>
                                                                <div>
                                                                        <Label className='text-sm font-medium text-gray-500'>Status</Label>
                                                                        <p className='text-sm font-semibold text-green-600'>Active</p>
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
                                                <Button
                                                        onClick={handleSave}
                                                        className='flex items-center'
                                                >
                                                        <Save className='w-4 h-4 mr-2' />
                                                        Save Changes
                                                </Button>
                                        </div>
                                </div>
                        </div>
                </DashboardLayout>
        )
}
