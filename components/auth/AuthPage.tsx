"use client";

import { useSearchParams } from "next/navigation";
import AuthForm from "./AuthForm";

type AuthPageProps = {
  mode: "login" | "register";
};

export default function AuthPage({ mode }: AuthPageProps) {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "writer" ? "writer" : "reader";

  return (
    <section className="mx-auto flex max-w-6xl justify-center px-5 pb-20 pt-8 sm:px-8 sm:pt-16">
      <AuthForm mode={mode} role={role} />
    </section>
  );
}
