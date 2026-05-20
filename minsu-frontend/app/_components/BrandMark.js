const BRAND_LOGO_URL =
  "https://wnvqbozqsdvaszfgumkg.supabase.co/storage/v1/object/public/site-images/1778689945313-0.1766648174384008-528684274_18019731992746464_3668865358020989427_n--1-.jpg";

export default function BrandMark({
  size = 38,
  className = "",
  alt = "山田寓所",
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_LOGO_URL}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-full object-contain ${className}`}
    />
  );
}

export { BRAND_LOGO_URL };
