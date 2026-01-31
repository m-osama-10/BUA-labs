import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Package, Wrench, AlertCircle, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = trpc.dashboard.stats.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to the Asset Management System</p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Devices</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalDevices || 0}</p>
            </div>
            <Package className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Working</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats?.working || 0}</p>
            </div>
            <Package className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Under Maintenance</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats?.maintenance || 0}</p>
            </div>
            <Wrench className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Out of Service</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats?.outOfService || 0}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Maintenance Alerts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Pending Maintenance Requests
          </h3>
          <p className="text-slate-600 text-sm">No pending maintenance requests at this time.</p>
        </Card>

        {/* End of Life Alerts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Devices Reaching End of Life
          </h3>
          <p className="text-slate-600 text-sm">No devices near end of life at this time.</p>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Getting Started</h3>
        <ul className="space-y-2 text-slate-700">
          <li>• Navigate to <strong>Devices</strong> to view and manage all equipment</li>
          <li>• Use <strong>Transfers</strong> to track device location changes</li>
          <li>• Access <strong>Maintenance</strong> to schedule and track maintenance activities</li>
          <li>• Use <strong>Import/Export</strong> for bulk operations with Excel files</li>
          <li>• Check <strong>Reports</strong> for analytics and insights</li>
        </ul>
      </Card>
    </div>
  );
}
