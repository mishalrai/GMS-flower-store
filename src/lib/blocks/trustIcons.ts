import {
  Truck,
  Shield,
  Headphones,
  RefreshCw,
  Lock,
  Star,
  Heart,
  Award,
  Clock,
  Gift,
  ThumbsUp,
  CheckCircle,
  Leaf,
  Package,
  LucideIcon,
} from "lucide-react";
import { TrustIconKey } from "./types";

export const TRUST_ICONS: Record<
  TrustIconKey,
  { Icon: LucideIcon; label: string }
> = {
  truck: { Icon: Truck, label: "Truck" },
  shield: { Icon: Shield, label: "Shield" },
  headphones: { Icon: Headphones, label: "Headphones" },
  refresh: { Icon: RefreshCw, label: "Refresh" },
  lock: { Icon: Lock, label: "Lock" },
  star: { Icon: Star, label: "Star" },
  heart: { Icon: Heart, label: "Heart" },
  award: { Icon: Award, label: "Award" },
  clock: { Icon: Clock, label: "Clock" },
  gift: { Icon: Gift, label: "Gift" },
  "thumbs-up": { Icon: ThumbsUp, label: "Thumbs up" },
  "check-circle": { Icon: CheckCircle, label: "Check" },
  leaf: { Icon: Leaf, label: "Leaf" },
  package: { Icon: Package, label: "Package" },
};

export const TRUST_ICON_KEYS: TrustIconKey[] = Object.keys(
  TRUST_ICONS,
) as TrustIconKey[];

/** Fallback rotation when an item doesn't specify an icon. */
const FALLBACK: TrustIconKey[] = ["truck", "shield", "headphones", "refresh"];

export function iconForItem(
  itemIcon: TrustIconKey | undefined,
  index: number,
): LucideIcon {
  if (itemIcon && TRUST_ICONS[itemIcon]) return TRUST_ICONS[itemIcon].Icon;
  return TRUST_ICONS[FALLBACK[index % FALLBACK.length]].Icon;
}
