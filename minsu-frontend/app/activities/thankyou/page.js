import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/_lib/auth";
import {
  getActivitySignupById,
  getSettings,
} from "@/app/_lib/data-service";
import { normalizeActivity } from "@/app/activities/_activity-data";
import ActivitySuccessClient from "./ActivitySuccessClient";

function orderCode(id) {
  const seed = String(id || "").replace(/\D/g, "").slice(-12);
  return `AC${seed.padStart(12, "0")}`;
}

export const metadata = { title: "活動報名成功" };

export default async function Page({ searchParams }) {
  const signupId = searchParams?.signupId || "";
  if (!signupId) notFound();

  const session = await auth();
  if (!session?.user?.guestId)
    redirect(
      `/login?next=%2Factivities%2Fthankyou%3FsignupId%3D${encodeURIComponent(
        signupId
      )}`
    );

  const signup = await getActivitySignupById(signupId);
  if (!signup) notFound();
  if (String(signup.guest_id) !== String(session.user.guestId)) notFound();

  const activity = normalizeActivity(signup.activities);
  if (!activity) notFound();

  const quantity = signup.quantity || 1;
  const totalPrice = Number(
    signup.total_price || Number(activity.price || 0) * quantity
  );

  const detail = {
    signupId: signup.id,
    orderCode: orderCode(signup.id),
    activityId: activity.id,
    activityTitle: activity.title,
    dateLabel: activity.dateLabel,
    time: activity.time,
    location: activity.location,
    address: activity.address,
    unit: activity.unit,
    quantity,
    totalPrice,
    paymentStatus: signup.payment_status || "unpaid",
    isWaitlist: signup.status === "waitlist",
    contactName: signup.contact_name || "",
    contactEmail: signup.contact_email || "",
    contactPhone: signup.contact_phone || "",
    specialRequest: signup.special_request || "",
  };

  const settings = await getSettings().catch(() => ({}));

  return (
    <ActivitySuccessClient
      detail={detail}
      settings={settings}
      user={session.user}
    />
  );
}
