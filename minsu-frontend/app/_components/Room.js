import TextExpander from "@/app/_components/TextExpander";
import { EyeSlashIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

function Room({ room }) {
  const { name, description, maxCapacity, image } = room;

  return (
    <div className="field-card mb-16 grid overflow-hidden md:mb-20 md:grid-cols-[1.1fr_1.2fr]">
      <div className="relative min-h-80">
        <Image
          fill
          className="object-cover"
          src={image}
          alt={`Room ${name}`}
        />
      </div>

      <div className="p-7 md:p-10">
        <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-accent-700">
          FIELDSTAY ROOM
        </p>
        <h3 className="mb-5 font-serif text-4xl font-semibold text-primary-900 md:text-6xl">
          {name}
        </h3>

        <p className="mb-10 text-base leading-8 text-primary-600 md:text-lg">
          <TextExpander>{description}</TextExpander>
        </p>

        <ul className="flex flex-col gap-4 mb-7">
          <li className="flex gap-3 items-center">
            <UsersIcon className="h-5 w-5 text-accent-600" />
            <span className="text-base text-primary-700 md:text-lg">
              最多入住 <span className="font-semibold text-primary-900">{maxCapacity}</span> 位旅人
            </span>
          </li>
          <li className="flex gap-3 items-center">
            <MapPinIcon className="h-5 w-5 text-accent-600" />
            <span className="text-base text-primary-700 md:text-lg">
              位於<span className="font-semibold text-primary-900">田間老屋聚落</span>
            </span>
          </li>
          <li className="flex gap-3 items-center">
            <EyeSlashIcon className="h-5 w-5 text-accent-600" />
            <span className="text-base text-primary-700 md:text-lg">
              保留安靜、隱私與完整休息時間
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Room;
