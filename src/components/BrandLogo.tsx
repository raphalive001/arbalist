import { TrendingUp } from "lucide-react";

interface Props { size?: "sm" | "md" | "lg" }

export function BrandLogo({ size = "md" }: Props) {
  const sizes = {
    sm: { icon: "w-5 h-5", text: "text-base", wrap: "gap-2" },
    md: { icon: "w-6 h-6", text: "text-xl", wrap: "gap-2.5" },
    lg: { icon: "w-8 h-8", text: "text-2xl", wrap: "gap-3" },
  };
  const s = sizes[size];
  return (
    <div className={`flex items-center ${s.wrap}`}>
      <div className={`${s.icon} bg-lime-400 rounded-lg flex items-center justify-center flex-shrink-0`}>
        <TrendingUp className="w-3/4 h-3/4 text-dark-800" />
      </div>
      <span className={`font-bold font-serif ${s.text} text-white`}>
        Arbalist <span className="text-lime-400">Capital</span>
      </span>
    </div>
  );
}
