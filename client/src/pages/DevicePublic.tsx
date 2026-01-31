import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function DevicePublic() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/device/:token");

  const token = params?.token;

  // Fetch public device data
  const { data: device, isLoading, error } = trpc.devices.getPublic.useQuery(
    token || "",
    { enabled: !!token }
  );

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading device information...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Device Not Found</h1>
          <p className="text-slate-600 mb-6">
            The device you're looking for doesn't exist or the link has expired.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-green-100 text-green-800";
      case "under_maintenance":
        return "bg-orange-100 text-orange-800";
      case "out_of_service":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "working":
        return "Working";
      case "under_maintenance":
        return "Under Maintenance";
      case "out_of_service":
        return "Out of Service";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working":
        return <CheckCircle className="w-5 h-5" />;
      case "under_maintenance":
        return <AlertTriangle className="w-5 h-5" />;
      case "out_of_service":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const age = Math.floor(
    (new Date().getTime() - new Date(device.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
  );
  const remainingLife = device.expectedLifetimeYears - age;
  const depreciationPercent = Math.min(100, (age / device.expectedLifetimeYears) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">{device.name}</h1>
          <p className="text-slate-600 font-mono text-sm mt-2">{device.deviceId}</p>
        </div>

        {/* Status Card */}
        <Card className={`p-6 ${getStatusColor(device.currentStatus)} rounded-lg`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(device.currentStatus)}
            <div>
              <p className="text-sm opacity-90">Device Status</p>
              <p className="text-2xl font-bold">{getStatusLabel(device.currentStatus)}</p>
            </div>
          </div>
        </Card>

        {/* Device Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Device Information</h2>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Category</p>
              <p className="text-base font-medium text-slate-900 mt-1">{device.category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Purchase Date</p>
              <p className="text-base font-medium text-slate-900 mt-1">
                {format(new Date(device.purchaseDate), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Purchase Price</p>
              <p className="text-base font-medium text-slate-900 mt-1">
                ${parseFloat(device.purchasePrice).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Location</p>
              <div className="space-y-2 mt-1">
                <p className="text-base font-medium text-slate-900">Faculty: {device.facultyName || `Faculty ${device.currentFacultyId}`}</p>
                <p className="text-base font-medium text-slate-900">Department: {device.departmentName || `Department ${device.currentDepartmentId}`}</p>
                <p className="text-base font-medium text-slate-900">Laboratory: {device.laboratoryName || `Lab ${device.currentLaboratoryId}`}</p>
                {device.laboratoryCode && <p className="text-sm font-mono text-blue-600 font-bold">Code: {device.laboratoryCode}</p>}
              </div>
            </div>
          </div>

          {device.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Notes</p>
              <p className="text-slate-900 mt-2">{device.notes}</p>
            </div>
          )}
        </Card>

        {/* Depreciation Info */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Asset Value</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Depreciation</span>
                <span className="text-sm font-medium text-slate-900">{depreciationPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${depreciationPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase">Age</p>
                <p className="text-lg font-medium text-slate-900 mt-1">{age} years</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase">Remaining Life</p>
                <p className={`text-lg font-medium mt-1 ${remainingLife > 0 ? "text-green-600" : "text-red-600"}`}>
                  {remainingLife > 0 ? `~${remainingLife} years` : "Expired"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center text-sm text-slate-700">
          <p>
            This device information is <strong>publicly accessible</strong> via QR code or direct link.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>Generated on {format(new Date(), "MMM dd, yyyy 'at' hh:mm a")}</p>
        </div>
      </div>
    </div>
  );
}
