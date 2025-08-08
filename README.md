# Assignee 📚

An AI-powered educational platform that streamlines assignment submission and grading through intelligent image-to-text conversion and automated assessment.

## 🚀 Features

### For Students
- 📷 **Photo Assignment Submission** – Capture handwritten work with your camera
- 🤖 **AI Text Extraction** – Automatic conversion of handwritten text to digital format
- ⏰ **Smart Deadlines** – Visual deadline tracking with color-coded status
- 📊 **Instant Feedback** – Receive AI grades and teacher comments
- 💬 **Teacher Communication** – Direct chat functionality with assigned teachers
- 📜 **Transcript Generation** – Download official transcripts of completed work

### For Teachers
- 👥 **Student Management** – Organize students using unique teacher IDs
- ✅ **AI-Assisted Grading** – Review and approve AI-generated grades
- 📝 **Custom Feedback** – Add personalized comments and effort ratings
- 📧 **Assignment Inbox** – Email-like interface for managing submissions
- 💬 **Student Communication** – Integrated chat system
- 📈 **Progress Tracking** – Monitor student performance over time

## 🛠️ Technologies
- **Frontend:** Next.js 15.3 (React, TypeScript)
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + OAuth (Google, Instagram)
- **AI Services:**
  - Azure Computer Vision OCR – Text extraction from images
  - Groq Mistral AI – Automated grading and assessment
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion, CSS animations for blobs and carousels

## 🧩 Process
1. Designed a mobile-first interface with smooth animations.
2. Integrated OCR to extract handwritten text from student submissions.
3. Built AI-powered grading using Groq Mistral AI.
4. Developed teacher dashboards with inbox-style assignment management.
5. Deployed on Vercel with Supabase backend.

## ⚙️ How It Works

### Student Flow
1. Capture and upload a photo of handwritten work.
2. OCR converts the image to text.
3. AI generates a preliminary grade.
4. Teacher reviews and finalizes assessment.
5. Student receives feedback and can download transcripts.

### Teacher Flow
1. Receive notifications for new submissions.
2. Review extracted text and AI-generated grade.
3. Adjust grade and add custom feedback.
4. Submit final assessment to the student.

## 💡 How It Can Be Improved
- Add mobile app via React Native.
- Include advanced analytics dashboards.
- Support multi-language OCR and grading.
- Integrate plagiarism detection.
- Enable batch assignment processing.
- Create a parent portal for progress tracking.

## 🐞 Issues
- OCR accuracy may drop with poor image quality.
- Limited offline support for low-connectivity areas.
- AI grading may require fine-tuning for niche subjects.

## 📂 Project Structure
```
assignee/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   │   ├── student/
│   │   │   └── teacher/
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── landing/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── ai/
│   │   └── utils/
│   ├── hooks/
│   └── types/
├── public/
├── supabase/
└── docs/
```

## 📊 Database Schema
- **users** – Profiles for students and teachers
- **assignments** – Submission details
- **grades** – AI and teacher grading records
- **teacher_students** – Teacher-student relationships
- **chats** – Messaging system
- **transcripts** – Academic transcript records

## 🔐 Authentication Flow

### Student Registration
1. Choose **Student** role
2. Complete profile
3. Enter teacher’s unique ID
4. Verify via email/OAuth
5. Access student dashboard

### Teacher Registration
1. Choose **Teacher** role
2. Complete profile
3. Verify via email/OAuth
4. Receive unique teacher ID
5. Access teacher dashboard

## 🖥️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Azure account (Computer Vision OCR)
- Groq account (Mistral AI access)

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

### Setup Commands
```bash
git clone https://github.com/ZoirJohn/assignee.git
cd assignee
npm install
cp .env.example .env.local
npm run dev
```

🚀 Deployment
```bash
npm run build
vercel --prod
```

Designed for deployment on Vercel with Supabase backend.

📸 Video / Image Preview
(Insert screenshots, GIFs, or demo videos here)

Made with ❤️ for educators and students worldwide
