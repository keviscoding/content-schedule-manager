import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EditorDashboard from './pages/EditorDashboard';
import ChannelDetail from './pages/ChannelDetail';
import { InspirationChannels } from './pages/InspirationChannels';
import VideoUploadPage from './pages/VideoUploadPage';
import VideoReviewPage from './pages/VideoReviewPage';
import ManageEditors from './pages/ManageEditors';
import TasksPage from './pages/TasksPage';
import SimpleUploadPage from './pages/SimpleUploadPage';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/editor-dashboard"
            element={
              <PrivateRoute>
                <EditorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/channels/:id"
            element={
              <PrivateRoute>
                <ChannelDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/channels/:channelId/inspiration"
            element={
              <PrivateRoute>
                <InspirationChannels />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <VideoUploadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/review"
            element={
              <PrivateRoute>
                <VideoReviewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/channels/:channelId/editors"
            element={
              <PrivateRoute>
                <ManageEditors />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TasksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/simple-upload"
            element={
              <PrivateRoute>
                <SimpleUploadPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
