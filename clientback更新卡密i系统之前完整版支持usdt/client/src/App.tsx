import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Databases } from './pages/Databases';
import { DatabaseDetail } from './pages/DatabaseDetail';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { VerifyEmail } from './pages/Auth/VerifyEmail';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { ResendVerification } from './pages/Auth/ResendVerification';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Referral } from './pages/Dashboard/Referral';
import { Commission } from './pages/Dashboard/Commission';
import { SearchHistory } from './pages/Dashboard/SearchHistory';
import { Points } from './pages/Dashboard/Points';
import { Profile } from './pages/Dashboard/Profile';
import { FAQ } from './pages/FAQ';
import { HotTopics } from './pages/HotTopics';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { ContentManagement } from './pages/Admin/ContentManagement';
import { SystemSettings } from './pages/Admin/SystemSettings';
import { WithdrawManagement } from './pages/Admin/WithdrawManagement';
import { UserManagement } from './pages/Admin/UserManagement';
import { NotificationManagement } from './pages/Admin/NotificationManagement';
import { SiteConfig } from './pages/Admin/SiteConfig';
import { TicketManagement } from './pages/Admin/TicketManagement';
import { RechargeConfig } from './pages/Admin/RechargeConfig';
import { RechargeCardManagement } from './pages/Admin/RechargeCardManagement';
import { Tickets } from './pages/Dashboard/Tickets';
import { Recharge } from './pages/Dashboard/Recharge';
import { RechargeCenter } from './pages/Dashboard/RechargeCenter';
import { RechargeByCard } from './pages/Dashboard/RechargeByCard';
import { BalanceLogs } from './pages/Dashboard/BalanceLogs';
import { CommissionLogs } from './pages/Dashboard/CommissionLogs';
import { Orders } from './pages/Dashboard/Orders';
import { TestLanguage } from './pages/TestLanguage';
import Shop from './pages/Shop/Shop';
import ExchangePoints from './pages/Shop/ExchangePoints';
import { isAuthenticated, getUser } from './utils/auth';
import { DebugTranslations } from './components/DebugTranslations';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

// Admin Route Component (only for admin users)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getUser();
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/databases" element={<Databases />} />
          <Route path="/databases/:id" element={<DatabaseDetail />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/hot-topics" element={<HotTopics />} />
          <Route path="/test-language" element={<TestLanguage />} />
          
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route path="/join/:referralCode" element={<Register />} />
          <Route path="/invite/:referralCode" element={<Register />} />
          <Route path="/welcome/:referralCode" element={<Register />} />
          <Route path="/start/:referralCode" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/referral" 
            element={
              <ProtectedRoute>
                <Referral />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/commission" 
            element={
              <ProtectedRoute>
                <Commission />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/history" 
            element={
              <ProtectedRoute>
                <SearchHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/points" 
            element={
              <ProtectedRoute>
                <Points />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/tickets" 
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/recharge-center" 
            element={
              <ProtectedRoute>
                <RechargeCenter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/recharge" 
            element={
              <ProtectedRoute>
                <Recharge />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/recharge-card" 
            element={
              <ProtectedRoute>
                <RechargeByCard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/balance-logs" 
            element={
              <ProtectedRoute>
                <BalanceLogs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/commission-logs" 
            element={
              <ProtectedRoute>
                <CommissionLogs />
              </ProtectedRoute>
            } 
          />
          
          {/* Shop Routes */}
          <Route 
            path="/shop" 
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shop/exchange" 
            element={
              <ProtectedRoute>
                <ExchangePoints />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes - Only accessible by admin users */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/content" 
            element={
              <AdminRoute>
                <ContentManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <AdminRoute>
                <SystemSettings />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/withdraw" 
            element={
              <AdminRoute>
                <WithdrawManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/notifications" 
            element={
              <AdminRoute>
                <NotificationManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/site-config" 
            element={
              <AdminRoute>
                <SiteConfig />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/recharge-config" 
            element={
              <AdminRoute>
                <RechargeConfig />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/recharge-cards" 
            element={
              <AdminRoute>
                <RechargeCardManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/tickets" 
            element={
              <AdminRoute>
                <TicketManagement />
              </AdminRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* 调试组件 - 开发时使用 */}
        <DebugTranslations />
      </div>
    </Router>
  );
}

export default App;