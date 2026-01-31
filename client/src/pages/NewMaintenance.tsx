import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
const maintenanceSchema = z.object({
  deviceId: z.string().min(1, "Device ID or Device Name is required"),
  maintenanceType: z.enum(["periodic", "emergency"]),
  issueDescription: z.string().min(5, "Please describe the issue"),
  maintenanceDate: z.string().min(1, "Date is required"),
  estimatedCost: z.string().optional(),
  notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
export default function NewMaintenance() {
  const [, navigate] = useLocation();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      deviceId: "",
      maintenanceType: "emergency",
      issueDescription: "",
      maintenanceDate: new Date().toISOString().split("T")[0],
      estimatedCost: "",
      notes: "",
    },
  });

  // Fetch devices for search
  const { data: devicesResponse } = trpc.devices.list.useQuery({
    limit: 1000,
  });
  const devices = devicesResponse?.items || [];

  const createMaintenanceMutation = trpc.maintenance.create.useMutation({
    onSuccess: () => {
      toast.success("Maintenance request created successfully!");
      navigate("/maintenance");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create maintenance request");
    },
  });

  const onSubmit = async (data: MaintenanceFormData) => {
    if (!deviceInfo) {
      toast.error("Please select a device first");
      return;
    }

    try {
      console.log("Submitting maintenance:", {
        deviceId: deviceInfo.id,
        maintenanceType: data.maintenanceType,
        scheduledDate: new Date(data.maintenanceDate),
        notes: data.issueDescription,
      });

      await createMaintenanceMutation.mutateAsync({
        deviceId: deviceInfo.id,
        maintenanceType: data.maintenanceType,
        scheduledDate: new Date(data.maintenanceDate),
        currentIssue: data.issueDescription,
        notes: data.notes || "",
      });
    } catch (error: any) {
      console.error("Error creating maintenance:", error);
      toast.error(error?.message || "Failed to create maintenance request");
    }
  };

  const filteredDevices = devices.filter(
    (device: any) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = createMaintenanceMutation.isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/maintenance")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Report Device Issue</h1>
          <p className="text-slate-600 mt-1">Register a maintenance request or issue</p>
        </div>
      </div>

      {/* Device Search */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Device</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Search Device</label>
            <Input
              placeholder="Search by device name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1"
            />
          </div>

          {searchQuery && filteredDevices.length > 0 && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredDevices.slice(0, 5).map((device: any) => (
                <button
                  key={device.id}
                  onClick={() => {
                    setDeviceInfo(device);
                    setSearchQuery("");
                    form.setValue("deviceId", device.deviceId);
                  }}
                  className="w-full text-left p-3 hover:bg-slate-100 border-b last:border-b-0"
                >
                  <div className="font-medium text-slate-900">{device.name}</div>
                  <div className="text-sm text-slate-600">{device.deviceId}</div>
                </button>
              ))}
            </div>
          )}

          {deviceInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900">{deviceInfo.name}</p>
                  <p className="text-sm text-slate-600">{deviceInfo.deviceId}</p>
                  <p className="text-sm text-slate-600">Category: {deviceInfo.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDeviceInfo(null);
                    form.setValue("deviceId", "");
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Form */}
      {deviceInfo && (
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Maintenance Type */}
              <FormField
                control={form.control}
                name="maintenanceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="emergency">🚨 Emergency - Device Broken</SelectItem>
                        <SelectItem value="periodic">📅 Periodic - Routine Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Issue Description */}
              <FormField
                control={form.control}
                name="issueDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the issue or maintenance needed..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="maintenanceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Cost */}
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional information..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/maintenance")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isLoading ? "Creating..." : "Create Maintenance Request"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      )}

      {!deviceInfo && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">Search and select a device to create a maintenance request</p>
        </Card>
      )}
    </div>
  );
}
