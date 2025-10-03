# Pages Directory Structure

This directory contains all page components organized by authentication requirements for clear separation of concerns.

## 📁 Directory Structure

```
pages/
├── index.ts                 # Main export file
├── public/                  # 🔓 Public pages (No authentication required)
│   ├── index.ts            # Public pages exports
│   ├── Landing.tsx         # Landing page
│   ├── Login.tsx           # Login page
│   └── Register.tsx        # Registration page
├── protected/               # 🔒 Protected pages (Authentication required)
│   ├── index.ts            # Protected pages exports
│   ├── Home.tsx            # Home dashboard
│   ├── main_dashboard.tsx  # Main dashboard
│   ├── opportunities.tsx   # Trading opportunities
│   ├── profile.tsx         # User profile
│   ├── contact_support.tsx # Contact support
│   ├── faq.tsx             # FAQ page
│   ├── about_us.tsx        # About us
│   ├── about_us_inside.tsx # About us details
│   ├── settings.tsx        # User settings
│   ├── all_notifications.tsx # All notifications
│   └── main_dashboard_legacy.tsx # Backup legacy dashboard
```

## 🔓 Public Pages

**No authentication required** - These pages are accessible to all visitors:

- **Landing.tsx**: Marketing landing page
- **Login.tsx**: User authentication login
- **Register.tsx**: User registration

## 🔒 Protected Pages

**Authentication required** - These pages are wrapped with `ProtectedRoute` and require user login:

- **Home.tsx**: Main dashboard entry
- **main_dashboard.tsx**: Advanced trading dashboard
- **opportunities.tsx**: Trading opportunities listing
- **profile.tsx**: User profile management
- **contact_support.tsx**: Customer support interface
- **faq.tsx**: Frequently asked questions
- **about_us.tsx**: Company information
- **about_us_inside.tsx**: Detailed company information
- **settings.tsx**: User preference settings
- **all_notifications.tsx**: Notification center

## 🛡️ Route Protection

All protected pages are wrapped with the `ProtectedRoute` component in `App.tsx`:

```tsx
<Route path="/dashboard" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
```

This ensures:
- Redirects to `/login` if user is not authenticated
- Shows loading state while checking authentication
- Only renders content for authenticated users

## 📦 Exports

The structure provides clean exports through index files:

```tsx
// Import from specific category
import { LoginPage, RegisterPage } from 'pages/public';
import { MainDashboard, ProfilePage } from 'pages/protected';

// Or import all pages
import * as Pages from 'pages';
```

## 🎯 Benefits

1. **Clear Separation**: Explicit organization by authentication requirements
2. **Security**: Automatic protection of authenticated content
3. **Maintainability**: Easy to identify public vs protected content
4. **Scalability**: Simple to add new pages to correct category
5. **Best Practices**: Industry-standard authentication patterns
