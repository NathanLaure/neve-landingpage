// Mirrors the error translations used by the Névé mobile app (context/AuthContext.tsx)
// so users get the same French messages whether they sign up on web or in the app.
export function translateAuthError(error: unknown): string {
  if (!error) return "";

  let msg = "";
  if (typeof error === "string") {
    msg = error;
  } else if (error instanceof Error) {
    msg = error.message;
  } else if (typeof error === "object" && error !== null) {
    const err = error as { message?: string; error_description?: string; status?: number };
    if (err.status === 500) {
      return "Erreur serveur. Veuillez réessayer dans un instant.";
    }
    msg = err.message || err.error_description || JSON.stringify(error);
  } else {
    msg = String(error);
  }

  if (
    msg.includes("535") ||
    msg.includes("5.7.0") ||
    msg.includes("unexpected_failure") ||
    msg.includes('"status":500')
  ) {
    return "Erreur d'envoi d'e-mail par le serveur. Veuillez réessayer dans un instant.";
  }
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (msg.includes("User already registered") || msg.includes("user_already_exists")) {
    return "Un compte existe déjà avec cette adresse e-mail.";
  }
  if (
    msg.toLowerCase().includes("password should") ||
    msg.toLowerCase().includes("password must") ||
    msg.toLowerCase().includes("weak_password")
  ) {
    return "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.";
  }
  if (msg.includes("Rate limit exceeded") || msg.includes("over_email_send_rate_limit")) {
    return "Trop de tentatives. Veuillez patienter un instant avant de réessayer.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Veuillez confirmer votre adresse e-mail avant de vous connecter.";
  }
  if (msg.includes("Unable to validate email address")) {
    return "Adresse e-mail invalide.";
  }

  return msg;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
