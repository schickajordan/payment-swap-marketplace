import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ListingMediaUploader } from "@/components/listings/listing-media-uploader";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/authorization";
import { appRoutes } from "@/lib/navigation";
import { getListingAssetsMapByListingIds } from "@/lib/listings/assets";
import { dealTemplateLabel } from "@/lib/listings/deal-template";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MediaPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function ListingMediaPage({ params, searchParams }: MediaPageProps) {
  const { user, role } = await requireRole(["seller", "admin"]);
  const { id } = await params;
  const sp = await searchParams;

  const supabase = await createServerSupabaseClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, title, seller_id, status, deal_template, collateral_is_titled")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const isSellerOwner = listing.seller_id === user.id;

  if (!isSellerOwner && role !== "admin") {
    redirect(appRoutes.unauthorized);
  }

  const assetsMap = await getListingAssetsMapByListingIds([listing.id]);
  const assets = assetsMap.get(listing.id) ?? [];

  return (
    <DashboardShell
      title={`Media · ${listing.title}`}
      subtitle="Upload imagery and videos. Files are stored securely and linked to your listing."
    >
      <Link href="/seller" className="text-sm text-gold hover:text-[#ffd14d]">
        ← Seller dashboard
      </Link>

      {sp.error ? (
        <p className="mt-4 rounded-md border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-200">
          {sp.error}
        </p>
      ) : null}
      {sp.success === "asset-registered" ? (
        <p className="mt-4 rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2 text-sm text-emerald-200">
          Assets saved successfully.
        </p>
      ) : null}

      <section className="mt-6 rounded-xl border border-white/10 bg-card p-5">
        <h2 className="text-lg font-semibold text-white">Upload media</h2>
        <p className="mt-1 text-sm text-slate-400">
          Listing ID {listing.id} · Status {listing.status.replace("_", " ")}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {dealTemplateLabel(listing.deal_template)}
          {listing.collateral_is_titled ? " · titled / VIN verification path" : " · serial / lien documentation path"}
        </p>
        <div className="mt-4">
          <ListingMediaUploader listingId={listing.id} />
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Current assets</h2>
        {assets.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-400">
            No media assets recorded yet for this listing.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {assets.map((a) =>
              a.asset_type === "video" ? (
                <a
                  key={a.id}
                  href={a.public_url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-white/15 bg-[#091c3d] p-3 text-sm text-gold hover:bg-[#0c2450]"
                >
                  Video · open
                </a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={a.id}
                  src={a.public_url ?? "#"}
                  alt={`Asset ${a.id}`}
                  className="h-40 w-full rounded-md object-cover"
                />
              )
            )}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
