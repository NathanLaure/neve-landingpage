import { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Mot de passe oublié - Névé",
  description: "Recevez un lien pour réinitialiser le mot de passe de votre compte Névé.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordRequest() {
  return <ForgotPasswordClient />;
}
