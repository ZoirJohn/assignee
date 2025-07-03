'use client'
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const transcriptData = [
        {
                semester: 'Fall 2024',
                subjects: [
                        { name: 'Environmental Science', assignments: 8, averageGrade: 'A-', gpa: 3.7 },
                        { name: 'Calculus', assignments: 12, averageGrade: 'B+', gpa: 3.3 },
                        { name: 'World History', assignments: 6, averageGrade: 'A', gpa: 4.0 },
                        { name: 'Chemistry', assignments: 10, averageGrade: 'A-', gpa: 3.7 },
                ],
                semesterGPA: 3.68,
        },
        {
                semester: 'Spring 2024',
                subjects: [
                        { name: 'Environmental Science', assignments: 7, averageGrade: 'B+', gpa: 3.3 },
                        { name: 'Advanced Mathematics', assignments: 10, averageGrade: 'A-', gpa: 3.7 },
                        { name: 'Physics', assignments: 9, averageGrade: 'B', gpa: 3.0 },
                        { name: 'Literature', assignments: 5, averageGrade: 'A', gpa: 4.0 },
                ],
                semesterGPA: 3.5,
        },
]

const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
        if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
        if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
        return 'bg-gray-100 text-gray-800'
}

export default function StudentTranscript() {
        const overallGPA = transcriptData.reduce((sum, semester) => sum + semester.semesterGPA, 0) / transcriptData.length
        const totalAssignments = transcriptData.reduce((sum, semester) => sum + semester.subjects.reduce((subSum, subject) => subSum + subject.assignments, 0), 0)

        return (
                <div className='space-y-6'>
                        <div className='flex items-center justify-between max-[400px]:flex-col max-[400px]:gap-2'>
                                <div>
                                        <h1 className='text-3xl font-bold text-gray-900'>Academic Transcript</h1>
                                        <p className='text-gray-600'>Your complete academic record and performance history</p>
                                </div>
                                <Button
                                        variant='outline'
                                        className='flex items-center'
                                >
                                        <Download className='w-4 h-4 mr-2' />
                                        Download PDF
                                </Button>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                <Card>
                                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                                <CardTitle className='text-sm font-medium'>Overall GPA</CardTitle>
                                                <TrendingUp className='h-4 w-4 text-muted-foreground' />
                                        </CardHeader>
                                        <CardContent>
                                                <div className='text-2xl font-bold text-blue-600'>{overallGPA.toFixed(2)}</div>
                                                <p className='text-xs text-muted-foreground'>Out of 4.0 scale</p>
                                        </CardContent>
                                </Card>

                                <Card>
                                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                                <CardTitle className='text-sm font-medium'>Total Assignments</CardTitle>
                                                <FileText className='h-4 w-4 text-muted-foreground' />
                                        </CardHeader>
                                        <CardContent>
                                                <div className='text-2xl font-bold'>{totalAssignments}</div>
                                                <p className='text-xs text-muted-foreground'>Completed successfully</p>
                                        </CardContent>
                                </Card>

                                <Card>
                                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                                <CardTitle className='text-sm font-medium'>Semesters</CardTitle>
                                                <Calendar className='h-4 w-4 text-muted-foreground' />
                                        </CardHeader>
                                        <CardContent>
                                                <div className='text-2xl font-bold'>{transcriptData.length}</div>
                                                <p className='text-xs text-muted-foreground'>Academic periods</p>
                                        </CardContent>
                                </Card>
                        </div>

                        <div className='space-y-6'>
                                {transcriptData.map((semester, index) => (
                                        <Card key={index}>
                                                <CardHeader>
                                                        <div className='flex items-center justify-between'>
                                                                <div>
                                                                        <CardTitle className='text-xl'>{semester.semester}</CardTitle>
                                                                        <CardDescription>
                                                                                {semester.subjects.length} subjects • {semester.subjects.reduce((sum, s) => sum + s.assignments, 0)} assignments
                                                                        </CardDescription>
                                                                </div>
                                                                <Badge
                                                                        variant='outline'
                                                                        className='bg-blue-50 text-blue-700'
                                                                >
                                                                        GPA: {semester.semesterGPA.toFixed(2)}
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
                                                                                                <p className='text-sm text-gray-600'>{subject.assignments} assignments completed</p>
                                                                                        </div>
                                                                                        <div className='flex items-center space-x-3'>
                                                                                                <div className='text-right'>
                                                                                                        <Badge className={getGradeColor(subject.averageGrade)}>{subject.averageGrade}</Badge>
                                                                                                        <p className='text-xs text-gray-500 mt-1'>GPA: {subject.gpa.toFixed(1)}</p>
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
                                        <CardTitle>Academic Standing</CardTitle>
                                        <CardDescription>Your current academic status and achievements</CardDescription>
                                </CardHeader>
                                <CardContent>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                                <div>
                                                        <h4 className='font-semibold text-gray-900 mb-2'>Current Status</h4>
                                                        <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Good Standing</Badge>
                                                        <p className='text-sm text-gray-600 mt-2'>Maintaining satisfactory academic progress</p>
                                                </div>
                                                <div>
                                                        <h4 className='font-semibold text-gray-900 mb-2'>Achievements</h4>
                                                        <div className='space-y-1'>
                                                                <Badge
                                                                        variant='outline'
                                                                        className='mr-2 mb-1 text-black'
                                                                >
                                                                        Dean&apos;s List - Fall 2024
                                                                </Badge>
                                                                <Badge
                                                                        variant='outline'
                                                                        className='text-black'
                                                                >
                                                                        Honor Roll - Spring 2024
                                                                </Badge>
                                                        </div>
                                                </div>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        )
}
