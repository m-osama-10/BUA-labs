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
import { Plus, Search, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function MaintenanceList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch maintenance requests with device info
  const { data: maintenanceResponse } = trpc.maintenance.list.useQuery({
    limit: 1000,
  });
  const maintenanceRequests = maintenanceResponse?.items || [];

  // Filter maintenance
  const filteredRequests = useMemo(() => {
    return maintenanceRequests.filter((req: any) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          (req.deviceId?.toString().toLowerCase().includes(search)) ||
          (req.notes?.toLowerCase().includes(search)) ||
          (req.maintenanceType?.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      if (statusFilter !== "all") {
        // Assuming status is stored in the request
        if (req.status !== statusFilter) return false;
      }

      return true;
    });
  }, [maintenanceRequests, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "outline", label: "Approved" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    return type === "emergency" ? "🔴 Emergency" : "🟡 Periodic";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Maintenance Requests</h1>
          <p className="text-slate-600 mt-1">Track device maintenance and repairs</p>
        </div>
        <Button onClick={() => navigate("/maintenance/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Maintenance
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search by device ID or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Maintenance Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Device</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request: any) => (
                  <TableRow key={request.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{request.deviceName || "Unknown Device"}</span>
                        <span className="text-xs text-slate-500">ID: {request.deviceId}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeLabel(request.maintenanceType)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.notes || "—"}
                    </TableCell>
                    <TableCell>
                      {request.createdAt
                        ? format(new Date(request.createdAt), "MMM dd, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status || "pending")}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/maintenance/${request.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600">No maintenance requests found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600">Total Requests</p>
          <p className="text-2xl font-bold text-slate-900">{maintenanceRequests.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Pending</p>
          <p className="text-2xl font-bold text-slate-900">
            {maintenanceRequests.filter((r: any) => r.status === "pending").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">In Progress</p>
          <p className="text-2xl font-bold text-slate-900">
            {maintenanceRequests.filter((r: any) => r.status === "approved").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Completed</p>
          <p className="text-2xl font-bold text-slate-900">
            {maintenanceRequests.filter((r: any) => r.status === "completed").length}
          </p>
        </Card>
      </div>
    </div>
  );
}
