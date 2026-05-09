import RoomCard from "@/app/_components/RoomCard";
import { getRooms } from "../_lib/data-service";
import { unstable_noStore } from "next/cache";

async function RoomList({ filter }) {
  // unstable_noStore();

  const rooms = await getRooms();

  if (!rooms) return null;

  let displayedRooms;

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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {displayedRooms.map((room) => (
        <RoomCard room={room} key={room.id} />
      ))}
    </div>
  );
}

export default RoomList;
