import NavToggle from "./NavToggle";
import { auth } from "@/app/_lib/auth";

async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-primary-200 bg-primary-50/90 p-3 backdrop-blur md:px-8 md:py-4">
      <NavToggle session={session} />
    </header>
  );
}

export default Header;
