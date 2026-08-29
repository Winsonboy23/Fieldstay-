import { Suspense } from "react";
import RoomList from "../_components/RoomList";
import Spinner from "../_components/Spinner";
import Link from "next/link";
import SiteFooter from "../_components/SiteFooter";
import SiteHeader from "../_components/SiteHeader";
import PageHero from "../_components/PageHero";

export const revalidate = 0;

export const metadata = {
  title: "房型",
};

export default async function Page({ searchParams }) {
  const filter = searchParams?.capacity ?? "all";

  return (
    <>
      <SiteHeader overlay />
      <PageHero
        eyebrow="Rooms & Stays · 房型選擇"
        title="選擇您的住宿"
        sub="每一間房都延續老屋的材質與光線，留下紅磚、木構與窗景，讓入住的人能真的休息。"
        curveColor="#f3f1ee"
        breadcrumb={
          <>
            <Link href="/" className="text-white/55 transition hover:text-white">
              首頁
            </Link>
            <span>›</span>
            <span className="text-white/80">所有房型</span>
          </>
        }
      />

      <section className="min-h-[70vh] bg-[#f3f1ee]">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-12">
          <Suspense fallback={<Spinner />} key={filter}>
            <RoomList filter={filter} />
          </Suspense>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
