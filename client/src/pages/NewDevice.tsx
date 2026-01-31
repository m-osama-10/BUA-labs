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
  FormDescription,
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
import { ArrowLeft, Loader2 } from "lucide-react";

const deviceSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  category: z.string().min(1, "Category is required"),
  currentFacultyId: z.string().min(1, "Faculty is required"),
  currentDepartmentId: z.string().min(1, "Department is required"),
  currentLaboratoryId: z.string().min(1, "Laboratory is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchasePrice: z.string().min(1, "Purchase price is required"),
  expectedLifetimeYears: z.string().min(1, "Expected lifetime is required"),
  notes: z.string().optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

export default function NewDevice() {
  const [, navigate] = useLocation();
  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      category: "",
      currentFacultyId: "",
      currentDepartmentId: "",
      currentLaboratoryId: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: "",
      expectedLifetimeYears: "5",
      notes: "",
    },
  });

  const selectedFacultyId = form.watch("currentFacultyId");
  const selectedDepartmentId = form.watch("currentDepartmentId");

  // Fetch data
  const { data: faculties = [], isLoading: facultiesLoading } = trpc.hierarchy.faculties.useQuery();
  
  const facultyIdForQuery = selectedFacultyId ? parseInt(selectedFacultyId) : -1;
  const { data: departments = [], isLoading: departmentsLoading } = trpc.hierarchy.departments.useQuery(
    facultyIdForQuery,
    { enabled: !!selectedFacultyId }
  );
  
  const deptIdForQuery = selectedDepartmentId ? parseInt(selectedDepartmentId) : -1;
  const { data: laboratories = [], isLoading: laboratoriesLoading } = trpc.hierarchy.laboratories.useQuery(
    deptIdForQuery,
    { enabled: !!selectedDepartmentId }
  );

  const createDeviceMutation = trpc.devices.create.useMutation({
    onSuccess: () => {
      toast.success("Device created successfully!");
      navigate("/devices");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create device");
    },
  });

  const onSubmit = async (data: DeviceFormData) => {
    try {
      console.log("Submitting device:", {
        name: data.name,
        category: data.category,
        currentFacultyId: parseInt(data.currentFacultyId),
        currentDepartmentId: parseInt(data.currentDepartmentId),
        currentLaboratoryId: parseInt(data.currentLaboratoryId),
        purchaseDate: new Date(data.purchaseDate),
        purchasePrice: data.purchasePrice,
        expectedLifetimeYears: parseInt(data.expectedLifetimeYears),
        notes: data.notes,
      });
      
      await createDeviceMutation.mutateAsync({
        name: data.name,
        category: data.category,
        currentFacultyId: parseInt(data.currentFacultyId),
        currentDepartmentId: parseInt(data.currentDepartmentId),
        currentLaboratoryId: parseInt(data.currentLaboratoryId),
        purchaseDate: new Date(data.purchaseDate),
        purchasePrice: data.purchasePrice,
        expectedLifetimeYears: parseInt(data.expectedLifetimeYears),
        notes: data.notes,
      });
    } catch (error: any) {
      console.error("Error creating device:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        data: error?.data,
      });
    }
  };

  const isLoading = facultiesLoading || departmentsLoading || laboratoriesLoading || createDeviceMutation.isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/devices")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Add New Device</h1>
          <p className="text-slate-600 mt-1">Create a new device record in the system</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Microscope Model X" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Electronics, Laboratory Equipment" {...field} />
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
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes about this device..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Location</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentFacultyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a faculty" />
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

                <FormField
                  control={form.control}
                  name="currentDepartmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedFacultyId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedFacultyId ? "Select a department" : "Select faculty first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
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

                <FormField
                  control={form.control}
                  name="currentLaboratoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laboratory</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedDepartmentId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedDepartmentId ? "Select a laboratory" : "Select department first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {laboratories.map((lab) => (
                            <SelectItem key={lab.id} value={lab.id.toString()}>
                              {lab.name}
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

            {/* Financial Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Information</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Date when the device was purchased</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedLifetimeYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Lifetime (Years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          placeholder="5"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Used for depreciation calculation</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/devices")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Creating..." : "Create Device"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
