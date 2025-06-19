'use client'

import { FileText, Download, Calendar, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import DashboardLayout from '@/components/dashboard-layout'

const teachingData = [
        {
                semester: 'Fall 2024',
                subjects: [
                        { name: 'Environmental Science', students: 28, assignments: 8, averageGrade: 'B+', completion: 96 },
                        { name: 'Chemistry 101', students: 32, assignments: 12, averageGrade: 'A-', completion: 94 },
                        { name: 'Advanced Chemistry', students: 15, assignments: 10, averageGrade: 'A', completion: 100 },
                ],
                totalStudents: 75,
                averageCompletion: 96.7,
        },
        {
                semester: 'Spring 2024',
                subjects: [
                        { name: 'Environmental Science', students: 25, assignments: 7, averageGrade: 'B+', completion: 92 },
                        { name: 'Chemistry 101', students: 30, assignments: 10, averageGrade: 'B+', completion: 90 },
                        { name: 'Organic Chemistry', students: 18, assignments: 9, averageGrade: 'A-', completion: 94 },
                ],
                totalStudents: 73,
                averageCompletion: 92.0,
        },
]

const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
        if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
        if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
        return 'bg-gray-100 text-gray-800'
}

const getCompletionColor = (completion: number) => {
        if (completion >= 95) return 'bg-green-100 text-green-800'
        if (completion >= 85) return 'bg-blue-100 text-blue-800'
        if (completion >= 75) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
}

export default function TeacherTranscript() {
        const totalStudents = teachingData.reduce((sum, semester) => sum + semester.totalStudents, 0)
        const totalAssignments = teachingData.reduce((sum, semester) => sum + semester.subjects.reduce((subSum, subject) => subSum + subject.assignments, 0), 0)
        const averageCompletion = teachingData.reduce((sum, semester) => sum + semester.averageCompletion, 0) / teachingData.length

        return (
                <DashboardLayout
                        userType='teacher'
                        userName='Dr. Smith'
                >
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
                                        <Card>
                                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                                        <CardTitle className='text-sm font-medium'>Total Students Taught</CardTitle>
                                                        <Users className='h-4 w-4 text-muted-foreground' />
                                                </CardHeader>
                                                <CardContent>
                                                        <div className='text-2xl font-bold text-blue-600'>{totalStudents}</div>
                                                        <p className='text-xs text-muted-foreground'>Across all semesters</p>
                                                </CardContent>
                                        </Card>

                                        <Card>
                                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                                        <CardTitle className='text-sm font-medium'>Assignments Created</CardTitle>
                                                        <FileText className='h-4 w-4 text-muted-foreground' />
                                                </CardHeader>
                                                <CardContent>
                                                        <div className='text-2xl font-bold'>{totalAssignments}</div>
                                                        <p className='text-xs text-muted-foreground'>Total assignments given</p>
                                                </CardContent>
                                        </Card>

                                        <Card>
                                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                                        <CardTitle className='text-sm font-medium'>Average Completion</CardTitle>
                                                        <TrendingUp className='h-4 w-4 text-muted-foreground' />
                                                </CardHeader>
                                                <CardContent>
                                                        <div className='text-2xl font-bold text-green-600'>{averageCompletion.toFixed(1)}%</div>
                                                        <p className='text-xs text-muted-foreground'>Student completion rate</p>
                                                </CardContent>
                                        </Card>
                                </div>

                                <div className='space-y-6'>
                                        {teachingData.map((semester, index) => (
                                                <Card key={index}>
                                                        <CardHeader>
                                                                <div className='flex items-center justify-between'>
                                                                        <div>
                                                                                <CardTitle className='text-xl'>{semester.semester}</CardTitle>
                                                                                <CardDescription>
                                                                                        {semester.subjects.length} subjects • {semester.totalStudents} students
                                                                                </CardDescription>
                                                                        </div>
                                                                        <Badge
                                                                                variant='outline'
                                                                                className='bg-blue-50 text-blue-700'
                                                                        >
                                                                                {semester.averageCompletion.toFixed(1)}% completion
                                                                        </Badge>
                                                                </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                                <div className='space-y-4'>
                                                                        {semester.subjects.map((subject, subIndex) => (
                                                                                <div key={subIndex}>
                                                                                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                                                                                                <div className='flex-1'>
                                                                                                        <h4 className='font-semibold text-gray-900'>{subject.name}</h4>
                                                                                                        <p className='text-sm text-gray-600'>
                                                                                                                {subject.students} students • {subject.assignments} assignments
                                                                                                        </p>
                                                                                                </div>
                                                                                                <div className='flex items-center space-x-3'>
                                                                                                        <div className='text-right'>
                                                                                                                <div className='flex items-center space-x-2 mb-1'>
                                                                                                                        <Badge className={getGradeColor(subject.averageGrade)}>
                                                                                                                                Avg: {subject.averageGrade}
                                                                                                                        </Badge>
                                                                                                                        <Badge className={getCompletionColor(subject.completion)}>
                                                                                                                                {subject.completion}%
                                                                                                                        </Badge>
                                                                                                                </div>
                                                                                                                <p className='text-xs text-gray-500'>Class performance</p>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                        {subIndex < semester.subjects.length - 1 && <Separator className='my-2' />}
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        ))}
                                </div>

                                <Card>
                                        <CardHeader>
                                                <CardTitle>Teaching Performance</CardTitle>
                                                <CardDescription>Your teaching metrics and achievements</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                                        <div>
                                                                <h4 className='font-semibold text-gray-900 mb-2'>Performance Metrics</h4>
                                                                <div className='space-y-2'>
                                                                        <div className='flex justify-between'>
                                                                                <span className='text-sm text-gray-600'>Student Satisfaction</span>
                                                                                <Badge className='bg-green-100 text-green-800'>4.8/5.0</Badge>
                                                                        </div>
                                                                        <div className='flex justify-between'>
                                                                                <span className='text-sm text-gray-600'>Assignment Quality</span>
                                                                                <Badge className='bg-green-100 text-green-800'>Excellent</Badge>
                                                                        </div>
                                                                        <div className='flex justify-between'>
                                                                                <span className='text-sm text-gray-600'>Response Time</span>
                                                                                <Badge className='bg-blue-100 text-blue-800'>&lt; 24 hours</Badge>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div>
                                                                <h4 className='font-semibold text-gray-900 mb-2'>Recognition</h4>
                                                                <div className='space-y-1'>
                                                                        <Badge
                                                                                variant='outline'
                                                                                className='mr-2 mb-1'
                                                                        >
                                                                                Teacher of the Month - Dec 2024
                                                                        </Badge>
                                                                        <Badge
                                                                                variant='outline'
                                                                                className='mr-2 mb-1'
                                                                        >
                                                                                Excellence in Education - 2024
                                                                        </Badge>
                                                                        <Badge variant='outline'>Outstanding Feedback - Fall 2024</Badge>
                                                                </div>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>
                        </div>
                </DashboardLayout>
        )
}
