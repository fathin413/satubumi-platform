import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white relative overflow-hidden">
      
      {/* Dekorasi Alami yang Halus (Bukan Neon) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand & Deskripsi */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center border border-emerald-800">
                <span className="text-emerald-400 text-lg font-bold">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Satubumi<span className="text-emerald-400">.</span></span>
            </div>
            <p className="text-emerald-100/60 text-[15.5px] leading-relaxed max-w-sm">
              Bridging science, nature, communities, and business to create
              measurable climate and sustainability impacts.
            </p>
          </div>

          {/* Links - Efek panah Emerald saat hover */}
          <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
            <h4 className="text-[13px] font-bold tracking-[0.15em] uppercase mb-6 text-emerald-100/40">
              Navigate
            </h4>
            <ul className="space-y-4">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/services", label: "Services" },
                { href: "/products", label: "Rapid-FS Tool" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[15px] font-medium text-emerald-100/60 hover:text-white transition-all flex items-center gap-2 group"
                  >
                    <span className="h-px w-0 bg-emerald-400 transition-all duration-300 group-hover:w-4"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-[13px] font-bold tracking-[0.15em] uppercase mb-6 text-emerald-100/40">
              Contact Us
            </h4>
            <ul className="space-y-4 text-[15px] font-medium text-emerald-100/60">
              <li className="hover:text-white transition-colors cursor-pointer">
                info@satubumi.org
              </li>
              <li className="leading-relaxed">
                Jakarta, Indonesia<br />
                <span className="text-emerald-100/40 text-sm">Headquarters</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-20 pt-8 border-t border-emerald-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-emerald-100/40 font-medium">
            © {new Date().getFullYear()} Satubumi.org. All rights reserved.
          </p>
          <div className="flex gap-6 text-[13px] text-emerald-100/40 font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}