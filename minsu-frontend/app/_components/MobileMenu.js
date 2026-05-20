import { auth } from "../_lib/auth";
import { getRooms } from "../_lib/data-service";
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
  return <MobileMenuClient session={safeSession} featuredRooms={featuredRooms} />;
}
