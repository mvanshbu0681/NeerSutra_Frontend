import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dataPath = path.join(
      process.cwd(),
      "public",
      "Data_Fields",
      "indian_ocean_cleaned.json"
    );
    const raw = await fs.promises.readFile(dataPath, "utf8");
    const arr = JSON.parse(raw);

    // Map to only required fields and normalize keys
    const minimal = (arr || [])
      .map((r) => {
        // Some entries may use different key names — try common ones
        return {
          latitude: Number(
            r.latitude ?? r.lat ?? r.Latitude ?? r.LATITUDE ?? null
          ),
          longitude: Number(
            r.longitude ?? r.lon ?? r.Lon ?? r.LONGITUDE ?? null
          ),
          depth: r.depth ?? r.Depth ?? null,
          time: r.time ?? r.timestamp ?? r.date ?? r.datetime ?? null,
          o2: Number(r.o2 ?? r.do_min ?? r.do ?? null),
          status: r.status ?? null, // Include status field from dead_zones.json
        };
      })
      .filter(
        (p) =>
          p.latitude !== null &&
          p.longitude !== null &&
          !Number.isNaN(p.latitude) &&
          !Number.isNaN(p.longitude)
      );

    return NextResponse.json({ ok: true, rows: minimal });
  } catch (err) {
    console.error("Error reading copernicus JSON", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
