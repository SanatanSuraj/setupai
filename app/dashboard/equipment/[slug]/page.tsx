"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDeviceBySlug } from "@/lib/mobilab-devices";
import { Card } from "@/components/dashboard/Card";
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  FileText,
  Layers,
  Mail,
  Phone,
  Globe,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, MouseEvent, TouchEvent } from "react";

export default function DeviceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const device = getDeviceBySlug(slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handlePrev = () => {
    if (!device) return;
    setSelectedImage((prev) => (prev === 0 ? device.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!device) return;
    setSelectedImage((prev) => (prev === device.images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const onSwipeStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onSwipeMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onSwipeEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  if (!device) {
    return (
      <div className="p-6 md:p-8">
        <Link
          href="/dashboard/equipment"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-600 mb-6"
        >
          <ArrowLeft size={16} /> Back to Equipment
        </Link>
        <div className="py-16 text-center">
          <Package size={48} className="text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800">Device not found</h2>
          <p className="text-sm text-slate-500 mt-1">
            The equipment you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/dashboard/equipment"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:underline"
          >
            View all equipment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8 animate-fade-in-up">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/equipment"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Equipment
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{device.name}</h1>
          <p className="text-slate-600 mt-1">{device.shortDescription}</p>
          {device.manufacturer && (
            <p className="text-xs text-slate-500 mt-2">by {device.manufacturer}</p>
          )}
        </div>
        {device.price && (
          <div className="shrink-0 px-4 py-2 rounded-xl bg-violet-50 border border-violet-100">
            <p className="text-lg font-bold text-violet-700">{device.price}</p>
            {device.priceNote && (
              <p className="text-xs text-slate-500 mt-0.5">{device.priceNote}</p>
            )}
          </div>
        )}
      </div>

      {/* Image gallery */}
      <Card padding="none" className="overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
          {/* Thumbnails - Left on Desktop, Bottom on Mobile */}
          {device.images.length > 1 && (
            <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:w-20 lg:w-24 shrink-0 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {device.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square w-16 md:w-full shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? "border-violet-600 ring-2 ring-violet-600/20"
                      : "border-slate-200 hover:border-violet-300"
                  }`}
                  aria-label={`Select image ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${device.name} thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 64px, 96px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative flex-1 order-1 md:order-2 group">
            <div
              ref={imageRef}
              className={`relative aspect-square md:aspect-[4/3] w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden ${
                device.images.length > 0 ? "md:cursor-zoom-in" : ""
              }`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={onSwipeStart}
              onTouchMove={onSwipeMove}
              onTouchEnd={onSwipeEnd}
            >
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-6">
                <Package size={64} className="text-slate-200" />
                <span className="text-sm text-slate-400 mt-2">No image available</span>
              </div>
              
              {device.images?.[selectedImage] && (
                <Image
                  src={device.images[selectedImage]}
                  alt={device.name}
                  fill
                  priority
                  className={`absolute inset-0 z-10 w-full h-full transition-transform duration-200 bg-white ${
                    isZoomed ? "md:object-cover md:scale-[1.5] object-contain" : "object-contain"
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                        }
                      : { transformOrigin: "center center" }
                  }
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              )}
            </div>

            {/* Navigation Arrows */}
            {device.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur shadow-md border border-slate-200 text-slate-700 hover:bg-white hover:text-violet-600 transition-all opacity-0 md:group-hover:opacity-100 focus:opacity-100 hover:scale-105"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="ml-[-1px]" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur shadow-md border border-slate-200 text-slate-700 hover:bg-white hover:text-violet-600 transition-all opacity-0 md:group-hover:opacity-100 focus:opacity-100 hover:scale-105"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="mr-[-1px]" />
                </button>
              </>
            )}
            
            {/* Image Indicator / Dots for Mobile */}
            {device.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:hidden">
                {device.images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      selectedImage === i ? "w-4 bg-violet-600" : "w-1.5 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card title="Description" icon={FileText}>
            <p className="text-sm text-slate-700 leading-relaxed">{device.description}</p>
          </Card>

          {/* Features */}
          {device.features?.length > 0 && (
            <Card title="Features" icon={Layers}>
              <ul className="space-y-2">
                {device.features.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-violet-500 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Components */}
          {device.components?.length > 0 && (
            <Card title="Components & Overview" icon={Wrench}>
              <div className="space-y-4">
                {device.components.map((c, i) => (
                  <div key={i} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-slate-800 text-sm">{c.name}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Support */}
          {device.support && (
            <Card title="Support & Contact" icon={Mail}>
              <div className="flex flex-wrap gap-4">
                <a
                  href={`mailto:${device.support.email}`}
                  className="flex items-center gap-2 text-sm text-violet-600 hover:underline"
                >
                  <Mail size={14} /> {device.support.email}
                </a>
                <a
                  href={`tel:${device.support.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-2 text-sm text-violet-600 hover:underline"
                >
                  <Phone size={14} /> {device.support.phone}
                </a>
                <a
                  href={`https://${device.support.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-violet-600 hover:underline"
                >
                  <Globe size={14} /> {device.support.website}
                </a>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Certifications */}
          {device.certifications?.length > 0 && (
            <Card title="Certifications" icon={ShieldCheck}>
              <div className="flex flex-wrap gap-2">
                {device.certifications.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Technical specifications */}
          <Card title="Technical Specifications" icon={Package}>
            <dl className="space-y-3">
              {Object.entries(device.specifications).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="text-xs font-medium text-slate-500">{key}</dt>
                  <dd className="text-sm font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* CTA */}
          <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
            <p className="text-sm font-semibold text-slate-800">Interested in this device?</p>
            <p className="text-xs text-slate-600 mt-1">
              Contact Mobilab for pricing and availability.
            </p>
            <a
              href="mailto:support@mobilab.in"
              className="mt-3 inline-block w-full text-center py-2 rounded-lg bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors"
            >
              Get a Quote
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
