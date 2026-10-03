import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { encryptText, decryptText } from "@/lib/crypto";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

  if (errorParam) {
    console.error("Erreur reçue de Supabase OAuth :", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Code_autorisation_manquant`);
  }

  const clientId =
    process.env.SUPABASE_OAUTH_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SUPABASE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.SUPABASE_OAUTH_CLIENT_SECRET;

  try {
    const supabase = await createClient();
    const {
      data: { user: existingSessionUser },
    } = await supabase.auth.getUser();

    // 1. Échange du code OAuth avec l'API Supabase Management
    if (clientId && clientSecret) {
      const redirectUri = `${origin}/auth/callback`;

      const tokenRes = await fetch("https://api.supabase.com/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const errorBody = await tokenRes.text();
        console.error("Échec de l'échange OAuth token :", errorBody);
        return NextResponse.redirect(
          `${origin}/login?error=Echec_recuperation_token`
        );
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return NextResponse.redirect(
          `${origin}/login?error=Token_acces_introuvable`
        );
      }

      // 2. Récupération du profil Supabase et organisations
      let userEmail = "";
      let userName = "";
      let supabaseUserId = "";
      let avatarUrl = "";

      try {
        const profileRes = await fetch("https://api.supabase.com/v1/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          userEmail = profileData.primary_email || profileData.email || "";
          userName = profileData.username || profileData.first_name || profileData.last_name || "";
          supabaseUserId = profileData.id || "";
          avatarUrl = profileData.avatar_url || "";
        }
      } catch (err) {
        console.warn("Impossible de récupérer /v1/profile:", err);
      }

      // Si pas de nom ou email, on tente les organisations
      let orgName = "";
      try {
        const orgsRes = await fetch("https://api.supabase.com/v1/organizations", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });
        if (orgsRes.ok) {
          const orgs = await orgsRes.json();
          if (Array.isArray(orgs) && orgs.length > 0) {
            orgName = orgs[0].name || "";
          }
        }
      } catch (err) {
        console.warn("Impossible de récupérer /v1/organizations:", err);
      }

      if (!userName && orgName) {
        userName = orgName;
      }

      if (!userEmail) {
        userEmail = `supabase-${supabaseUserId ? supabaseUserId.slice(0, 8) : accessToken.slice(-8)}@supahub.dev`;
      }

      // 3. Gestion de la session et des tokens
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (serviceRoleKey && supabaseUrl) {
        const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        let targetUserId = existingSessionUser?.id;

        if (!targetUserId) {
          // Recherche ou création de l'utilisateur dans auth.users
          const { data: userList } = await adminClient.auth.admin.listUsers();
          let appUser = userList?.users?.find(
            (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
          );

          const metadata = {
            supabase_oauth: true,
            supabase_user_id: supabaseUserId,
            full_name: userName || orgName || "Membre Supabase",
            name: userName || orgName || "Membre Supabase",
            username: userName || orgName || "Membre Supabase",
            avatar_url: avatarUrl || undefined,
          };

          if (!appUser) {
            const { data: created, error: createError } =
              await adminClient.auth.admin.createUser({
                email: userEmail,
                email_confirm: true,
                user_metadata: metadata,
              });

            if (!createError && created?.user) {
              appUser = created.user;
            }
          } else {
            await adminClient.auth.admin.updateUserById(appUser.id, {
              user_metadata: {
                ...appUser.user_metadata,
                ...metadata,
              },
            });
          }

          if (appUser) {
            targetUserId = appUser.id;

            // Génération du lien de session instantané
            const { data: linkData } =
              await adminClient.auth.admin.generateLink({
                type: "magiclink",
                email: userEmail,
              });

            if (linkData?.properties?.hashed_token) {
              await supabase.auth.verifyOtp({
                token_hash: linkData.properties.hashed_token,
                type: "magiclink",
              });
            }
          }
        }

        // 4. Enregistrement / Fusion des tokens d'organisations
        if (targetUserId) {
          const { data: profile } = await adminClient
            .from("user_profiles")
            .select("supabase_pat_encrypted")
            .eq("id", targetUserId)
            .single();

          let tokensList: string[] = [];
          if (profile?.supabase_pat_encrypted) {
            try {
              const decrypted = decryptText(profile.supabase_pat_encrypted);
              const parsed = JSON.parse(decrypted);
              if (Array.isArray(parsed)) {
                tokensList = parsed;
              } else {
                tokensList = [decrypted];
              }
            } catch {
              try {
                const decrypted = decryptText(profile.supabase_pat_encrypted);
                tokensList = [decrypted];
              } catch {}
            }
          }

          if (!tokensList.includes(accessToken)) {
            tokensList.push(accessToken);
          }

          const encryptedTokens = encryptText(JSON.stringify(tokensList));
          const { error: upsertErr } = await adminClient.from("user_profiles").upsert(
            {
              id: targetUserId,
              supabase_pat_encrypted: encryptedTokens,
              plan: "FREE", // valeur par défaut pour les nouvelles lignes
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id", ignoreDuplicates: false }
          );
          if (upsertErr) {
            console.error("Erreur upsert user_profiles (OAuth callback) :", upsertErr.message);
          }
        }
      }
    }

    // Redirection vers le Dashboard avec toutes les organisations liées
    return NextResponse.redirect(`${origin}/dashboard/projets`);
  } catch (err: any) {
    console.error("Erreur critique callback OAuth :", err);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(err?.message || "Erreur_inattendue")}`
    );
  }
}
