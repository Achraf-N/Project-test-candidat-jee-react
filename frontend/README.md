# Test Management System

A comprehensive test management platform for creating, managing, and administering tests with AI-powered scoring capabilities.

## 🚀 Features

### Enterprise Management
- Create and manage enterprise accounts
- Domain categorization
- Admin account generation with secure credentials

### Test Management (Admin)
- Create tests with customizable questions
- Set test duration and visibility
- View test details and statistics
- Manage test sessions
- Send invitations to candidates

### Question Bank
- Support for multiple question types:
  - Multiple Choice Questions (QCM)
  - True/False Questions
  - Open-ended Questions
- Question categorization and filtering
- Reusable question library

### Candidate Features
- Secure login with email and access code
- Interactive test-taking interface
- Real-time timer countdown
- Question navigation and progress tracking
- Auto-save functionality
- Instant results with detailed breakdown

### Results & Analytics
- Overall test scores with percentage
- Question-by-question breakdown
- Correct/incorrect indicators
- Points earned vs maximum points
- AI-powered scoring for open questions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Form Management**: React Hook Form + Zod
- **HTTP Client**: Axios
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner
- **API**: RESTful API with OpenAPI specification

## 📋 Prerequisites

- Node.js 18+ (install with [nvm](https://github.com/nvm-sh/nvm))
- npm or bun
- Backend API running (see API setup below)

## 🔧 Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install
# or
bun install

# Copy environment variables
cp .env.example .env

# Update .env with your API URL
# VITE_API_BASE_URL=http://localhost:8080/api-rest-1.0-SNAPSHOT

# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api-rest-1.0-SNAPSHOT
VITE_ENV=development
```

For production, create `.env.production`:

```env
VITE_API_BASE_URL=https://api.testmanagement.com/api-rest-1.0-SNAPSHOT
VITE_ENV=production
```

## 🔑 Authentication

The application uses **cookie-based JWT authentication**:
- Admin authentication: Username/password
- Candidate authentication: Email/access code
- HttpOnly cookies for security
- Automatic session management

## 📱 Application Structure

```
src/
├── components/
│   ├── common/         # Reusable UI components
│   ├── layout/         # Layout components (Admin & Candidate)
│   └── ui/            # shadcn/ui components
├── pages/
│   ├── admin/         # Admin dashboard and management
│   ├── auth/          # Login and registration
│   └── candidate/     # Test taking and results
├── services/          # API service layer
├── store/             # State management (Zustand)
├── hooks/             # Custom React hooks
└── lib/               # Utility functions
```

## 🎯 User Flows

### Admin Flow
1. Register enterprise → Receive admin credentials
2. Login with admin account
3. Create questions in question bank
4. Create test and select questions
5. Send invitations to candidates
6. Monitor test sessions and results

### Candidate Flow
1. Receive invitation email with access code
2. Login with email and access code
3. Take test with timer countdown
4. Submit answers
5. View detailed results immediately

## ✨ Key Features Implemented

### Accessibility
- ✅ Keyboard navigation (arrow keys, number keys)
- ✅ ARIA labels and roles
- ✅ Screen reader support
- ✅ Focus management
- ✅ Semantic HTML

### UX Enhancements
- ✅ Real-time validation
- ✅ Loading states and skeletons
- ✅ Empty states with illustrations
- ✅ Toast notifications
- ✅ Progress indicators
- ✅ Responsive design (mobile-first)
- ✅ Auto-save (test answers)
- ✅ Confirmation dialogs

### Performance
- ✅ Code splitting by route
- ✅ React Query for caching
- ✅ Lazy loading
- ✅ Optimized re-renders

## 🧪 Testing

```sh
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Build

```sh
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📚 API Documentation

The API follows the OpenAPI 3.0 specification. See `openapi.yaml` for complete API documentation.

### Key Endpoints

**Authentication**
- `POST /auth` - Admin login
- `POST /auth/candidate` - Candidate login
- `POST /auth/logout` - Logout

**Tests**
- `GET /test` - Get all tests
- `POST /test` - Create test
- `GET /test/{testId}/questions` - Get test questions
- `POST /test/invitation` - Send invitations

**Questions**
- `GET /test/questions` - Get all questions
- `POST /test/questions` - Create question

**Candidate**
- `POST /candidate/submit-test` - Submit test
- `GET /candidate/results` - Get results

## 🔒 Security

- Cookie-based authentication with HttpOnly flags
- CORS configuration for credentials
- Input validation with Zod
- XSS prevention
- CSRF protection (handled by backend)

## 🎨 Design System

- **Colors**: Primary (Blue), Success (Green), Warning (Orange), Destructive (Red)
- **Typography**: Roboto font family
- **Spacing**: 8px grid system
- **Components**: Consistent styling with shadcn/ui
- **Dark Mode**: System preference support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
- Check the `FRONTEND_REQUIREMENTS.md` for detailed specifications
- Review the `openapi.yaml` for API documentation
- Open an issue on GitHub

## 🎓 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [React Router](https://reactrouter.com)
- [Zustand](https://zustand-demo.pmnd.rs)

---

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
