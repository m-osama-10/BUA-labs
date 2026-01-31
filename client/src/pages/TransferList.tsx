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
import { Plus, Search, AlertCircle, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function TransferList() {
  // Fetch all laboratories for lookup
  const { data: allLaboratories = [] } = trpc.hierarchy.getAllLaboratories.useQuery();
  
  // Create a map of lab IDs to labs for faster lookups
  const labMap = useMemo(() => {
    const map = new Map();
    allLaboratories.forEach((lab: any) => {
      map.set(lab.id, lab);
    });
    return map;
  }, [allLaboratories]);
  
  // Get laboratory info (name and code)
  const getLaboratoryInfo = (id: number) => {
    const lab = labMap.get(id);
    if (!lab) return { name: "Unknown", code: "---" };
    return { name: lab.name, code: lab.code };
  };

  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch transfers
  const { data: transfersResponse } = trpc.transfers.list.useQuery({
    limit: 1000,
  });
  const transfers = transfersResponse?.items || [];

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer: any) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          (transfer.deviceId?.toString().toLowerCase().includes(search)) ||
          (transfer.reason?.toLowerCase().includes(search)) ||
          (transfer.notes?.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      if (statusFilter !== "all") {
        if (transfer.status !== statusFilter) return false;
      }

      return true;
    });
  }, [transfers, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Device Transfers</h1>
          <p className="text-slate-600 mt-1">Track device movements between locations</p>
        </div>
        <Button onClick={() => navigate("/transfers/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Transfer Device
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search by device ID or reason..."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transfers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Device</TableHead>
                <TableHead>From</TableHead>
                <TableHead></TableHead>
                <TableHead>To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((transfer: any) => (
                  <TableRow key={transfer.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      #{transfer.deviceId}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900">
                          {getLaboratoryInfo(transfer.fromLaboratoryId).name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Code: {getLaboratoryInfo(transfer.fromLaboratoryId).code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className="w-4 h-4 text-slate-400 mx-auto" />
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900">
                          {getLaboratoryInfo(transfer.toLaboratoryId).name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Code: {getLaboratoryInfo(transfer.toLaboratoryId).code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transfer.transferDate
                        ? format(new Date(transfer.transferDate), "MMM dd, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transfer.reason || "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(transfer.status || "pending")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600">No transfers found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600">Total Transfers</p>
          <p className="text-2xl font-bold text-slate-900">{transfers.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Pending</p>
          <p className="text-2xl font-bold text-slate-900">
            {transfers.filter((t: any) => t.status === "pending").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Completed</p>
          <p className="text-2xl font-bold text-slate-900">
            {transfers.filter((t: any) => t.status === "completed").length}
          </p>
        </Card>
      </div>
    </div>
  );
}
