import Image from "next/image";
import Image1 from "@/public/about-1.jpg";
import { getRooms } from "../_lib/data-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "關於山田",
};

export default async function Page() {
  const rooms = await getRooms();

  return (
    <div className="py-4 text-base leading-8 text-primary-700 md:py-8 md:text-lg">
      <div className="mb-14">
        <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-accent-700">
          ABOUT FIELDSTAY
        </p>
        <h1 className="mb-10 font-serif text-3xl font-semibold text-primary-900 md:text-5xl">
          田間的家，慢慢的生活
        </h1>

        <div className="grid gap-4 md:gap-10 grid-cols-1 grid-rows-[auto_auto] md:grid-rows-1 md:grid-cols-[2fr_1fr] ">
          <div className="space-y-8">
            <p>
              山田寓所座落在田野與老屋之間，保留樸實的建築紋理，也放進現代旅人需要的舒適。
              這裡不是匆忙抵達的旅店，而是一個讓你真正感覺回到時間裡的地方。
            </p>
            <p>
              我們準備了 {rooms.length} 種住宿選擇，從雙人小房到適合家族朋友的房型，
              讓不同旅程都能找到合適的停留方式。
            </p>
            <p>
              早晨散步、午後茶點、夜晚安靜談天，山田寓所把住宿變成一段自然展開的日常。
            </p>
          </div>

          <div className="relative aspect-square">
            <Image
              src={Image1}
              alt="山田寓所田間生活"
              placeholder="blur"
              className="object-cover"
              fill
              quality={80}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-10 font-serif text-3xl font-semibold text-primary-900 md:text-4xl">
          從老屋到寓所，為旅人保留一盞燈
        </h2>

        <div className="grid gap-4 md:gap-10 grid-cols-1 grid-rows-[auto_auto] md:grid-rows-1 md:grid-cols-[1fr_2fr]">
          {/* This is an example when you can't provide the static sourse and the source will come from a 3rd perty database */}
          <div className="relative aspect-square">
            <Image
              fill
              className="object-cover"
              src="/about-2.jpg" // This is a placeholder image for the image that will come from a 3rd party database
              alt="經營山田寓所的家人"
            />
          </div>

          <div className="space-y-8">
            <p>
              我們相信好的住宿不只是一張床，而是抵達時有人迎接、離開後仍會想起的溫度。
              房間、餐桌、庭院和路徑，都盡量保留在地生活的節奏。
            </p>
            <p>
              來到這裡，你可以把行程排得很鬆，也可以把時間留給土地、手作、散步和一頓飯。
              這就是山田寓所想提供的旅行方式。
            </p>

            <div>
              <a
                href="/rooms"
                className="field-button mt-4"
              >
                查看房型
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
