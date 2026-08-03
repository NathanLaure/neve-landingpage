import { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe | Névé",
  description: "Choisissez un nouveau mot de passe pour votre compte Névé et reprenez la préparation de vos randonnées outdoor sans voiture.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden py-16 md:py-24">
      {/* Background gradients */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#eb490b]/15 to-orange-200/30 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-10 right-10 -z-10 h-72 w-72 rounded-full bg-amber-100/40 blur-[90px]"
        aria-hidden="true"
      />

      <ResetPasswordClient />
    </section>
  );
}
