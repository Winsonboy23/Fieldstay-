import { auth } from "../_lib/auth";
import { getRooms, getSettings } from "../_lib/data-service";
import { isHomeBlockVisible } from "../_lib/home-blocks";
import MobileMenuClient from "./MobileMenuClient";

export default async function MobileMenu() {
  const session = await auth().catch(() => null);
  let rooms = [];
  try {
    rooms = (await getRooms()) || [];
  } catch {
    rooms = [];
  }
  const featuredRooms = rooms.slice(0, 3).map((r) => ({
    id: r.id,
    name: r.name,
    image: r.image,
  }));
  const safeSession = session?.user
    ? { user: { name: session.user.name, email: session.user.email } }
    : null;
  // 首頁「交通資訊」區塊被後台隱藏時，選單上的錨點連結也要一起收掉。
  // 桌機導覽列（SiteNavLinks）是 client component、拿不到設定，
  // 所以這裡用一小段 CSS 把帶 data-nav-transport 的連結藏起來。
  const settings = await getSettings().catch(() => null);
  const showTransport = isHomeBlockVisible(settings, "transport");

  return (
    <>
      {!showTransport && (
        <style>{"[data-nav-transport]{display:none!important}"}</style>
      )}
      <MobileMenuClient
        session={safeSession}
        featuredRooms={featuredRooms}
        showTransport={showTransport}
      />
    </>
  );
}
