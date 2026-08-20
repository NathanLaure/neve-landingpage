"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function SignupClient() {
  const router = useRouter();
  const { user, isAuthLoading, openAuthModal } = useAuth() as any;

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        router.replace("/explorer");
      } else {
        router.replace("/");
        openAuthModal({ initialStep: "entry" });
      }
    }
  }, [isAuthLoading, user, router, openAuthModal]);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#EB490B]" />
      <p className="text-sm font-medium text-gray-500">Chargement de l'inscription...</p>
    </div>
  );
}
