import type { MetadataRoute } from "next";
import { stations } from "@/lib/stations";

const BASE_URL = "https://ski-meteo.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const stationEntries: MetadataRoute.Sitemap = stations.map((station) => ({
        url: `${BASE_URL}/station/${station.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "hourly",
            priority: 1.0,
        },
        ...stationEntries,
    ];
}
