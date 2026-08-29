import Link from "next/link";
import FaqAccordion from "../about/FaqAccordion";
import SiteFooter from "../_components/SiteFooter";
import SiteHeader from "../_components/SiteHeader";

export const metadata = {
  title: "常見問題",
};

export default async function FaqPage() {
  return (
    <>
      <SiteHeader />

      <section className="bg-primary-100 px-5 py-16 text-center md:px-10 md:py-20">
        <div className="mx-auto max-w-[680px]">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-accent-700">
            常見問題 · FAQ
          </p>
          <h1 className="mb-5 font-serif text-3xl font-bold leading-tight tracking-wide text-primary-900 md:text-4xl lg:text-5xl">
            入住前你可能會問
          </h1>
          <p className="text-[15px] leading-[1.9] text-primary-500">
            從訂房、付款到入住，我們整理了常被問到的問題。
            若仍有疑問，歡迎來信{" "}
            <a
              href="mailto:fieldstay00@gmail.com"
              className="underline underline-offset-2 hover:text-accent-700"
            >
              fieldstay00@gmail.com
            </a>
            。
          </p>
        </div>
      </section>

      <section className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1100px]">
          <FaqAccordion />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
