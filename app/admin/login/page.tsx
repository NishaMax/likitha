import Link from "next/link";
import AdminLoginForm from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-serif text-2xl tracking-tight text-[#e8ecf4]">likitha<span className="text-[#c8a96e]">.</span></Link>
        <section className="mt-20">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c8a96e]">Restricted access</p>
          <h1 className="mt-4 font-serif text-4xl text-[#e8ecf4]">Admin sign in</h1>
          <p className="mt-3 text-sm leading-7 text-[#9ba5c0]">This area is only for provisioned Likitha administrators.</p>
          <AdminLoginForm />
        </section>
      </div>
    </main>
  );
}
