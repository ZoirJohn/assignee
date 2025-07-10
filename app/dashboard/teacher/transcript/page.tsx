import { FileText, Download, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { TAssignment } from '@/definitions'

const getGradeColor = (grade: number) => {
        if (grade === 5) return 'bg-green-100 text-green-800'
        if (grade === 4) return 'bg-blue-100 text-blue-800'
        if (grade === 3) return 'bg-yellow-100 text-yellow-800'
        return 'bg-gray-100 text-gray-800'
}

const getCompletionColor = (completion: number) => {
        if (completion >= 95) return 'bg-green-100 text-green-800'
        if (completion >= 85) return 'bg-blue-100 text-blue-800'
        if (completion >= 75) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
}

export default async function TeacherTranscript() {
        const supabase = await createClient()
        const id = (await supabase.auth.getUser()).data.user!.id
        const { data: assignments }: { data: TAssignment[] | null } = await supabase.from('assignments').select('*').eq('created_by', id)
        const { data: students } = await supabase.from('profiles').select('*').eq('teacher_id', id)
        return (
                <div className='space-y-6'>
                        <div className='flex items-center justify-between'>
                                <div>
                                        <h1 className='text-3xl font-bold text-gray-900'>Teaching Record</h1>
                                        <p className='text-gray-600'>Your complete teaching history and class performance metrics</p>
                                </div>
                                <Button
                                        variant='outline'
                                        className='flex items-center'
                                >
                                        <Download className='w-4 h-4 mr-2' />
                                        Export Report
                                </Button>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                <Card className='max-[425px]:py-4'>
                                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 max-[425px]:px-4'>
                                                <CardTitle className='text-sm font-medium'>Total Students Taught</CardTitle>
                                                <Users className='h-4 w-4 text-muted-foreground' />
                                        </CardHeader>
                                        <CardContent className='max-[425px]:px-4'>
                                                <div className='text-2xl font-bold text-blue-600'>{students!.length}</div>
                                                <p className='text-xs text-muted-foreground'>Across all semesters</p>
                                        </CardContent>
                                </Card>

                                <Card className='max-[425px]:py-4'>
                                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 max-[425px]:px-4'>
                                                <CardTitle className='text-sm font-medium'>Assignments Created</CardTitle>
                                                <FileText className='h-4 w-4 text-muted-foreground' />
                                        </CardHeader>
                                        <CardContent className='max-[425px]:px-4'>
                                                <div className='text-2xl font-bold'>{assignments!.length}</div>
                                                <p className='text-xs text-muted-foreground'>Total assignments given</p>
                                        </CardContent>
                                </Card>

                                <Card className='max-[425px]:py-4'>
                                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 max-[425px]:px-4'>
                                                <CardTitle className='text-sm font-medium'>Average Completion</CardTitle>
                                                <TrendingUp className='h-4 w-4 text-muted-foreground' />
                                        </CardHeader>
                                        <CardContent className='max-[425px]:px-4'>
                                                <div className='text-2xl font-bold text-green-600'>
                                                        {(100 * assignments!.filter((assignment) => assignment.teacher_grade).length) / assignments!.length}%
                                                </div>
                                                <p className='text-xs text-muted-foreground'>Student completion rate</p>
                                        </CardContent>
                                </Card>
                        </div>
                </div>
        )
}
