import type { Metadata } from "next";
import { VillageShell } from "@/components/game/VillageShell";

export const metadata: Metadata = {
  title: "마을",
};

export default function VillagePage() {
  return <VillageShell />;
}
