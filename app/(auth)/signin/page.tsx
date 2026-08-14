import { Metadata } from "next";
import SigninClient from "./SigninClient";

export const metadata: Metadata = {
  title: "Se connecter - Névé",
  description: "Connectez-vous à votre compte Névé pour explorer les randonnées sans voiture.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignIn() {
  return <SigninClient />;
}
