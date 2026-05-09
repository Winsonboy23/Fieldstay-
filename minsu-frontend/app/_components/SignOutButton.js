import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { signOutAction } from "../_lib/actions";

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:border-accent-500 hover:text-accent-700">
        <ArrowRightOnRectangleIcon className="h-4 w-4 text-primary-500" />
        登出
      </button>
    </form>
  );
}

export default SignOutButton;
