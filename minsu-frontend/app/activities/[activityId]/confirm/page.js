import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "@/app/_lib/auth";
import { getActivity } from "@/app/_lib/data-service";
import { normalizeActivity } from "../../_activity-data";
import ActivityConfirmClient from "./ActivityConfirmClient";

export async function generateMetadata({ params }) {
  const raw = await getActivity(params.activityId);
  const activity = normalizeActivity(raw);
  return {
    title: activity ? `${activity.shortTitle} | 確認報名` : "確認報名",
  };
}

export default async function Page({ params }) {
  const session = await auth();
  const raw = await getActivity(params.activityId);
  const activity = normalizeActivity(raw);

  if (!activity) notFound();

  if (!session?.user) {
    const next = encodeURIComponent(`/activities/${params.activityId}/confirm`);
    redirect(`/login?next=${next}`);
  }

  return <ActivityConfirmClient activity={activity} user={session.user} />;
}
