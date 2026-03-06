const platformLogoClasses: Record<string, string> = {
  coursera: "bg-[#0056D2] text-white",
  google: "bg-[#4285F4] text-white",
  ibm: "bg-[#0F62FE] text-white",
  aws: "bg-[#FF9900] text-black",
};

export const getPlatformLogoClass = (platform: string) =>
  platformLogoClasses[platform.trim().toLowerCase()] ?? "bg-muted text-foreground";

export const getPlatformMonogram = (platform: string) => {
  const name = platform.trim();
  if (!name) return "CERT";
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
};

