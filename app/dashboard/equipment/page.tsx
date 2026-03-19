"use client";

import Link from "next/link";
import { Card } from "@/components/dashboard/Card";
import { Package, ChevronRight } from "lucide-react";
import { MOBILAB_DEVICES } from "@/lib/mobilab-devices";

export default function EquipmentPage() {
  return (
    <div className="space-y-6 p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-100 rounded-xl text-violet-600">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Equipment &amp; Infrastructure</h1>
            <p className="text-sm text-gray-500 mt-0.5">Explore our range of Mobilab devices</p>
          </div>
        </div>
      </div>

      {/* Mobilab Equipment Showcase */}
      <Card title="Mobilab Devices" subtitle="Our suite of portable diagnostic equipment" icon={Package}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          {MOBILAB_DEVICES.map((device) => (
            <Link 
              key={device.id} 
              href={`/dashboard/equipment/${device.slug}`}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-violet-300 hover:shadow-md transition-all group"
            >
              <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                {device.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={device.images[0]} 
                    alt={device.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Package size={48} className="text-slate-200" />
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-800 text-base">{device.name}</h3>
                <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">
                  {device.shortDescription}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-md">
                    View Details
                  </span>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
