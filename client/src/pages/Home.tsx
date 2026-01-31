import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { QrCode, Package, Wrench, BarChart3, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/bua-logo.png" alt="BUA Logo" className="h-14 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">BUA Asset Management</h1>
              <p className="text-sm text-slate-600">Smart Unit for Lab Equipment Management</p>
            </div>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <img src="/images/bua-logo.png" alt="BUA Logo" className="h-24 w-auto mx-auto mb-8 drop-shadow-lg" />
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Comprehensive Asset Management for University Equipment
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Track, manage, and maintain laboratory equipment across faculties and departments with ease.
            Real-time QR codes, transfer history, maintenance scheduling, and depreciation tracking.
          </p>
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h3 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Key Features
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition">
              <QrCode className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold text-slate-900 mb-2">QR Code System</h4>
              <p className="text-slate-600">
                Each device gets a unique, immutable QR code for instant access to device information.
                Public read-only pages update dynamically as device data changes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition">
              <Package className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Device Management</h4>
              <p className="text-slate-600">
                Comprehensive tracking of devices with immutable IDs, categories, locations, purchase
                information, and current status across all faculties and laboratories.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition">
              <Wrench className="w-12 h-12 text-orange-600 mb-4" />
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Maintenance Tracking</h4>
              <p className="text-slate-600">
                Schedule periodic and emergency maintenance, track technician assignments, record costs,
                and maintain complete maintenance history for every device.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition">
              <BarChart3 className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Analytics & Reports</h4>
              <p className="text-slate-600">
                View comprehensive dashboards with KPIs, depreciation analysis, maintenance insights,
                and LLM-powered natural language reporting capabilities.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition">
              <Shield className="w-12 h-12 text-red-600 mb-4" />
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Role-Based Access</h4>
              <p className="text-slate-600">
                Four distinct roles (Admin, Unit Manager, Technician, User) with granular permissions.
                Complete audit trails for all changes and transfers.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition">
              <Package className="w-12 h-12 text-indigo-600 mb-4" />
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Excel Integration</h4>
              <p className="text-slate-600">
                Import bulk devices, transfers, and maintenance records from Excel. Export lists and
                history for reporting and analysis with full validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-3xl font-bold mb-6">
            Ready to streamline your asset management?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Sign in with your Manus account to access the complete asset management system.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => window.location.href = "/login"}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-slate-400">
            © 2026 Badr University in Assiut - Smart Unit for Lab Equipment Management
          </p>
        </div>
      </footer>
    </div>
  );
}
