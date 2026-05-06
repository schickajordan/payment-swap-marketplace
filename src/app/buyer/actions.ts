"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { createDraftAgreementForListing } from "@/lib/agreements/queries";

function addErrorParam(href: string, message: string): string {
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}error=${encodeURIComponent(message)}`;
}

export async function applyForSwapAction(formData: FormData) {
  await requireRole(["buyer", "seller", "admin"]);

  const listingId = String(formData.get("listingId") ?? "");
  const returnToRaw = String(formData.get("returnTo") ?? "").trim();
  const returnTo = returnToRaw.startsWith("/listings/") ? returnToRaw : "/buyer";
  const requireQualification = String(formData.get("requireQualification") ?? "") === "yes";
  let qualification:
    | {
        acknowledged_lender_approval: boolean;
        acknowledged_transfer_restrictions: boolean;
        acknowledged_fee_responsibility: boolean;
        transfer_fee_party: "buyer" | "seller" | "split" | "negotiated";
      }
    | undefined;

  if (!listingId) {
    redirect("/buyer?error=Missing listing identifier.");
  }

  if (requireQualification) {
    const acknowledgedLenderApproval = String(formData.get("acknowledgeLenderApproval") ?? "") === "yes";
    const acknowledgedRestrictions = String(formData.get("acknowledgeTransferRestrictions") ?? "") === "yes";
    const acknowledgedFees = String(formData.get("acknowledgeFeeResponsibility") ?? "") === "yes";
    const transferFeeParty = String(formData.get("transferFeeParty") ?? "").trim();
    const feePartyValid =
      transferFeeParty === "buyer"
      || transferFeeParty === "seller"
      || transferFeeParty === "split"
      || transferFeeParty === "negotiated";

    if (!acknowledgedLenderApproval || !acknowledgedRestrictions || !acknowledgedFees || !feePartyValid) {
      redirect(
        addErrorParam(
          returnTo,
          "Please complete all pre-apply acknowledgements and choose transfer-fee responsibility."
        )
      );
    }

    qualification = {
      acknowledged_lender_approval: acknowledgedLenderApproval,
      acknowledged_transfer_restrictions: acknowledgedRestrictions,
      acknowledged_fee_responsibility: acknowledgedFees,
      transfer_fee_party: transferFeeParty,
    };
  }

  try {
    await createDraftAgreementForListing(listingId, qualification);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create application.";
    redirect(addErrorParam(returnTo, message));
  }

  redirect("/buyer?success=application-submitted");
}
