# Project Management Web App

A scalable and modern project management platform designed to streamline team collaboration, task tracking, and workflow execution with a clean, professional interface.

---

## Live Demo

Live URL: (https://task-flow-mu-eight.vercel.app)


---

## Admin Credentials

Email: nishantbhd28@gmail.com 
Password: 12345678 

Note: These credentials are for demonstration purposes only. 

---

## Features

### Core Functionality
- Create and manage multiple projects
- Add, assign, and track tasks within projects
- Status-based workflow management (To Do, In Progress, Done)
- Real-time updates and synchronized state across users
- Responsive and clean UI design

### User Management
- Role-based access control (Admin and Users)
- Secure authentication system
- User-specific task visibility and control

### Dashboard and Insights
- Overview of all projects
- Task progress tracking
- Activity summaries for better decision-making

### System Design
- No hardcoded data, fully dynamic backend-driven architecture
- Proper handling of empty states
- Scalable and modular code structure

---

## Task Flow

### 1. Authentication
Users log in or sign up using secure authentication. Role-based access is assigned accordingly.

### 2. Project Creation
Admin creates projects and assigns team members to each project.

### 3. Task Assignment
Tasks are created under specific projects and assigned to users. Each task is categorized by status:
- To Do
- In Progress
- Done

### 4. Workflow Execution
Users update task status as they progress. Changes are reflected in real-time across the system.

### 5. Monitoring and Completion
Admins monitor overall progress through the dashboard. Completed tasks are tracked and maintained for reference.

---

## Tech Stack

### Frontend
- React or Next.js
- Tailwind CSS or ShadCN UI

### Backend
- Supabase (Database and Authentication)
- Custom backend hosted on Railway (if applicable)

### Deployment
- Railway for backend hosting
- Vercel for frontend deployment 

---

## Setup Instructions

### 1. Clone the Repository
git clone https://github.com/your-username/your-repo-name.git  
cd your-repo-name

### 2. Install Dependencies
npm install

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
DATABASE_URL=your_database_url (if applicable)

### 4. Run the Development Server
npm run dev

Application will be available at:  
http://localhost:3000

---

## Deployment Instructions

### Backend Deployment (Railway)
- Push your codebase to GitHub
- Connect the repository to Railway
- Configure environment variables
- Deploy the service

### Frontend Deployment
- Deploy using Vercel or Netlify if frontend is separate

---

## Folder Structure

/src  
  /components  
  /pages  
  /services  
  /hooks  
  /utils  
  /styles  

---

## Testing

- Manual UI testing for all workflows
- Functional validation of task lifecycle
- Edge case handling using empty states

---

## Future Enhancements

- Notification system
- Calendar integration
- AI-based task recommendations
- Advanced analytics dashboard

---

## Contributing

Contributions are welcome. Please open an issue to discuss changes before submitting a pull request.

---


---

## Summary

This application is built with a focus on scalability, clean architecture, and real-world usability, making it suitable for both academic projects and production-level extensions.
