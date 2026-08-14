import { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Créer un compte - Névé",
  description:
    "Créez votre compte Névé pour explorer les randonnées sans voiture. La planification complète se fait ensuite dans l'app.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUp() {
  return <SignupClient />;
}
