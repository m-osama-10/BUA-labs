import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Page Title</h1>
      <Card className="p-6">
        <p className="text-slate-600">Content will be displayed here.</p>
      </Card>
    </div>
  );
}
