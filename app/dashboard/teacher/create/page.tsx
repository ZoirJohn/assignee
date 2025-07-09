'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { createClient } from '@/lib/supabase/client'

const assignmentSchema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        subject: z.string().min(2, 'Subject must be at least 2 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        deadline: z.string().refine(
                (val) => {
                        const date = new Date(val)
                        const now = new Date()
                        now.setHours(0, 0, 0, 0)
                        date.setHours(0, 0, 0, 0)
                        return date >= now
                },
                { message: 'Deadline must be a valid future date' }
        ),
})

type AssignmentForm = z.infer<typeof assignmentSchema>

export default function CreateAssignmentPage() {
        const supabase = createClient()
        const [submitted, setSubmitted] = useState(false)
        const [date, setDate] = useState<Date>()
        const [open, setOpen] = useState(false)

        const form = useForm<AssignmentForm>({
                resolver: zodResolver(assignmentSchema),
                defaultValues: {
                        name: '',
                        subject: '',
                        description: '',
                        deadline: date?.toLocaleString(),
                },
        })
        const onSubmit = async (data: AssignmentForm) => {
                const id = (await supabase.auth.getUser()).data.user?.id
                if (id) {
                        await supabase.from('assignments').insert([
                                {
                                        title: data.name,
                                        description: data.description,
                                        subject: data.subject,
                                        deadline: data.deadline,
                                        created_by: id,
                                        status: 'pending',
                                },
                        ])
                }
                setSubmitted(true)
        }

        return (
                <div className='min-h-full flex items-center justify-center p-4'>
                        <Card className='w-full max-w-lg max-[425px]:py-4'>
                                <CardHeader className='max-[425px]:px-4'>
                                        <CardTitle className='text-2xl'>Create Assignment</CardTitle>
                                        <CardDescription>Fill out the form to create a new assignment for your students.</CardDescription>
                                </CardHeader>
                                <CardContent className='max-[425px]:px-4'>
                                        {submitted ? (
                                                <div className='text-green-700 font-semibold text-center py-8'>Assignment created successfully!</div>
                                        ) : (
                                                <Form {...form}>
                                                        <form
                                                                className='space-y-6'
                                                                onSubmit={form.handleSubmit(onSubmit)}
                                                                aria-label='Create Assignment Form'
                                                        >
                                                                <FormField
                                                                        control={form.control}
                                                                        name='name'
                                                                        render={({ field }) => (
                                                                                <FormItem>
                                                                                        <FormLabel htmlFor='name'>Name</FormLabel>
                                                                                        <FormControl>
                                                                                                <Input
                                                                                                        id='name'
                                                                                                        placeholder='e.g. Essay: Climate Change'
                                                                                                        autoComplete='off'
                                                                                                        {...field}
                                                                                                />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                </FormItem>
                                                                        )}
                                                                />
                                                                <FormField
                                                                        control={form.control}
                                                                        name='subject'
                                                                        render={({ field }) => (
                                                                                <FormItem>
                                                                                        <FormLabel htmlFor='subject'>Subject</FormLabel>
                                                                                        <FormControl>
                                                                                                <Input
                                                                                                        id='subject'
                                                                                                        placeholder='e.g. Environmental Science'
                                                                                                        autoComplete='off'
                                                                                                        {...field}
                                                                                                />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                </FormItem>
                                                                        )}
                                                                />
                                                                <FormField
                                                                        control={form.control}
                                                                        name='description'
                                                                        render={({ field }) => (
                                                                                <FormItem>
                                                                                        <FormLabel htmlFor='description'>Description</FormLabel>
                                                                                        <FormControl>
                                                                                                <Textarea
                                                                                                        id='description'
                                                                                                        placeholder='e.g. Write a 1000-word essay on climate change impacts'
                                                                                                        minLength={10}
                                                                                                        rows={4}
                                                                                                        {...field}
                                                                                                />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                </FormItem>
                                                                        )}
                                                                />
                                                                <FormField
                                                                        control={form.control}
                                                                        name='deadline'
                                                                        render={({ field }) => (
                                                                                <FormItem>
                                                                                        <FormLabel htmlFor='deadline'>Deadline</FormLabel>
                                                                                        <FormControl>
                                                                                                <div className='flex flex-col gap-3'>
                                                                                                        <Popover
                                                                                                                open={open}
                                                                                                                onOpenChange={setOpen}
                                                                                                        >
                                                                                                                <PopoverTrigger asChild>
                                                                                                                        <Button
                                                                                                                                variant='outline'
                                                                                                                                id='date'
                                                                                                                                className='text-sm justify-between font-normal'
                                                                                                                        >
                                                                                                                                {date ? date.toLocaleDateString() : 'Select date'}
                                                                                                                                <ChevronDownIcon />
                                                                                                                        </Button>
                                                                                                                </PopoverTrigger>
                                                                                                                <PopoverContent
                                                                                                                        className='w-auto overflow-hidden p-0'
                                                                                                                        align='start'
                                                                                                                >
                                                                                                                        <Calendar
                                                                                                                                mode='single'
                                                                                                                                selected={date}
                                                                                                                                captionLayout='dropdown'
                                                                                                                                onSelect={(selectedDate) => {
                                                                                                                                        setDate(selectedDate)
                                                                                                                                        field.onChange(
                                                                                                                                                selectedDate
                                                                                                                                                        ? selectedDate.toISOString().split('T')[0]
                                                                                                                                                        : ''
                                                                                                                                        )
                                                                                                                                        setOpen(false)
                                                                                                                                }}
                                                                                                                        />
                                                                                                                </PopoverContent>
                                                                                                        </Popover>
                                                                                                </div>
                                                                                        </FormControl>

                                                                                        {/* <Input
                                                                                                id='deadline'
                                                                                                type='date'
                                                                                                min={new Date().toISOString().split('T')[0]}
                                                                                                aria-describedby='deadline-help'
                                                                                                {...field}
                                                                                        /> */}
                                                                                        <FormMessage />
                                                                                        <span
                                                                                                id='deadline-help'
                                                                                                className='text-xs text-gray-500'
                                                                                        >
                                                                                                e.g. Due 2025-01-25
                                                                                        </span>
                                                                                </FormItem>
                                                                        )}
                                                                />

                                                                <Button
                                                                        type='submit'
                                                                        className='w-full'
                                                                >
                                                                        Create Assignment
                                                                </Button>
                                                        </form>
                                                </Form>
                                        )}
                                </CardContent>
                        </Card>
                </div>
        )
}
