import Image from "next/image";
import Header from "@/components/Header";

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-sky-50/50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              About Aeroskop
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
              Leading the future of surveillance technology with innovative solutions 
              that combine reliability, affordability, and cutting-edge performance.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-slate-600">
                <p>
                  Founded with a vision to democratize high-quality surveillance technology, 
                  Aeroskop has been at the forefront of innovation in the security industry. 
                  We believe that advanced surveillance solutions should be accessible to 
                  businesses of all sizes.
                </p>
                <p>
                  Our team of engineers and security experts work tirelessly to develop 
                  products that not only meet the highest standards of quality but also 
                  provide exceptional value for money. From small businesses to large 
                  enterprises, we have solutions that scale with your needs.
                </p>
                <p>
                  With offices in Bahrain and Poland, we serve customers globally, 
                  providing end-to-end support and ensuring that our technology works 
                  seamlessly in diverse environments and conditions.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-lg backdrop-blur">
              <Image
                src="https://ext.same-assets.com/2174986154/614244017.webp"
                alt="Aeroskop Team"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white/70 backdrop-blur">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              These core principles guide everything we do and every product we create.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Innovation",
                description: "We continuously push the boundaries of what's possible in surveillance technology, always looking for better, smarter solutions.",
                icon: "https://ext.same-assets.com/2174986154/547085407.svg"
              },
              {
                title: "Reliability",
                description: "Our products are built to last, with rigorous testing and quality control ensuring they perform when you need them most.",
                icon: "https://ext.same-assets.com/2174986154/3286716446.svg"
              },
              {
                title: "Accessibility",
                description: "We believe advanced security shouldn't be a luxury. Our solutions are designed to be both powerful and affordable.",
                icon: "https://ext.same-assets.com/2174986154/1948832421.svg"
              }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="relative h-16 w-16 mx-auto mb-4 rounded-lg bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                  <img src={value.icon} alt="" className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Team</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Meet the experts behind Aeroskop's innovative surveillance solutions.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Engineering Team",
                role: "Product Development",
                description: "Our engineering team combines decades of experience in surveillance technology with fresh perspectives on modern challenges."
              },
              {
                name: "Support Team",
                role: "Customer Success",
                description: "Dedicated professionals who ensure your Aeroskop systems work flawlessly, providing expert guidance and technical support."
              },
              {
                name: "Sales Team",
                role: "Solution Specialists",
                description: "Our sales team understands your unique needs and helps you find the perfect surveillance solution for your business."
              }
            ].map((member, index) => (
              <div key={index} className="text-center p-6 rounded-2xl border border-slate-200 bg-white/70 shadow-lg backdrop-blur">
                <div className="relative h-24 w-24 mx-auto mb-4 rounded-full bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-sky-600">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-sky-600 mb-3">{member.role}</p>
                <p className="text-sm text-slate-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-sky-50 to-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Get Started?</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Aeroskop for their surveillance needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700">
              Contact Us
            </a>
            <a href="/security-cameras" className="rounded-full border border-slate-300 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-800 backdrop-blur hover:bg-white">
              View Products
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
