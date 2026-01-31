import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, FileUp, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ImportExportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Download CSV file
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Use queries for data fetching (they're read-only)
  const exportDevices = trpc.importExport.exportDevices.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      setMessage({
        type: "success",
        text: "تم تصدير بيانات الأجهزة بنجاح",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ في التصدير: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const exportFaculties = trpc.importExport.exportFaculties.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      setMessage({
        type: "success",
        text: "تم تصدير بيانات الكليات بنجاح",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ في التصدير: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const exportDepartments = trpc.importExport.exportDepartments.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      setMessage({
        type: "success",
        text: "تم تصدير بيانات الأقسام بنجاح",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ في التصدير: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const exportLaboratories = trpc.importExport.exportLaboratories.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      setMessage({
        type: "success",
        text: "تم تصدير بيانات المختبرات بنجاح",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ في التصدير: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const exportTransfers = trpc.importExport.exportTransfers.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      setMessage({
        type: "success",
        text: "تم تصدير بيانات التحويلات بنجاح",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ في التصدير: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const exportMaintenance = trpc.importExport.exportMaintenance.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      setMessage({
        type: "success",
        text: "تم تصدير بيانات الصيانة بنجاح",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ في التصدير: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const exportAuditLogs = trpc.importExport.exportAuditLogs.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      setMessage({
        type: "success",
        text: "تم تصدير السجلات بنجاح",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ في التصدير: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const exportAll = trpc.importExport.exportAll.useMutation({
    onSuccess: (data) => {
      Object.entries(data.exports).forEach(([name, content]) => {
        downloadCSV(content, `${name}-${data.timestamp}.csv`);
      });
      setMessage({
        type: "success",
        text: "تم تصدير جميع البيانات بنجاح",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ في التصدير: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const importDevicesMutation = trpc.importExport.importDevices.useMutation({
    onSuccess: (result) => {
      setMessage({
        type: "success",
        text: `تم استيراد ${result.imported} سجل بنجاح! تم تخطي ${result.skipped} سجل.`,
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: `خطأ: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const fileContent = await file.text();
      await importDevicesMutation.mutateAsync({ csvContent: fileContent });
    } catch (error) {
      setMessage({
        type: "error",
        text: `خطأ في قراءة الملف: ${String(error)}`,
      });
      setIsLoading(false);
    }
    event.target.value = "";
  };

  const handleExport = (type: "devices" | "faculties" | "departments" | "laboratories" | "transfers" | "maintenance" | "auditLogs" | "all") => {
    setIsLoading(true);
    setMessage(null);

    switch (type) {
      case "devices":
        exportDevices.mutate();
        break;
      case "faculties":
        exportFaculties.mutate();
        break;
      case "departments":
        exportDepartments.mutate();
        break;
      case "laboratories":
        exportLaboratories.mutate();
        break;
      case "transfers":
        exportTransfers.mutate();
        break;
      case "maintenance":
        exportMaintenance.mutate();
        break;
      case "auditLogs":
        exportAuditLogs.mutate();
        break;
      case "all":
        exportAll.mutate();
        break;
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">استيراد وتصدير البيانات</h1>
        <p className="text-slate-600 mt-2">استورد وصدر بيانات النظام بصيغة CSV</p>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <div className="flex gap-2">
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Export Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير البيانات
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              onClick={() => handleExport("devices")}
              disabled={isLoading}
              variant="outline"
              className="justify-center"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير الأجهزة
            </Button>
            <Button
              onClick={() => handleExport("faculties")}
              disabled={isLoading}
              variant="outline"
              className="justify-center"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير الكليات
            </Button>
            <Button
              onClick={() => handleExport("departments")}
              disabled={isLoading}
              variant="outline"
              className="justify-center"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير الأقسام
            </Button>
            <Button
              onClick={() => handleExport("laboratories")}
              disabled={isLoading}
              variant="outline"
              className="justify-center"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير المختبرات
            </Button>
            <Button
              onClick={() => handleExport("transfers")}
              disabled={isLoading}
              variant="outline"
              className="justify-center"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير التحويلات
            </Button>
            <Button
              onClick={() => handleExport("maintenance")}
              disabled={isLoading}
              variant="outline"
              className="justify-center"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير الصيانة
            </Button>
            <Button
              onClick={() => handleExport("auditLogs")}
              disabled={isLoading}
              variant="outline"
              className="justify-center"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير السجلات
            </Button>
            <Button
              onClick={() => handleExport("all")}
              disabled={isLoading}
              variant="default"
              className="justify-center md:col-span-2 lg:col-span-1"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير الكل
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="text-blue-800">
              💡 <strong>نصيحة:</strong> يمكنك تصدير بيانات محددة أو تصدير جميع البيانات دفعة واحدة
            </p>
          </div>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            استيراد البيانات
          </h2>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <FileUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
              <Button
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? "جاري الاستيراد..." : "اختر ملف CSV"}
              </Button>
            </label>
            <p className="text-slate-600 text-sm mt-2">
              اختر ملف CSV يحتوي على معلومات الأجهزة
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">صيغة الملف المتوقعة:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>deviceId</strong>: معرف الجهاز الفريد</li>
              <li>• <strong>name</strong>: اسم الجهاز (مطلوب)</li>
              <li>• <strong>brand</strong>: الماركة</li>
              <li>• <strong>category</strong>: نوع الجهاز (مطلوب)</li>
              <li>• <strong>laboratoryId</strong>: معرف المختبر</li>
              <li>• <strong>departmentId</strong>: معرف القسم</li>
              <li>• <strong>facultyId</strong>: معرف الكلية</li>
              <li>• <strong>purchaseDate</strong>: تاريخ الشراء (YYYY-MM-DD)</li>
              <li>• <strong>purchasePrice</strong>: سعر الشراء</li>
              <li>• <strong>expectedLifetimeYears</strong>: العمر المتوقع (بالسنوات)</li>
              <li>• <strong>currentStatus</strong>: الحالة (working/under_maintenance/out_of_service)</li>
              <li>• <strong>notes</strong>: ملاحظات</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
            <p className="text-amber-800">
              ⚠️ <strong>تنبيه:</strong> سيتم تخطي الأجهزة التي توجد بالفعل في النظام (بناءً على deviceId)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
