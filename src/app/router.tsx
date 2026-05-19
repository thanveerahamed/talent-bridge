import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/root-layout';
import { AuthLayout } from './layouts/auth-layout';
import { AppLayout } from './layouts/app-layout';
import { LoginPage } from './routes/login';
import { RegisterPage } from './routes/register';
import { VerifyEmailPage } from './routes/verify-email';
import { AuthActionPage } from './routes/auth-action';
import { ForgotPasswordPage } from './routes/forgot-password';
import { ResetPasswordPage } from './routes/reset-password';
import { DashboardPage } from './routes/dashboard';
import { SearchPage } from './routes/seeker/search';
import { ReferrerProfilePage } from './routes/referrer/profile-form';
import { MyListingPage } from './routes/referrer/my-listing';
import { AdminListingsPage } from './routes/admin/listings';
import { AdminUsersPage } from './routes/admin/users';
import { AdminAnalyticsPage } from './routes/admin/analytics';
import { AdminSettingsPage } from './routes/admin/settings';
import { PrivacyPage } from './routes/privacy';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Auth routes (login, register, forgot password)
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },

      // Email verification (standalone, no app shell)
      { path: '/verify-email', element: <VerifyEmailPage /> },

      // Custom Firebase email action handler (replaces default Firebase page)
      { path: '/auth/action', element: <AuthActionPage /> },

      // Reset password (from email link)
      { path: '/reset-password', element: <ResetPasswordPage /> },

      // Protected app routes
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },

          // Seeker
          { path: '/search', element: <SearchPage /> },

          // Referrer
          { path: '/referrer/profile', element: <ReferrerProfilePage /> },
          { path: '/referrer/listing', element: <MyListingPage /> },

          // Admin
          { path: '/admin/listings', element: <AdminListingsPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/analytics', element: <AdminAnalyticsPage /> },
          { path: '/admin/settings', element: <AdminSettingsPage /> },

          // General
          { path: '/privacy', element: <PrivacyPage /> },
        ],
      },

      // Catch-all redirect
      { path: '*', element: <DashboardPage /> },
    ],
  },
]);
