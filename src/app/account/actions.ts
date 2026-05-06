"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authRoutes, signInUrlWithNext } from "@/lib/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function trimOrNull(raw: unknown, maxLen: number): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length === 0 ? null : t.slice(0, maxLen);
}

export async function updateProfileBasicsAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(signInUrlWithNext(authRoutes.account));

  const fullName = trimOrNull(formData.get("full_name"), 200);
  const companyName = trimOrNull(formData.get("company_name"), 200);
  const phone = trimOrNull(formData.get("phone"), 40);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      company_name: companyName,
      phone,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(authRoutes.account);
  redirect(`${authRoutes.account}?success=profile-saved`);
}

export async function updateNotificationPrefsAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(signInUrlWithNext(authRoutes.account));

  const notifyTransactions = formData.get("notify_transactions") === "on";
  const notifyMessages = formData.get("notify_messages") === "on";
  const notifyMarketing = formData.get("notify_marketing") === "on";

  const { error } = await supabase
    .from("profiles")
    .update({
      notify_email_transactions: notifyTransactions,
      notify_email_messages: notifyMessages,
      notify_email_marketing: notifyMarketing,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(authRoutes.account);
  redirect(`${authRoutes.account}?success=notifications-saved`);
}

export async function changePasswordLoggedInAction(formData: FormData) {
  const currentPassword = String(formData.get("current_password") ?? "");
  const nextPassword = String(formData.get("new_password") ?? "");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent("Not signed in.")}`);
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent("Current password is incorrect.")}`);
  }

  if (nextPassword.length < 8) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent("New password must be at least 8 characters.")}`);
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: nextPassword,
  });

  if (updateError) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath(authRoutes.account);
  redirect(`${authRoutes.account}?success=password-changed`);
}

export async function saveAddressAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(signInUrlWithNext(authRoutes.account));

  const existingId = String(formData.get("id") ?? "").trim();
  const label = trimOrNull(formData.get("label"), 120) ?? "Shipping";
  const line1 = trimOrNull(formData.get("line1"), 500);
  const line2 = trimOrNull(formData.get("line2"), 500);
  const city = trimOrNull(formData.get("city"), 120);
  const region = trimOrNull(formData.get("region"), 120);
  const postal = trimOrNull(formData.get("postal_code"), 32);
  const country = trimOrNull(formData.get("country_code"), 2)?.toUpperCase() ?? "US";
  const isDefault = formData.get("is_default") === "on";

  if (!line1) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent("Address line 1 is required.")}`);
  }

  if (isDefault) {
    await supabase.from("user_addresses").update({ is_default: false }).eq("profile_id", user.id);
  }

  if (existingId) {
    const { error } = await supabase
      .from("user_addresses")
      .update({
        label,
        line1,
        line2,
        city,
        region,
        postal_code: postal,
        country_code: country,
        is_default: isDefault,
      })
      .eq("id", existingId)
      .eq("profile_id", user.id);

    if (error) {
      redirect(`${authRoutes.account}?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await supabase.from("user_addresses").insert({
      profile_id: user.id,
      label,
      line1,
      line2,
      city,
      region,
      postal_code: postal,
      country_code: country,
      is_default: isDefault,
    });

    if (error) {
      redirect(`${authRoutes.account}?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath(authRoutes.account);
  redirect(`${authRoutes.account}?success=address-saved`);
}

export async function deleteAddressAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(signInUrlWithNext(authRoutes.account));

  const id = String(formData.get("id") ?? "").trim();

  const { error } = await supabase.from("user_addresses").delete().eq("id", id).eq("profile_id", user.id);

  if (error) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(authRoutes.account);
  redirect(`${authRoutes.account}?success=address-deleted`);
}

export async function setDefaultAddressAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(signInUrlWithNext(authRoutes.account));

  const id = String(formData.get("id") ?? "").trim();

  await supabase.from("user_addresses").update({ is_default: false }).eq("profile_id", user.id);

  const { error } = await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(authRoutes.account);
  redirect(`${authRoutes.account}?success=address-default`);
}

export async function deleteAccountAction(formData: FormData) {
  const confirmEmail = String(formData.get("confirm_email") ?? "").trim();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent("Not signed in.")}`);
  }

  if (confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
    redirect(`${authRoutes.account}?error=${encodeURIComponent("Type your email exactly to confirm closure.")}`);
  }

  try {
    const admin = createServiceRoleSupabaseClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      redirect(`${authRoutes.signIn}?error=${encodeURIComponent(error.message)}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Account deletion is temporarily unavailable.";
    redirect(`${authRoutes.signIn}?error=${encodeURIComponent(msg)}`);
  }

  try {
    await supabase.auth.signOut();
  } catch {
    /* session may already be gone after admin delete */
  }

  redirect(`${authRoutes.signIn}?success=account-deleted`);
}
