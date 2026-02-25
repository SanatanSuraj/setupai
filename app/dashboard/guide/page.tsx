import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { FileCheck, Map, ShieldCheck, Users, AlertCircle } from "lucide-react";

export default function GuidePage() {
  return (
    <div className="space-y-8 p-6 md:p-8 max-w-5xl mx-auto">
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <Badge variant="purple">Pan-India Regulatory Guide v2.0</Badge>
          <h2 className="text-4xl md:text-5xl font-black mt-6 tracking-tight leading-tight">
            Diagnostic Lab
            <br />
            Setup Roadmap
          </h2>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl font-medium leading-relaxed">
            National framework for establishing medical laboratories in India, aligned with the Clinical Establishment Act 2010 and ISO 15189:2022 standards.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] -mr-48 -mt-48 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="1. Legal & Regulatory" icon={FileCheck}>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">01</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Clinical Establishment Act (CEA)</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  National framework for minimum standards. Applied via District CMO. Required in most states (Delhi, UP, Rajasthan, etc.).
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">02</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">BMW Authorization (Rules 2016)</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Non-negotiable. Mandatory contract with CBWTF. Bi-annual reports to State Pollution Control Board.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">03</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Tax & Business Compliance</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  GST registration (Diagnostic services), Shop & Est Act, and Professional Tax enrollment for staff.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="2. Mandatory Infrastructure" icon={Map}>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Min Space Requirement</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">200-250 sq ft</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Optimum Temp</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">20°C - 25°C</p>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Critical Zones Layout:</p>
            <div className="grid grid-cols-2 gap-2">
              {["Phlebotomy Room (Privacy)", "Sample Processing Lab", "BMW Storage (Lockable)", "Patient Waiting Area"].map((zone) => (
                <div key={zone} className="p-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {zone}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="3. BMW Color Coding (National)" icon={ShieldCheck}>
          <div className="grid grid-cols-1 gap-3">
            {[
              { c: "Yellow", t: "Infectious", d: "Human tissue, soiled cotton, anatomical waste." },
              { c: "Red", t: "Contaminated", d: "Recyclable plastic, gloves, tubing, IV sets." },
              { c: "Blue", t: "Glassware", d: "Vials, broken glass, metallic implants." },
              { c: "White", t: "Sharps", d: "Needles, blades, scalpels (Puncture Proof)." },
            ].map((item) => (
              <div key={item.c} className="flex items-center gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div
                  className={`w-8 h-8 rounded-full shadow-inner border-2 border-white ${
                    item.c === "Yellow" ? "bg-yellow-500" : item.c === "Red" ? "bg-red-500" : item.c === "Blue" ? "bg-blue-500" : "bg-white border-slate-300"
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {item.c}: {item.t}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="4. Professional Staffing" icon={Users}>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <p className="text-sm font-bold text-blue-800">Pathologist (MD/DNB/DCP)</p>
              <p className="text-xs text-blue-600/80 mt-1 leading-relaxed">
                Mandatory signatory authority. Must have valid MCI/NMC State Medical Council registration.
              </p>
            </div>
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
              <p className="text-sm font-bold text-emerald-800">Technicians (DMLT/BMLT)</p>
              <p className="text-xs text-emerald-600/80 mt-1 leading-relaxed">
                Minimum 2 qualified technicians for 400 samples/day. Expertise in pre-analytical variables required.
              </p>
            </div>
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold leading-tight uppercase tracking-wider">
                Health Compliance: All staff must complete Hepatitis-B 3-dose series & regular health checks.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
