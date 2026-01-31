import { Card } from "@/components/ui/card";
import { Package, Wrench, AlertCircle, BarChart3, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ReportsPage() {
  // Fetch dashboard stats with auto-refresh every 10s
  const statsQuery = trpc.dashboard.stats.useQuery(undefined, { refetchInterval: 10000 });
  const byCategoryQuery = trpc.reports.devicesByCategory.useQuery(undefined, { refetchInterval: 10000 });
  const topBrandsQuery = trpc.reports.topBrands.useQuery(undefined, { refetchInterval: 10000 });

  const stats = statsQuery.data;
  const byCategory = byCategoryQuery.data;
  const topBrands = topBrandsQuery.data;

  // Sample chart data
  const statusDistribution = stats ? [
    { name: "Working", value: stats.working, color: "bg-green-500" },
    { name: "Maintenance", value: stats.maintenance, color: "bg-orange-500" },
    { name: "Out of Service", value: stats.outOfService, color: "bg-red-500" },
  ] : [];

  const totalDevices = stats?.totalDevices || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-2">Device status and performance reports</p>
        <div className="text-sm text-slate-500 mt-1">
          Last updated: {statsQuery.dataUpdatedAt ? new Date(statsQuery.dataUpdatedAt).toLocaleString() : "-"}
          {statsQuery.isFetching ? <span className="ml-2 text-xs text-slate-400"> (refreshing)</span> : null}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Devices</p>
              <p className="text-2xl font-bold text-slate-900">{totalDevices}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Working Devices</p>
              <p className="text-2xl font-bold text-green-600">{stats?.working || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Issues to Address</p>
              <p className="text-2xl font-bold text-red-600">{(stats?.maintenance || 0) + (stats?.outOfService || 0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Distribution Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Device Status Distribution
        </h2>
        
        <div className="space-y-4">
          {statusDistribution.map((item) => {
            const percentage = totalDevices > 0 ? Math.round((item.value / totalDevices) * 100) : 0;
            return (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">{item.value}</span>
                    <span className="text-sm text-slate-500">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className={`${item.color} h-3 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary Statistics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Summary Statistics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600 mb-2">Operational Efficiency</p>
            <div className="text-3xl font-bold text-green-600">
              {totalDevices > 0 ? Math.round(((stats?.working || 0) / totalDevices) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Devices in working condition</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">Maintenance Required</p>
            <div className="text-3xl font-bold text-orange-600">
              {totalDevices > 0 ? Math.round(((stats?.maintenance || 0) / totalDevices) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Devices under maintenance</p>
          </div>
        </div>
      </Card>

      {/* Additional Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Report Information</h3>
        <ul className="space-y-2 text-slate-700 text-sm">
          <li>• Data is updated in real-time from the device database</li>
          <li>• Charts show current status distribution across all 311 pharmacy devices</li>
          <li>• Use filters to focus on specific departments or facilities</li>
          <li>• Export reports for further analysis</li>
        </ul>
      </Card>

      {/* Devices by Category */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Devices by Category</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="pb-2">Category</th>
                <th className="pb-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {byCategory && byCategory.map((r: any) => (
                <tr key={r.category} className="border-t">
                  <td className="py-2">{r.category}</td>
                  <td className="py-2 font-medium">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Brands (heuristic) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Brands (heuristic)</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="pb-2">Brand</th>
                <th className="pb-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {topBrands && topBrands.map((r: any) => (
                <tr key={r.brand} className="border-t">
                  <td className="py-2">{r.brand}</td>
                  <td className="py-2 font-medium">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* (Removed specific device-type card — use Devices by Category or search term report) */}
    </div>
  );
}
