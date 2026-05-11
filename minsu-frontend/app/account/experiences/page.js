import ExperienceReservationsClient from "./ExperienceReservationsClient";

export const metadata = {
  title: "體驗預約",
};

export default function Page() {
  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-primary-900">
          體驗預約
        </h2>
      </div>
      <ExperienceReservationsClient />
    </section>
  );
}
