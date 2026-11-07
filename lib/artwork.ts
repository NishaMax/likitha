export const artworkTemplates = [
  { value: "midnight", label: "Midnight", className: "from-[#334c50] via-[#273443] to-[#1b202d]" },
  { value: "twilight", label: "Twilight", className: "from-[#4c4a70] via-[#34344f] to-[#1b202c]" },
  { value: "ember", label: "Ember", className: "from-[#6d4b68] via-[#403149] to-[#1d202d]" },
  { value: "forest", label: "Forest", className: "from-[#3e5b50] via-[#263d3d] to-[#171f25]" },
] as const;

export type ArtworkTemplate = (typeof artworkTemplates)[number]["value"];

export const defaultArtworkTemplate: ArtworkTemplate = "midnight";

export function getArtworkTemplateClass(template: string | null | undefined) {
  return artworkTemplates.find((item) => item.value === template)?.className ?? artworkTemplates[0].className;
}

export function isArtworkTemplate(value: string) {
  return artworkTemplates.some((item) => item.value === value);
}
