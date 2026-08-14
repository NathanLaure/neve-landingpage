import { Metadata } from "next";
import CallbackClient from "./CallbackClient";

export const metadata: Metadata = {
  title: "Connexion... | Névé",
  description: "Finalisation de votre connexion Névé.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CallbackPage() {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden py-16 md:py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#eb490b]/15 to-orange-200/30 blur-[120px]"
        aria-hidden="true"
      />
      <CallbackClient />
    </section>
  );
}
