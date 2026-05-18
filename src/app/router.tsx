import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/root-layout';
import { AuthLayout } from './layouts/auth-layout';
import { AppLayout } from './layouts/app-layout';
import { LoginPage } from './routes/login';
import { RegisterPage } from './routes/register';
import { VerifyEmailPage } from './routes/verify-email';
import { DashboardPage } from './routes/dashboard';
import { SearchPage } from './routes/seeker/search';
import { ReferrerProfilePage } from './routes/referrer/profile-form';
import { MyListingPage } from './routes/referrer/my-listing';
import { AdminListingsPage } from './routes/admin/listings';
import { AdminUsersPage } from './routes/admin/users';
import { AdminAnalyticsPage } from './routes/admin/analytics';
import { PrivacyPage } from './routes/privacy';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Auth routes (login, register)
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },

      // Email verification (standalone, no app shell)
      { path: '/verify-email', element: <VerifyEmailPage /> },

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

          // General
          { path: '/privacy', element: <PrivacyPage /> },
        ],
      },

      // Catch-all redirect
      { path: '*', element: <DashboardPage /> },
    ],
  },
]);
