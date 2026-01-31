import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import DeviceList from "./pages/DeviceList";
import DeviceDetail from "./pages/DeviceDetail";
import DevicePublic from "./pages/DevicePublic";
import NewDevice from "./pages/NewDevice";
import NewMaintenance from "./pages/NewMaintenance";
import MaintenanceDetail from "./pages/MaintenanceDetail";
import NewTransfer from "./pages/NewTransfer";
import TransferList from "./pages/TransferList";
import MaintenanceList from "./pages/MaintenanceList";
import Dashboard from "./pages/Dashboard";
import ImportExport from "./pages/ImportExport";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import AuditLogs from "./pages/AuditLogs";
import UserManagement from "./pages/UserManagement";
import { useAuth } from "./_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  component: React.ComponentType;
  requiredRole?: "admin" | "unit_manager" | "technician" | "user";
}

function ProtectedRoute({ component: Component, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <NotFound />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return <NotFound />;
  }

  return <Component />;
}

function Router() {
  const { user, loading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // redirect effect runs after render to avoid changing hooks order
  useEffect(() => {
    if (isAuthenticated && location === "/") {
      setLocation("/dashboard", { replace: true });
    }
  }, [isAuthenticated, location, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/device/:token" component={DevicePublic} />
      <Route component={NotFound} />
    </Switch>;
  }


  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/devices" component={DeviceList} />
        <Route path="/devices/new" component={NewDevice} />
        <Route path="/devices/:id" component={DeviceDetail} />
        <Route path="/transfers" component={TransferList} />
        <Route path="/transfers/new" component={NewTransfer} />
        <Route path="/maintenance" component={MaintenanceList} />
        <Route path="/maintenance/:id" component={MaintenanceDetail} />
        <Route path="/maintenance/new" component={NewMaintenance} />
        <Route path="/users" component={UserManagement} />
        <Route path="/import-export" component={ImportExport} />
        <Route path="/reports" component={Reports} />
        <Route path="/audit-logs" component={AuditLogs} />
        <Route path="/device/:token" component={DevicePublic} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
