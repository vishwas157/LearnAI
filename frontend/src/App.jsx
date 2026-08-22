import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';

// Student Pages
import DashboardPage from './pages/student/DashboardPage';
import MaterialsPage from './pages/student/MaterialsPage';
import MaterialReaderPage from './pages/student/MaterialReaderPage';
import SummarizerPage from './pages/student/SummarizerPage';
import TutorPage from './pages/student/TutorPage';
import QuizCraftPage from './pages/student/QuizCraftPage';
import QuizCreationPage from './pages/student/QuizCreationPage';
import QuizAttemptPage from './pages/student/QuizAttemptPage';
import QuizResultsPage from './pages/student/QuizResultsPage';
import AnalyticsPage from './pages/student/AnalyticsPage';
import BookmarksPage from './pages/student/BookmarksPage';
import SearchPage from './pages/student/SearchPage';
import ProfilePage from './pages/student/ProfilePage';
import SettingsPage from './pages/student/SettingsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ContentManagementPage from './pages/admin/ContentManagementPage';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Student Portal Pages */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/materials/:id" element={<MaterialReaderPage />} />
        <Route path="/summarizer" element={<SummarizerPage />} />
        <Route path="/tutor" element={<TutorPage />} />
        <Route path="/quiz-craft" element={<QuizCraftPage />} />
        <Route path="/quiz-craft/create" element={<QuizCreationPage />} />
        <Route path="/quiz/:id/attempt" element={<QuizAttemptPage />} />
        <Route path="/quiz/results/:attemptId" element={<QuizResultsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Admin Portal Pages */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="content" element={<ContentManagementPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
