"use client";

import Navigation from "@/app/_components/Navigation";
import Logo from "@/app/_components/Logo";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

function NavToggle({ session }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleToggle() {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <span
        onClick={handleToggle}
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden top-0 left-0 absolute h-screen w-screen bg-black/10 z-20`}
      />
      <button
        title="Menu"
        onClick={handleToggle}
        className="relative z-50 flex size-11 cursor-pointer select-none items-center justify-center rounded-md border border-primary-200 bg-primary-50 p-2 text-accent-700 shadow-sm md:hidden"
      >
        {isOpen ? <XMarkIcon /> : <Bars3Icon />}
      </button>

      <div
        className={`${
          isOpen ? "top-0" : "-top-full"
        } absolute right-0 z-40 flex h-fit w-screen flex-col items-center gap-6 bg-primary-50 py-8 shadow-lg transition-all md:relative md:mx-auto md:h-auto md:w-full md:max-w-7xl md:flex-row md:justify-between md:gap-0 md:bg-transparent md:p-0 md:shadow-none`}
      >
        <Logo handleToggle={handleToggle} />
        <Navigation handleToggle={handleToggle} session={session} />
      </div>
    </>
  );
}

export default NavToggle;
