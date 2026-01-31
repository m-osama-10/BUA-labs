import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, QrCode, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DeviceList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [labFilter, setLabFilter] = useState<string>("all");

  // Fetch devices
  const { data: devicesResponse, isLoading: devicesLoading } = trpc.devices.list.useQuery({
    limit: 1000,
  });

  const devices = devicesResponse?.items || [];

  // Fetch hierarchy data
  const { data: faculties = [] } = trpc.hierarchy.faculties.useQuery();
  const { data: departments = [] } = trpc.hierarchy.departments.useQuery(
    facultyFilter !== "all" ? parseInt(facultyFilter) : -1,
    { enabled: facultyFilter !== "all" }
  );
  
  // Fetch ALL departments for displaying names in the table (not just filtered ones)
  const { data: allDepartments = [] } = trpc.hierarchy.getAllDepartments.useQuery();
  
  // Fetch all laboratories - this is needed for displaying lab names in the table
  const { data: allLaboratories = [] } = trpc.hierarchy.getAllLaboratories.useQuery();
  
  // Fetch filtered laboratories for filter dropdown
  const { data: laboratories = [] } = trpc.hierarchy.laboratories.useQuery(
    departmentFilter !== "all" ? parseInt(departmentFilter) : -1,
    { enabled: departmentFilter !== "all" }
  );
  
  // Create a map of faculty IDs to faculties for faster lookups
  const facultyMap = useMemo(() => {
    const map = new Map();
    faculties.forEach((f: any) => {
      map.set(f.id, f);
    });
    return map;
  }, [faculties]);
  
  // Create a map of department IDs to departments for faster lookups
  const departmentMap = useMemo(() => {
    const map = new Map();
    allDepartments.forEach((d: any) => {
      map.set(d.id, d);
    });
    return map;
  }, [allDepartments]);
  
  // Create a map of lab IDs to labs for faster lookups
  const labMap = useMemo(() => {
    const map = new Map();
    allLaboratories.forEach((lab: any) => {
      map.set(lab.id, lab);
    });
    return map;
  }, [allLaboratories]);

  interface Device {
    id?: number;
    name: string;
    deviceId: string;
    category: string;
    currentStatus: string;
    currentFacultyId: number;
    currentDepartmentId: number;
    currentLaboratoryId: number;
    qrCodeToken?: string;
  }

  // Filter devices
  const filteredDevices = useMemo(() => {
    return devices.filter((device: Device) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          device.name.toLowerCase().includes(search) ||
          device.deviceId.toLowerCase().includes(search) ||
          device.category.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && device.currentStatus !== statusFilter) {
        return false;
      }

      // Faculty filter
      if (facultyFilter !== "all" && device.currentFacultyId !== parseInt(facultyFilter)) {
        return false;
      }

      // Department filter
      if (departmentFilter !== "all" && device.currentDepartmentId !== parseInt(departmentFilter)) {
        return false;
      }

      // Laboratory filter
      if (labFilter !== "all" && device.currentLaboratoryId !== parseInt(labFilter)) {
        return false;
      }

      return true;
    });
  }, [devices, searchTerm, statusFilter, facultyFilter, departmentFilter, labFilter]);

  // Get faculty name - use map for all faculties, not just filtered ones
  const getFacultyName = (id: number) => {
    return facultyMap.get(id)?.name || "Unknown";
  };

  // Get department name - use map for all departments, not just filtered ones
  const getDepartmentName = (id: number) => {
    return departmentMap.get(id)?.name || "Unknown";
  };

  // Get laboratory name and code from the map
  const getLaboratoryInfo = (id: number) => {
    const lab = labMap.get(id);
    if (!lab) return { name: "Unknown", code: "---" };
    return { name: lab.name, code: lab.code };
  };

  // Status badge color
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Devices</h1>
          <p className="text-slate-600 mt-2">
            {filteredDevices.length} device{filteredDevices.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button onClick={() => navigate("/devices/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, ID, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
              <SelectItem value="out_of_service">Out of Service</SelectItem>
            </SelectContent>
          </Select>

          {/* Faculty Filter */}
          <Select value={facultyFilter} onValueChange={(val) => {
            setFacultyFilter(val);
            setDepartmentFilter("all");
            setLabFilter("all");
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {faculties.map((f: any) => (
                <SelectItem key={f.id} value={f.id.toString()}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Department Filter */}
          <Select value={departmentFilter} onValueChange={(val) => {
            setDepartmentFilter(val);
            setLabFilter("all");
          }} disabled={facultyFilter === "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Laboratory Filter */}
          <Select value={labFilter} onValueChange={setLabFilter} disabled={departmentFilter === "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Laboratory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Laboratories</SelectItem>
              {laboratories.map((l) => (
                <SelectItem key={l.id} value={l.id.toString()}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Devices Table */}
      <Card>
        {devicesLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-slate-600">Loading devices...</p>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">No devices found</p>
            <p className="text-sm text-slate-500">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device: Device) => (
                  <TableRow key={device.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm font-semibold">
                      {device.deviceId}
                    </TableCell>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell className="text-slate-600">{device.category}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block bg-blue-50 px-2 py-1 rounded text-blue-700 text-xs font-semibold">
                            Faculty
                          </span>
                          <span className="font-medium text-slate-900">{getFacultyName(device.currentFacultyId)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block bg-green-50 px-2 py-1 rounded text-green-700 text-xs font-semibold">
                            Dept
                          </span>
                          <span className="text-slate-600">{getDepartmentName(device.currentDepartmentId)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block bg-purple-50 px-2 py-1 rounded text-purple-700 text-xs font-semibold">
                            Lab
                          </span>
                          <span className="text-slate-600">{getLaboratoryInfo(device.currentLaboratoryId).name}</span>
                          <span className="font-mono text-blue-600 font-bold ml-auto">#{getLaboratoryInfo(device.currentLaboratoryId).code}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(device.currentStatus)}>
                        {getStatusLabel(device.currentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/devices/${device.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Copy QR code URL to clipboard
                            const qrUrl = `${window.location.origin}/device/${device.qrCodeToken}`;
                            navigator.clipboard.writeText(qrUrl);
                            toast.success("QR code URL copied!");
                          }}
                          title="Copy QR code URL"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      {filteredDevices.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-slate-600">Total</p>
            <p className="text-2xl font-bold text-slate-900">{filteredDevices.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Working</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredDevices.filter((d: Device) => d.currentStatus === "working").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Under Maintenance</p>
            <p className="text-2xl font-bold text-orange-600">
              {filteredDevices.filter((d: Device) => d.currentStatus === "under_maintenance").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600">Out of Service</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredDevices.filter((d: Device) => d.currentStatus === "out_of_service").length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
