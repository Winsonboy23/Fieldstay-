import RoomCard from "@/app/_components/RoomCard";
import CarouselDots from "@/app/_components/CarouselDots";
import { getRooms } from "../_lib/data-service";
import { unstable_noStore } from "next/cache";

async function RoomList({ filter }) {
  // unstable_noStore();

  const rooms = await getRooms();

  if (!rooms) return null;

  if (rooms.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-primary-300 px-6 py-20 text-center">
        <p className="font-serif text-lg text-primary-700">房型準備中</p>
        <p className="mt-2 text-sm text-primary-500">
          目前沒有開放預訂的房型，請稍後再回來看看。
        </p>
      </div>
    );

  let displayedRooms = rooms;

  if (filter === "all") displayedRooms = rooms;
  if (filter === "small")
    displayedRooms = rooms.filter((room) => room.maxCapacity <= 3);
  if (filter === "medium")
    displayedRooms = rooms.filter(
      (room) => room.maxCapacity >= 4 && room.maxCapacity <= 7
    );
  if (filter === "large")
    displayedRooms = rooms.filter((room) => room.maxCapacity >= 8);

  return (
    <>
      <div
        id="roomListGrid"
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scroll-padding-inline-start:1rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 xl:grid-cols-3 [&>*]:w-[85%] [&>*]:flex-none [&>*]:snap-start md:[&>*]:w-auto"
      >
        {displayedRooms.map((room) => (
          <RoomCard room={room} key={room.id} />
        ))}
      </div>
      <CarouselDots targetId="roomListGrid" count={displayedRooms.length} />
    </>
  );
}

export default RoomList;
