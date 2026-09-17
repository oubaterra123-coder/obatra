import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://obatra.vercel.app/",
      lastModified: new Date(),
    },
    {
      url: "https://obatra.vercel.app/contact",
      lastModified: new Date(),
    },
    {
      url: "https://obatra.vercel.app/privacy",
      lastModified: new Date(),
    },
    {
      url: "https://obatra.vercel.app/terms",
      lastModified: new Date(),
    },
  ];
}
