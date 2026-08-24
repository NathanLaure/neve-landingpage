import { NextResponse, type NextRequest } from "next/server";

const APEX_HOST = "neve-rando.fr";
const CANONICAL_HOST = "www.neve-rando.fr";

/**
 * Canonicalisation sur `www`, sauf sous `/.well-known/`.
 *
 * La redirection de l'apex vivait au niveau du domaine chez Vercel, donc avant
 * tout routage : `/.well-known/assetlinks.json` répondait 308 sur l'apex comme
 * sur le reste. Or Android ne suit pas les redirections quand il va vérifier un
 * lien d'application — l'apex ne pouvait donc pas être vérifié, et un lien de
 * partage qui le porte ouvre le navigateur au lieu de l'app.
 *
 * En ramenant la redirection ici, les pages restent canoniques sur `www` et le
 * fichier de vérification se sert tel quel sur les deux hôtes.
 *
 * Suppose que l'apex est rattaché au projet sans redirection dans les réglages
 * Vercel : tant qu'elle y est configurée, elle s'applique avant ce fichier et
 * rien de tout ceci ne s'exécute.
 */
export function middleware(request: NextRequest) {
  /* Servi tel quel sur les deux hôtes : c'est tout l'objet du contournement. */
  if (request.nextUrl.pathname.startsWith("/.well-known/")) {
    return NextResponse.next();
  }

  if (request.headers.get("host") !== APEX_HOST) {
    return NextResponse.next();
  }

  const target = request.nextUrl.clone();
  target.protocol = "https";
  target.host = CANONICAL_HOST;
  target.port = "";

  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
