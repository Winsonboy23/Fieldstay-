import Image from "next/image";
import { signInAction } from "../_lib/actions";

function SignInButton() {
  return (
    <form action={signInAction}>
      <button className="flex items-center gap-4 rounded-md border border-primary-200 bg-primary-50 px-5 py-3 text-base font-semibold text-primary-800 transition hover:border-accent-500 md:gap-6 md:px-10 md:py-4">
        <div>
          <Image
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google logo"
            height="24"
            width="24"
          />
        </div>
        <span>使用 Google 帳號登入</span>
      </button>
    </form>
  );
}

export default SignInButton;
