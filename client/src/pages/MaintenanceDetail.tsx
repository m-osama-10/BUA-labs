import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";

const completeMaintenanceSchema = z.object({
  cost: z.string().optional(),
  notes: z.string().optional(),
});

type CompleteMaintenanceData = z.infer<typeof completeMaintenanceSchema>;

export default function MaintenanceDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/maintenance/:id");
  const requestId = params?.id ? parseInt(params.id) : null;

  if (!requestId || !match) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">Invalid maintenance request ID</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/maintenance")}
            className="mt-4"
          >
            Back to Maintenance List
          </Button>
        </div>
      </div>
    );
  }

  // Fetch maintenance request
  const { data: request, isLoading } = trpc.maintenance.getById.useQuery(requestId);

  // Fetch users for technician assignment
  const { data: users = [] } = trpc.users.list.useQuery();

  // Mutations
  const completeMutation = trpc.maintenance.complete.useMutation();
  const approveMutation = trpc.maintenance.approve.useMutation();

  const form = useForm<CompleteMaintenanceData>({
    resolver: zodResolver(completeMaintenanceSchema),
    defaultValues: {
      cost: "",
      notes: "",
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading maintenance request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">Maintenance request not found</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/maintenance")}
            className="mt-4"
          >
            Back to Maintenance List
          </Button>
        </div>
      </div>
    );
  }

  const onCompleteSubmit = async (data: CompleteMaintenanceData) => {
    try {
      await completeMutation.mutateAsync({
        requestId,
        cost: data.cost,
        notes: data.notes,
      });
      toast.success("Maintenance completed successfully");
      navigate("/maintenance");
    } catch (error: any) {
      toast.error(error?.message || "Failed to complete maintenance");
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        requestId,
        assignedTo: request.assignedTo || 1,
        scheduledDate: request.scheduledDate,
      });
      toast.success("Maintenance approved successfully");
      navigate("/maintenance");
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve maintenance");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      requested: { variant: "secondary", label: "Pending Approval" },
      approved: { variant: "outline", label: "Approved" },
      in_progress: { variant: "secondary", label: "In Progress" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || variants.requested;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    return type === "emergency" ? "🔴 Emergency" : "🟡 Periodic";
  };

  const isCompleted = request.status === "completed";
  const isPending = request.status === "requested";
  const isApproved = request.status === "approved";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/maintenance")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Maintenance Request #{request.id}
          </h1>
          <p className="text-slate-600 mt-1">
            {getTypeLabel(request.maintenanceType)}
          </p>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Request Status */}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Status</p>
            <div>{getStatusBadge(request.status || "requested")}</div>
          </div>

          {/* Request Date */}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Request Date</p>
            <p className="text-lg font-semibold text-slate-900">
              {request.createdAt
                ? format(new Date(request.createdAt), "MMM dd, yyyy HH:mm")
                : "—"}
            </p>
          </div>
        </div>

        {/* Device Info */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Device Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Device ID</p>
              <p className="text-lg font-semibold text-slate-900">#{request.deviceId}</p>
            </div>
            {request.deviceName && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Device Name</p>
                <p className="text-lg font-semibold text-slate-900">{request.deviceName}</p>
              </div>
            )}
            {request.deviceBrand && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Brand</p>
                <p className="text-slate-900">{request.deviceBrand}</p>
              </div>
            )}
            {request.deviceCategory && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Category</p>
                <p className="text-slate-900">{request.deviceCategory}</p>
              </div>
            )}
            {request.deviceCurrentStatus && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Current Status</p>
                <Badge>{request.deviceCurrentStatus}</Badge>
              </div>
            )}
            {request.currentIssue && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Current Issue</p>
                <p className="text-slate-900">{request.currentIssue}</p>
              </div>
            )}
            {request.facultyName && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Faculty</p>
                <p className="text-slate-900 font-medium">{request.facultyName}</p>
              </div>
            )}
            {request.departmentName && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Department</p>
                <p className="text-slate-900">{request.departmentName}</p>
              </div>
            )}
            {request.laboratoryName && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Laboratory/Location</p>
                <p className="text-slate-900">{request.laboratoryName}</p>
              </div>
            )}
            {request.purchaseDate && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Purchase Date</p>
                <p className="text-slate-900">
                  {format(new Date(request.purchaseDate), "MMM dd, yyyy")}
                </p>
              </div>
            )}
            {request.purchasePrice && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Purchase Price</p>
                <p className="text-slate-900">${request.purchasePrice}</p>
              </div>
            )}
            {request.expectedLifetimeYears && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Expected Lifetime</p>
                <p className="text-slate-900">{request.expectedLifetimeYears} years</p>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Details */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Maintenance Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Maintenance Type</p>
              <p className="text-slate-900">{getTypeLabel(request.maintenanceType)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Scheduled Date</p>
              <p className="text-slate-900">
                {request.scheduledDate
                  ? format(new Date(request.scheduledDate), "MMM dd, yyyy")
                  : "Not scheduled"}
              </p>
            </div>
            {isCompleted && request.completedDate && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Completion Date</p>
                <p className="text-slate-900">
                  {format(new Date(request.completedDate), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
            )}
            {request.cost && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Maintenance Cost</p>
                <p className="text-slate-900 font-semibold">${request.cost}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {request.notes && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Notes</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{request.notes}</p>
          </div>
        )}
      </Card>

      {/* Complete Maintenance Form */}
      {isApproved && !isCompleted && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Complete Maintenance</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCompleteSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Cost (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter cost in currency"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any notes about the maintenance..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/maintenance")}
                  disabled={completeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={completeMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {completeMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {completeMutation.isPending ? "Completing..." : "Mark as Completed"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      )}

      {/* Approve Button */}
      {isPending && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Approve Maintenance Request</h2>
          <p className="text-slate-600 mb-4">
            This maintenance request is pending approval. Click below to approve it.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/maintenance")}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {approveMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {approveMutation.isPending ? "Approving..." : "Approve Request"}
            </Button>
          </div>
        </Card>
      )}

      {/* Completed Message */}
      {isCompleted && (
        <Card className="p-6 border-green-200 bg-green-50">
          <h2 className="text-lg font-semibold text-green-900 mb-2">✓ Maintenance Completed</h2>
          <p className="text-green-700">
            This maintenance request has been completed and the device status has been updated.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/maintenance")}
            className="mt-4"
          >
            Back to List
          </Button>
        </Card>
      )}
    </div>
  );
}
