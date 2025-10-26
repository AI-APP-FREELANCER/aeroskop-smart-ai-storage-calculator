"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? "backdrop-blur bg-slate-900/90 shadow-sm"
          : "bg-slate-900/70 backdrop-blur-md"
      }`}
    >
      <div className="container flex items-center gap-6 py-3" role="navigation" aria-label="Primary">
        <Link href="/" className="flex items-center gap-3" aria-label="Aeroskop home">
          <Image
            src="https://ext.same-assets.com/2174986154/2796273073.svg"
            alt="Aeroskop"
            width={135}
            height={135}
            priority
            style={{ width: 'auto', height: 'auto' }}
          />
          <span className="sr-only">Aeroskop</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setOpenProducts(true)}
            onMouseLeave={() => setOpenProducts(false)}
          >
            <button
              className="text-sm font-medium text-white hover:text-blue-200 focus:outline-none"
              aria-haspopup="menu"
              aria-expanded={openProducts}
            >
              Products
            </button>
            {openProducts && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                <div className="grid w-[920px] grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur">
                  {[
                    {
                      href: "/security-cameras",
                      title: "Security Cameras",
                      desc:
                        "Dome, bullet and panoramic cameras for indoor/outdoor surveillance.",
                      img: "https://ext.same-assets.com/2174986154/1009581275.webp",
                    },
                    {
                      href: "/nvr",
                      title: "Aeroflex NVR",
                      desc:
                        "Reliable recording, playback and integration with various IP cameras.",
                      img: "https://ext.same-assets.com/2174986154/2604941144.webp",
                    },
                    {
                      href: "/poeswitches",
                      title: "PoE Switches",
                      desc:
                        "High‑performance power delivery with seamless integration.",
                      img: "https://ext.same-assets.com/2174986154/2189941613.webp",
                    },
                    {
                      href: "/rhinoservers",
                      title: "Rhino Storage Servers",
                      desc:
                        "Scalable storage built for demanding surveillance workloads.",
                      img: "https://ext.same-assets.com/2174986154/303750571.webp",
                    },
                    {
                      href: "/core-switches",
                      title: "Core Switches",
                      desc:
                        "High‑performance core switching with 10G uplinks.",
                      img: "https://ext.same-assets.com/2174986154/3786522156.webp",
                    },
                    {
                      href: "/workstations",
                      title: "Workstations",
                      desc:
                        "Powerful systems for VMS, control rooms and AI workloads.",
                      img: "https://ext.same-assets.com/2174986154/1190281012.webp",
                    },
                    {
                      href: "/strak-vms",
                      title: "Strak VMS",
                      desc:
                        "End‑to‑end video management software platform.",
                      img: "https://ext.same-assets.com/2174986154/2801051794.svg",
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-4 rounded-lg p-3 hover:bg-slate-50"
                    >
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenAdmin(true)}
            onMouseLeave={() => setOpenAdmin(false)}
          >
            <button
              className="text-sm font-medium text-white hover:text-blue-200 focus:outline-none"
              aria-haspopup="menu"
              aria-expanded={openAdmin}
            >
              Admin
            </button>
            {openAdmin && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                <div className="w-64 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur">
                  <div className="space-y-2">
                    {[
                      {
                        href: "/admin",
                        title: "Dashboard",
                        desc: "Overview of key metrics and system health"
                      },
                      {
                        href: "/admin/analytics",
                        title: "Analytics",
                        desc: "Detailed user analytics and behavior tracking"
                      },
                      {
                        href: "/admin/monitoring",
                        title: "Monitoring",
                        desc: "Page analytics, click streams, and AI usage"
                      }
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex flex-col rounded-lg p-3 hover:bg-slate-50"
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/about"
            className="text-sm font-medium text-white hover:text-blue-200"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-white hover:text-blue-200"
          >
            Contact
          </Link>
          
          {/* AI Calculator Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/unified-calculator"
              className="text-sm font-medium text-white hover:text-blue-200 px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
            >
              AI Calculator
            </Link>
            <Link
              href="/enhanced-calculator"
              className="text-sm font-medium text-white hover:text-blue-200 px-3 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 transition-colors"
            >
              Enhanced Calculator
            </Link>
          </div>
          
          {/* Sample Pages Navigation */}
          <div className="flex items-center gap-2">
            <Link
              href="/sample2"
              className="text-sm font-medium text-white hover:text-blue-200 px-2 py-1 rounded"
            >
              Sample 2
            </Link>
            <Link
              href="/sample3"
              className="text-sm font-medium text-white hover:text-blue-200 px-2 py-1 rounded"
            >
              Sample 3
            </Link>
            <Link
              href="/sample4"
              className="text-sm font-medium text-white hover:text-blue-200 px-2 py-1 rounded"
            >
              Sample 4
            </Link>
          </div>
          <Link
            href="https://wa.me/+97377992203"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            Enquire Now
          </Link>
        </nav>

        <div className="ml-auto md:hidden flex gap-2">
          {/* mobile menu buttons */}
          <Link
            href="/contact"
            className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
}
