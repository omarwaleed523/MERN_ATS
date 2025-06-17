# Getting Started with Create React App

# MERN ATS - Frontend Application

The React.js frontend for the MERN ATS (Applicant Tracking System), providing a modern, responsive interface for candidates, recruiters, and administrators.

## 🎨 Features

### 🖥️ User Interface
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Modern Components**: Beautiful UI components with DaisyUI
- **Smooth Animations**: Framer Motion for enhanced user experience
- **Dark/Light Themes**: DaisyUI theme support
- **Interactive Charts**: Data visualization with Chart.js

### 👤 Role-Based Interfaces
- **Candidate Dashboard**: Job browsing, application tracking, interview management
- **Recruiter Dashboard**: Job posting, application review, interview scheduling
- **Admin Dashboard**: System analytics, user management, comprehensive oversight

### 🔄 Real-Time Features
- **Live Status Updates**: Real-time application status tracking
- **Instant Notifications**: Toast-style user feedback
- **Dynamic Loading**: Skeleton screens and loading states
- **Auto-refresh**: Periodic data updates

## 🛠️ Technology Stack

### Core Framework
- **React 19.0.0** - Latest React with concurrent features
- **React Router DOM 7.1.3** - Client-side routing with data loading
- **React Scripts 5.0.1** - Build and development tools

### Styling & UI
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **DaisyUI 4.12.23** - Component library built on Tailwind
- **PostCSS 8.5.1** - CSS processing and optimization
- **Autoprefixer 10.4.20** - Automatic vendor prefixing

### Data & Communication
- **Axios 1.7.9** - HTTP client for API requests
- **js-cookie 3.0.5** - Cookie management for authentication
- **Socket.io-client 4.8.1** - Real-time communication (future use)

### Visualization & Animation
- **Chart.js 4.4.8** - Flexible charting library
- **react-chartjs-2 5.3.0** - React wrapper for Chart.js
- **Framer Motion 12.6.5** - Production-ready motion library

### Icons & Assets
- **React Icons 5.5.0** - Popular icon libraries
- **Custom SVGs** - Optimized vector graphics

## 📁 Project Structure

```
client/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   ├── favicon.ico        # Site icon
│   ├── manifest.json      # PWA manifest
│   └── robots.txt         # SEO configuration
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.js     # Navigation component
│   │   ├── JobpostCard.js # Job display cards
│   │   ├── InterviewCard.js # Interview components
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Home.js       # Landing page
│   │   ├── Login.js      # Authentication
│   │   ├── CandidateHome.js # Candidate dashboard
│   │   ├── RecruiterHome.js # Recruiter dashboard
│   │   ├── AdminDashboard.js # Admin interface
│   │   └── ...
│   ├── context/          # React Context providers
│   │   └── UserContext.js # Global user state
│   ├── utils/            # Utility functions
│   ├── App.js            # Main application component
│   ├── App.css           # Global styles
│   ├── index.js          # Application entry point
│   └── index.css         # Base styles with Tailwind
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Running backend server (see server README)

### Installation

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Open browser**:
   - Application will open at `http://localhost:3000`
   - Make sure backend is running on `http://localhost:5000`

## 📋 Available Scripts

### `npm start`
Runs the app in development mode with hot reloading.

### `npm run build`
Builds the app for production to the `build` folder.
- Optimizes React for best performance
- Bundles and minifies assets
- Generates source maps

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run eject`
**Note: This is a one-way operation!**
Ejects from Create React App for custom configuration.

## 🎨 Styling Guide

### TailwindCSS Classes
```jsx
// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Color system
<button className="btn btn-primary">   // Primary brand color
<span className="text-base-content">   // Theme-aware text

// Layout utilities
<div className="container mx-auto px-4">  // Centered container
<div className="flex items-center justify-between">  // Flexbox
```

### DaisyUI Components
```jsx
// Cards
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Title</h2>
    <p>Content</p>
    <div className="card-actions justify-end">
      <button className="btn btn-primary">Action</button>
    </div>
  </div>
</div>

// Modals
<div className="modal modal-open">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Modal Title</h3>
    <p className="py-4">Modal content</p>
    <div className="modal-action">
      <button className="btn">Close</button>
    </div>
  </div>
</div>
```

## 🔧 Configuration Files

### `tailwind.config.js`
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}
```

### `postcss.config.js`
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 🔄 State Management

### UserContext
Global user state management with React Context:

```jsx
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

function MyComponent() {
  const { user, setUser } = useContext(UserContext);
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### Local State Patterns
```jsx
// Loading states
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState([]);

// Form handling
const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: ''
});

const handleInputChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};
```

## 🌐 API Integration

### Axios Configuration
```jsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Authenticated requests
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = user.token;
    const response = await axios({
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

## 📱 Responsive Design

### Breakpoint System
- **sm**: 640px and up (mobile landscape)
- **md**: 768px and up (tablet portrait)
- **lg**: 1024px and up (tablet landscape)
- **xl**: 1280px and up (desktop)
- **2xl**: 1536px and up (large desktop)

### Mobile-First Approach
```jsx
<div className="
  flex flex-col        // Mobile: stack vertically
  md:flex-row         // Tablet+: arrange horizontally
  lg:space-x-8        // Desktop: add horizontal spacing
">
```

## 🧪 Testing

### Component Testing
```jsx
import { render, screen } from '@testing-library/react';
import { UserProvider } from '../context/UserContext';
import MyComponent from './MyComponent';

test('renders component correctly', () => {
  render(
    <UserProvider>
      <MyComponent />
    </UserProvider>
  );
  
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
- **Netlify**: Connect GitHub repo, auto-deploy on push
- **Vercel**: Import project, configure build settings
- **AWS S3**: Upload build folder, configure CloudFront
- **GitHub Pages**: Use gh-pages package

### Environment Variables
Create `.env` file in client root:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GEMINI_KEY=your_gemini_api_key
```

## 🔍 Debugging

### Common Issues
1. **CORS Errors**: Ensure backend CORS is configured
2. **API Connection**: Check API_BASE_URL in requests
3. **Build Errors**: Clear node_modules and reinstall
4. **Style Issues**: Check Tailwind class names and DaisyUI themes

### Development Tools
- **React Developer Tools**: Browser extension for React debugging
- **TailwindCSS IntelliSense**: VS Code extension for class suggestions
- **Network Tab**: Monitor API requests and responses

## 🎯 Performance Optimization

### Code Splitting
```jsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Image Optimization
```jsx
// Use appropriate formats and sizes
<img 
  src="/images/hero.webp" 
  alt="Hero"
  loading="lazy"
  width={800}
  height={600}
/>
```

## 🤝 Contributing

1. Follow React best practices
2. Use TypeScript for new components (optional)
3. Maintain responsive design principles
4. Write tests for new features
5. Follow the existing code style

## 📞 Support

For frontend-specific issues:
- Check browser console for errors
- Verify API endpoints are correct
- Ensure all dependencies are installed
- Test in different browsers and devices

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
