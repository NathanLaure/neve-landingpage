import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Mon Profil - Névé",
  description: "Gérez votre compte Névé, vos abonnements de transport et vos préférences de randonnée.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
