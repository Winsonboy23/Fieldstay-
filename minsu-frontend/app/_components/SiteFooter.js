import { getSettings } from "../_lib/data-service";
import BrandMark from "./BrandMark";

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.25l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.628-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export default async function SiteFooter() {
  const settings = (await getSettings().catch(() => ({}))) || {};
  const brandName = settings.brand_name_zh || "山田寓所";
  const brandTagline = settings.brand_tagline || "FIELDSTAY";
  const lineUrl = settings.line_url || "";
  const threadsUrl = settings.threads_url || "";
  const instagramUrl = settings.instagram_url || "";
  const contactEmail = settings.contact_email || "";
  const contactPhone = settings.contact_phone || "";

  const socials = [
    instagramUrl && { href: instagramUrl, label: "Instagram", icon: <InstagramIcon /> },
    threadsUrl && { href: threadsUrl, label: "Threads", icon: <ThreadsIcon /> },
    lineUrl && { href: lineUrl, label: "LINE", icon: <LineIcon /> },
  ].filter(Boolean);

  return (
    <footer className="bg-[#1a1813] px-10 pb-9 pt-16 text-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 border-b border-white/10 pb-10 md:grid-cols-[1.6fr_1fr]">
        <div>
          <a href="/" className="inline-flex items-center gap-3 no-underline">
            <BrandMark alt={brandName} />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-semibold tracking-[0.08em] text-white">
                {brandName}
              </span>
              {brandTagline ? (
                <span className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/40">
                  {brandTagline}
                </span>
              ) : null}
            </span>
          </a>
          <p className="mt-4 max-w-[260px] text-[13px] leading-[1.75] text-white">
            台南農村民宿，提供田間體驗與住宿，感受節氣文化與土地連結。
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          {socials.length > 0 && (
            <ul className="flex list-none gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {(contactEmail || contactPhone) && (
            <ul className="flex list-none flex-col gap-1 md:text-right">
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 text-[13px] text-white no-underline transition hover:opacity-75"
                  >
                    <MailIcon />
                    <span>{contactEmail}</span>
                  </a>
                </li>
              )}
              {contactPhone && (
                <li>
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 text-[13px] text-white no-underline transition hover:opacity-75"
                  >
                    <PhoneIcon />
                    <span>{contactPhone}</span>
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-[1200px] justify-center text-xs text-white">
        <span>
          © 2026 {brandName}
          {brandTagline ? ` ${brandTagline}` : ""} · 版權所有
        </span>
      </div>
    </footer>
  );
}
