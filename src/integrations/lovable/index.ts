// Auth helpers — direct Supabase OAuth (replaces @lovable.dev/cloud-auth-js).
// The exported `lovable` object keeps the same call-site interface so Login.tsx
// requires no changes.

import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

// "lovable" provider removed — it was Lovable-platform SSO only.
type OAuthProvider = "google" | "apple" | "microsoft";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: OAuthProvider, opts?: SignInOptions) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri,
          queryParams: opts?.extraParams,
        },
      });
      return { error: error ?? null };
    },
  },
};
