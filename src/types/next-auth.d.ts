// ============================================================
// TYPE AUGMENTATION: next-auth
// Extends the built-in Session and JWT types with our custom
// fields (discordId, role, isLinked) so TypeScript knows about
// them everywhere in the app instead of showing "any" errors.
// ============================================================

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      // Built-in fields
      name?:  string | null;
      email?: string | null;
      image?: string | null;
      // Our custom fields
      discordId: string;
      role:      "MEMBER" | "VIP" | "ADMIN" | "OWNER" | "DEVELOPER" | "MODERATOR";
      isLinked:  boolean;
    };
  }

  /** Extends the Profile returned by Discord OAuth */
  interface Profile {
    id:            string;
    username:      string;
    discriminator: string;
    avatar:        string | null;
    verified?:     boolean;
    email?:        string;
    flags?:        number;
    premium_type?: number;
    public_flags?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string;
    role?:      string;
    isLinked?:  boolean;
  }
}
