import Image from "next/image";
import Link from "next/link";

function RoomCard({ room }) {
  const {
    id,
    name,
    subtitle,
    maxCapacity,
    regularPrice,
    discount,
    image,
    description,
    area_sqm,
    bed_text,
    bathroom_text,
    category,
    amenities,
  } = room;

  const finalPrice = Number(regularPrice) - Number(discount || 0);

  const normalizedCategory = category || "double";
  const gradientClassMap = {
    double: "from-[#005f53] via-[#067968] to-[#0b8a75]",
    family: "from-[#8e6400] via-[#a57500] to-[#b59445]",
    whole: "from-[#004844] via-[#005e57] to-[#0b6f64]",
    special: "from-[#7d1d0f] via-[#9b3a24] to-[#a85639]",
  };
  const gradientClass =
    gradientClassMap[normalizedCategory] ||
    "from-[#005f53] via-[#067968] to-[#0b8a75]";

  const metaItems = [
    area_sqm ? `${area_sqm} ㎡` : null,
    maxCapacity ? `最多 ${maxCapacity} 位` : null,
    bed_text || null,
    bathroom_text || null,
  ].filter(Boolean);

  const amenityList = Array.isArray(amenities) ? amenities.slice(0, 6) : [];

  return (
    <article className="overflow-hidden rounded-xl border border-primary-200 bg-primary-50 shadow-sm">
      <div className={`relative h-[200px] overflow-hidden bg-gradient-to-br ${gradientClass}`}>
        {image ? (
          <Image
            fill
            src={image}
            alt={`Room ${name}`}
            className="object-cover"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/10" />
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-primary-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          有空房
        </span>
      </div>

      <div className="flex min-h-[330px] flex-col p-5">
        <div className="mb-4">
          <h3 className="mb-2 font-serif text-xl font-semibold leading-snug text-primary-900">{name}</h3>
          {metaItems.length > 0 && (
            <p className="mb-3 text-sm text-primary-500">{metaItems.join(" ・ ")}</p>
          )}
          <p className="line-clamp-2 text-sm leading-7 text-primary-600">
            {subtitle || description}
          </p>
        </div>

        {amenityList.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {amenityList.map((item) => (
              <span
                key={item}
                className="rounded border border-primary-200 bg-primary-100 px-2.5 py-1 text-xs text-primary-500"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto border-t border-primary-200 pt-4">
          <div className="mb-3">
            <p className="font-serif text-2xl font-semibold leading-none text-primary-900">
              NT${finalPrice.toLocaleString()}
            </p>
            {discount > 0 ? (
              <p className="mt-1 text-xs text-primary-500">
                每晚 ・ 含稅 ・ 原價 NT${Number(regularPrice).toLocaleString()}
              </p>
            ) : (
              <p className="mt-1 text-xs text-primary-500">每晚 ・ 含稅</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/rooms/${id}`}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-accent-700 px-4 py-2 text-sm font-semibold text-accent-700 transition hover:bg-accent-700 hover:text-white"
            >
              查看詳情
            </Link>
            <Link
              href={`/rooms/${id}`}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-800"
            >
              立即訂房
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default RoomCard;
