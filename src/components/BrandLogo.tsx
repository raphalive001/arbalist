interface Props { size?: "sm" | "md" | "lg" }

export function BrandLogo({ size = "md" }: Props) {
  const sizes = {
    sm: { img: "w-7 h-7",  text: "text-base",  wrap: "gap-2"   },
    md: { img: "w-9 h-9",  text: "text-xl",    wrap: "gap-2.5" },
    lg: { img: "w-12 h-12", text: "text-2xl",  wrap: "gap-3"   },
  };
  const s = sizes[size];
  return (
    <div className={`flex items-center ${s.wrap}`}>
      <img
        src="/arbalist-logo.jpeg"
        alt="Arbalist Capital logo"
        className={`${s.img} rounded-lg object-cover flex-shrink-0 shadow-md shadow-yellow-900/30`}
      />
      <span className={`font-bold font-serif ${s.text} text-white`}>
        Arbalist <span className="text-lime-400">Capital</span>
      </span>
    </div>
  );
}
