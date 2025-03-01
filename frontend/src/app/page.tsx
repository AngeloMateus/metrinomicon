"use client";

import SignInForm from "@/components/pages/signinForm";
import { GiBlackBook } from "react-icons/gi";

export default function Login() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-10 md:p-24">
      <div className="flex flex-row gap-2">
        <GiBlackBook size={39} />
        <h1 className={`mb-12 text-4xl font-semibold`}>Metrinomicon</h1>
      </div>
      <SignInForm />
    </main>
  );
}
