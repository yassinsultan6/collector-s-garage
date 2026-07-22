import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=600x600&chl=${encodeURIComponent(`/vehicle/${id}`)}`;
  return NextResponse.json({ qrUrl, target: `/vehicle/${id}` });
}
