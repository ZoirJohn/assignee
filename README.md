# Assignee 📚

An AI-powered educational platform that streamlines assignment submission and grading through intelligent image-to-text conversion and automated assessment.

## 🚀 Overview

Assignee bridges the gap between traditional handwritten assignments and digital assessment by allowing students to photograph their work and receive AI-powered feedback, while giving teachers comprehensive tools to review, grade, and manage submissions efficiently.

## ✨ Key Features

### For Students
- 📷 **Photo Assignment Submission** - Capture handwritten work with your camera
- 🤖 **AI Text Extraction** - Automatic conversion of handwritten text to digital format
- ⏰ **Smart Deadlines** - Visual deadline tracking with color-coded status
- 📊 **Instant Feedback** - Receive AI grades and teacher comments
- 💬 **Teacher Communication** - Direct chat functionality with assigned teachers
- 📜 **Transcript Generation** - Download official transcripts of completed work

### For Teachers
- 👥 **Student Management** - Organize students using unique teacher IDs
- ✅ **AI-Assisted Grading** - Review and approve AI-generated grades
- 📝 **Custom Feedback** - Add personalized comments and effort ratings
- 📧 **Assignment Inbox** - Email-like interface for managing submissions
- 💬 **Student Communication** - Integrated chat system
- 📈 **Progress Tracking** - Monitor student performance over time

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3 (React, TypeScript)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + OAuth (Google, Instagram)
- **AI Services**: 
  - Azure Computer Vision OCR (Text extraction from images)
  - Groq Mistral AI (Automated grading and assessment)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, CSS animations for blobs and carousels

## 🏗️ Project Structure

```
assignee/
├── src/
│   ├── app/                 # Next.js 15.3 app directory
│   │   ├── (auth)/         # Authentication pages
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── dashboard/      # Protected dashboard routes
│   │   │   ├── student/
│   │   │   └── teacher/
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard-specific components
│   │   └── landing/       # Landing page components
│   ├── lib/
│   │   ├── supabase/      # Database client and types
│   │   ├── ai/            # AI service integrations
│   │   └── utils/         # Utility functions
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── supabase/             # Database migrations and types
└── docs/                 # Additional documentation
```

## 🎨 UI/UX Features

### Landing Page
- **Hero Section**: Animated welcome banner with call-to-action
- **Feature Highlights**: Showcase app benefits with smooth animations
- **Testimonials**: Student and teacher feedback carousel
- **How It Works**: Step-by-step process explanation
- **Blob Animations**: Dynamic background elements
- **Scroll Animations**: Engaging on-scroll reveals

### Dashboard Design
- **Responsive Layout**: Mobile-first design approach
- **Color-Coded Status**: Visual assignment status indicators
- **Email-like Interface**: Familiar inbox experience for teachers
- **Real-time Updates**: Live chat and notification system

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Azure account (for Computer Vision OCR)
- Groq account (for Mistral AI access)

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
AZURE_COMPUTER_VISION_ENDPOINT=your_azure_cv_endpoint
AZURE_COMPUTER_VISION_KEY=your_azure_cv_key
GROQ_API_KEY=your_groq_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Installation Steps
```bash
# Clone the repository
git clone https://github.com/yourusername/assignee.git
cd assignee

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

## 📊 Database Schema

### Core Tables
- **users**: User profiles (students, teachers)
- **assignments**: Assignment submissions and metadata
- **grades**: AI and teacher grading records
- **teacher_students**: Teacher-student relationships
- **chats**: Messaging system
- **transcripts**: Generated academic transcripts

## 🤖 AI Integration Flow

1. **Image Capture**: Student photographs handwritten assignment
2. **Text Extraction**: Azure Computer Vision OCR converts image to text
3. **AI Grading**: Groq Mistral AI analyzes and grades content
4. **Teacher Review**: Teachers can approve, modify, or override AI grades
5. **Feedback Delivery**: Students receive grades and comments
6. **Transcript Generation**: Completed assignments compiled into transcripts

## 🔐 Authentication Flow

### Student Registration
1. Choose "Student" role
2. Complete profile information
3. Enter teacher's unique ID for assignment
4. Verify email/OAuth authentication
5. Access student dashboard

### Teacher Registration
1. Choose "Teacher" role
2. Complete profile information
3. OAuth or email verification
4. Receive unique teacher ID
5. Access teacher dashboard

## 📱 Key User Flows

### Assignment Submission (Student)
1. Navigate to "New Assignment" 
2. Capture image of handwritten work
3. Preview extracted text
4. Submit assignment
5. Track deadline status
6. Receive grade and feedback

### Assignment Review (Teacher)
1. Receive notification of new submission
2. Review Azure OCR-extracted text and Mistral AI grade
3. Approve or modify grade
4. Add personal feedback and effort rating
5. Submit final assessment

## 🚀 Deployment

The application is designed to be deployed on Vercel with Supabase as the backend service.

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## 📈 Future Enhancements

- **Mobile App**: React Native companion app
- **Advanced Analytics**: Detailed performance insights
- **Multi-language Support**: International accessibility
- **Plagiarism Detection**: Academic integrity features
- **Bulk Assignment Processing**: Batch operations for teachers
- **Parent Portal**: Family engagement features

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 📞 Support

For support, email support@assignee.app or join our Discord community.

---

**Made with ❤️ for educators and students worldwide**
