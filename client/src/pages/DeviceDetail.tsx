import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, QrCode, Copy, AlertCircle, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { useMemo } from "react";

export default function DeviceDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/devices/:id");

  const deviceId = params?.id ? parseInt(params.id) : null;

  // Fetch device
  const { data: device, isLoading: deviceLoading } = trpc.devices.getById.useQuery(
    deviceId || 0,
    { enabled: !!deviceId }
  );

  // Fetch hierarchy data for location display
  const { data: allFaculties = [] } = trpc.hierarchy.faculties.useQuery();
  const { data: allDepartments = [] } = trpc.hierarchy.getAllDepartments.useQuery();
  const { data: allLaboratories = [] } = trpc.hierarchy.getAllLaboratories.useQuery();

  // Fetch transfer history
  const { data: transfers = [] } = trpc.transfers.getHistory.useQuery(
    deviceId || 0,
    { enabled: !!deviceId }
  );

  // Fetch maintenance history
  const { data: maintenanceHistory = [] } = trpc.maintenance.getHistory.useQuery(
    deviceId || 0,
    { enabled: !!deviceId }
  );

  // Fetch depreciation
  const { data: depreciation } = trpc.depreciation.getByDevice.useQuery(
    deviceId || 0,
    { enabled: !!deviceId }
  );

  // Create maps for faster lookups
  const facultyMap = useMemo(() => {
    const map = new Map();
    allFaculties.forEach((f: any) => map.set(f.id, f));
    return map;
  }, [allFaculties]);

  const departmentMap = useMemo(() => {
    const map = new Map();
    allDepartments.forEach((d: any) => map.set(d.id, d));
    return map;
  }, [allDepartments]);

  const labMap = useMemo(() => {
    const map = new Map();
    allLaboratories.forEach((lab: any) => map.set(lab.id, lab));
    return map;
  }, [allLaboratories]);

  const getFacultyName = (id: number) => facultyMap.get(id)?.name || "Unknown";
  const getDepartmentName = (id: number) => departmentMap.get(id)?.name || "Unknown";
  const getLaboratoryInfo = (id: number) => {
    const lab = labMap.get(id);
    if (!lab) return { name: "Unknown", code: "---" };
    return { name: lab.name, code: lab.code };
  };

  if (!match) return null;

  if (deviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading device details...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/devices")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Devices
        </Button>
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-slate-900 font-semibold text-lg mb-2">Device not found</p>
          <p className="text-slate-600 mb-4">Device ID: <span className="font-mono font-bold">{deviceId}</span></p>
          <p className="text-sm text-slate-500 mb-6">The device you're looking for doesn't exist in the database.</p>
          <Button onClick={() => navigate("/devices")} className="w-full">
            Go to Devices List
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

  const qrUrl = `${window.location.origin}/device/${device.qrCodeToken}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/devices")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{device.name}</h1>
            <p className="text-slate-600 font-mono text-sm mt-1">{device.deviceId}</p>
          </div>
        </div>
        <Badge className={getStatusColor(device.currentStatus)}>
          {getStatusLabel(device.currentStatus)}
        </Badge>
      </div>

      {/* Main Info */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Device Information */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Device Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Category</p>
                <p className="text-base font-medium text-slate-900">{device.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Brand</p>
                <p className="text-base font-medium text-slate-900">{device.brand || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-base font-medium text-slate-900">
                  {getStatusLabel(device.currentStatus)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Purchase Date</p>
                <p className="text-base font-medium text-slate-900">
                  {format(new Date(device.purchaseDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Purchase Price</p>
                <p className="text-base font-medium text-slate-900">
                  ${parseFloat(device.purchasePrice).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Expected Lifetime</p>
                <p className="text-base font-medium text-slate-900">
                  {device.expectedLifetimeYears} years
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Created</p>
                <p className="text-base font-medium text-slate-900">
                  {format(new Date(device.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            {device.currentIssue && (
              <div className="pt-4 border-t border-orange-300 bg-orange-50 -mx-6 -my-4 px-6 py-4 rounded-lg">
                <p className="text-sm font-bold text-orange-800 mb-2">⚠️ Current Issue</p>
                <p className="text-base text-orange-900 mt-1">{device.currentIssue}</p>
              </div>
            )}
            {device.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-slate-600">Notes</p>
                <p className="text-base text-slate-900 mt-1">{device.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Location Information */}
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">📍 Current Location</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-xs uppercase tracking-wider font-bold text-blue-600 mb-1">Faculty</p>
              <p className="text-lg font-semibold text-slate-900">
                {getFacultyName(device.currentFacultyId)}
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-xs uppercase tracking-wider font-bold text-green-600 mb-1">Department</p>
              <p className="text-lg font-semibold text-slate-900">
                {getDepartmentName(device.currentDepartmentId)}
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-xs uppercase tracking-wider font-bold text-purple-600 mb-1">Laboratory</p>
              <p className="text-lg font-semibold text-slate-900">
                {getLaboratoryInfo(device.currentLaboratoryId).name}
              </p>
              <p className="text-sm font-mono text-purple-600 font-bold mt-1">
                Lab Code: {getLaboratoryInfo(device.currentLaboratoryId).code}
              </p>
            </div>
          </div>
        </Card>

        {/* QR Code & Depreciation */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code
            </h3>
            <div className="bg-slate-100 p-4 rounded-lg mb-4 text-center">
              <p className="text-sm text-slate-600 mb-2">Public Device Page</p>
              <p className="text-xs font-mono text-slate-700 break-all">{qrUrl}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(qrUrl);
                toast.success("QR code URL copied!");
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
          </Card>

          {/* Depreciation */}
          {depreciation && (
            <Card className="p-6 border-orange-200 bg-orange-50">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                Depreciation
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Annual Depreciation</p>
                  <p className="text-lg font-bold text-slate-900">
                    ${parseFloat(depreciation.annualDepreciation.toString()).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Current Book Value</p>
                  <p className="text-lg font-bold text-orange-600">
                    ${parseFloat(depreciation.currentBookValue.toString()).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Depreciation %</p>
                  <p className="text-lg font-bold text-slate-900">
                    {parseFloat(depreciation.depreciationPercentage.toString()).toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs for History */}
      <Card>
        <Tabs defaultValue="transfers" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger value="transfers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Transfer History ({transfers.length})
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
              Maintenance History ({maintenanceHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Transfer History */}
          <TabsContent value="transfers" className="p-6">
            {transfers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No transfers recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transfers.map((transfer, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          Transfer {transfers.length - idx}
                        </p>
                        <p className="text-sm text-slate-600">
                          {format(new Date(transfer.transferDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      {transfer.approvalDate && (
                        <Badge variant="outline" className="bg-green-50">
                          Approved
                        </Badge>
                      )}
                    </div>
                    {transfer.reason && (
                      <p className="text-sm text-slate-700 mb-2">
                        <span className="font-medium">Reason:</span> {transfer.reason}
                      </p>
                    )}
                    {transfer.notes && (
                      <p className="text-sm text-slate-700 mb-2">
                        <span className="font-medium">Notes:</span> {transfer.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Maintenance History */}
          <TabsContent value="maintenance" className="p-6">
            {maintenanceHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No maintenance records yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceHistory.map((record, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {record.maintenanceType === "periodic" ? "Periodic Maintenance" : "Emergency Maintenance"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {format(new Date(record.maintenanceDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge variant={record.maintenanceType === "periodic" ? "outline" : "destructive"}>
                        {record.maintenanceType === "periodic" ? "Periodic" : "Emergency"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <p className="text-slate-600">Technician</p>
                        <p className="font-medium text-slate-900">{record.technicianName}</p>
                      </div>
                      {record.cost && (
                        <div>
                          <p className="text-slate-600">Cost</p>
                          <p className="font-medium text-slate-900">
                            ${parseFloat(record.cost.toString()).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Notes:</span> {record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
