'use client'

import { useState } from 'react'
import { Camera, Mail, User, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Image from 'next/image'

export default function StudentProfile() {
        const [profile, setProfile] = useState({ full_name: '', email: '' })
        const [profileImage, setProfileImage] = useState<File | null>(null)
        const [previewUrl, setPreviewUrl] = useState<string | null>(null)
        const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0]
                if (file) {
                        setProfileImage(file)
                        const url = URL.createObjectURL(file)
                        setPreviewUrl(url)
                }
        }

        const handleSave = () => {}
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
                                                                                alt='Profile'
                                                                                className='w-full h-full object-cover rounded-full'
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
                                                                <p className='text-sm font-semibold text-gray-900 capitalize'>Student</p>
                                                        </div>
                                                        <div>
                                                                <Label className='text-sm font-medium text-gray-500'>Member Since</Label>
                                                                <p className='text-sm font-semibold text-gray-900'>January 2025</p>
                                                        </div>
                                                        <div>
                                                                <Label className='text-sm font-medium text-gray-500'>Student ID</Label>
                                                                <p className='text-sm font-semibold text-gray-900'>#STU-2025-001</p>
                                                        </div>
                                                        <div>
                                                                <Label className='text-sm font-medium text-gray-500'>Status</Label>
                                                                <p className='text-sm font-semibold text-green-600'>Active</p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>

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
        )
}
