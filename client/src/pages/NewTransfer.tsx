import { useState, useMemo } from "react";
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
  FormDescription,
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
import { ArrowLeft, Loader2, AlertCircle, ArrowRight } from "lucide-react";

const transferSchema = z.object({
  deviceId: z.string().min(1, "Device is required"),
  toFacultyId: z.string().min(1, "To Faculty is required"),
  toDepartmentId: z.string().min(1, "To Department is required"),
  toLaboratoryId: z.string().min(1, "To Laboratory is required"),
  transferDate: z.string().min(1, "Transfer date is required"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function NewTransfer() {
  const [, navigate] = useLocation();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      deviceId: "",
      toFacultyId: "",
      toLaboratoryId: "",
      transferDate: new Date().toISOString().split("T")[0],
      reason: "",
      notes: "",
    },
  });

  // Fetch devices for search
  const { data: devicesResponse } = trpc.devices.list.useQuery({
    limit: 1000,
  });
  const devices = devicesResponse?.items || [];

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

  // Fetch faculties
  const { data: faculties = [] } = trpc.hierarchy.faculties.useQuery();
  const facultyMap = useMemo(() => {
    const map = new Map();
    faculties.forEach((f: any) => {
      map.set(f.id, f);
    });
    return map;
  }, [faculties]);

  // Fetch all departments for lookup
  const { data: allDepartments = [] } = trpc.hierarchy.getAllDepartments.useQuery();
  const departmentMap = useMemo(() => {
    const map = new Map();
    allDepartments.forEach((dept: any) => {
      map.set(dept.id, dept);
    });
    return map;
  }, [allDepartments]);

  // Fetch to departments and laboratories (hierarchy)
  const toFacultyId = form.watch("toFacultyId");
  const toDepartmentId = form.watch("toDepartmentId");

  const { data: toDepartments = [] } = trpc.hierarchy.departments.useQuery(
    toFacultyId ? parseInt(toFacultyId) : -1,
    { enabled: !!toFacultyId }
  );

  const { data: toLaboratories = [] } = trpc.hierarchy.laboratories.useQuery(
    toDepartmentId ? parseInt(toDepartmentId) : -1,
    { enabled: !!toDepartmentId }
  );

  const createTransferMutation = trpc.transfers.create.useMutation({
    onSuccess: () => {
      toast.success("Device transfer registered successfully!");
      navigate("/transfers");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transfer");
    },
  });

  const onSubmit = async (data: TransferFormData) => {
    if (!deviceInfo) {
      toast.error("Please select a device first");
      return;
    }

    try {
      await createTransferMutation.mutateAsync({
        deviceId: deviceInfo.id,
        fromFacultyId: deviceInfo.currentFacultyId,
        fromDepartmentId: deviceInfo.currentDepartmentId,
        fromLaboratoryId: deviceInfo.currentLaboratoryId,
        toFacultyId: parseInt(data.toFacultyId),
        toDepartmentId: parseInt(data.toDepartmentId),
        toLaboratoryId: parseInt(data.toLaboratoryId),
        transferDate: new Date(data.transferDate),
        reason: data.reason,
        notes: data.notes,
      });
    } catch (error) {
      console.error("Error creating transfer:", error);
    }
  };

  const filteredDevices = devices.filter(
    (device: any) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = createTransferMutation.isPending;

  // Get laboratory info (name and code)
  const getLaboratoryInfo = (labId: number) => {
    const lab = labMap.get(labId);
    if (!lab) return { name: "Unknown", code: "---" };
    return { name: lab.name, code: lab.code };
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/transfers")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transfer Device</h1>
          <p className="text-slate-600 mt-1">Move a device to a new location</p>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
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
              
              {/* Current Location */}
              <div className="border-t pt-3 mt-3">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Current Location:</p>
                <div className="space-y-1">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">Faculty:</span> {facultyMap.get(deviceInfo.currentFacultyId)?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">Department:</span> {departmentMap.get(deviceInfo.currentDepartmentId)?.name || "Unknown"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">Laboratory:</span>
                    <span className="text-slate-600">{getLaboratoryInfo(deviceInfo.currentLaboratoryId).name}</span>
                    <span className="font-mono text-blue-600 font-bold">#{getLaboratoryInfo(deviceInfo.currentLaboratoryId).code}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transfer Form */}
      {deviceInfo && (
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* New Location */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">New Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Faculty */}
                  <FormField
                    control={form.control}
                    name="toFacultyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faculty</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select faculty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {faculties.map((faculty) => (
                              <SelectItem key={faculty.id} value={faculty.id.toString()}>
                                {faculty.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Department */}
                  <FormField
                    control={form.control}
                    name="toDepartmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!toFacultyId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={toFacultyId ? "Select" : "Select faculty first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {toDepartments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Laboratory */}
                  <FormField
                    control={form.control}
                    name="toLaboratoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Laboratory</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!toFacultyId || toLaboratories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !toFacultyId ? "Select faculty first" :
                                toLaboratories.length === 0 ? "No laboratories found" :
                                "Select laboratory"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {toLaboratories.map((lab) => (
                              <SelectItem key={lab.id} value={lab.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <span>{lab.name}</span>
                                  <span className="text-xs font-mono text-slate-500">
                                    ({lab.code})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Transfer Date */}
              <FormField
                control={form.control}
                name="transferDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Transfer (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Equipment upgrade, Relocation, Maintenance"
                        {...field}
                      />
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
                  onClick={() => navigate("/transfers")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isLoading ? "Creating..." : "Register Transfer"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      )}

      {!deviceInfo && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">Search and select a device to create a transfer</p>
        </Card>
      )}
    </div>
  );
}
