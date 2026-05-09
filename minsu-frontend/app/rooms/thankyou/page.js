import Link from "next/link";

export default function Page() {
  return (
    <div className="text-center space-y-6 mt-4">
      <h1 className="text-3xl font-semibold">
        訂房需求已送出
      </h1>
      <p className="text-lg text-primary-700">付款方式：轉帳。後台確認款項後會更新訂單狀態。</p>
      <Link
        href="/account/reservations"
        className="underline text-xl text-accent-500 inline-block"
      >
        查看我的訂單 &rarr;
      </Link>
    </div>
  );
}
