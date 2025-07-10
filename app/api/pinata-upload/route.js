import { NextResponse } from "next/server";

export async function POST(req) {
  const data = await req.json();

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataMetadata: { name: "campaign-metadata" },
      pinataContent: data,
    }),
  });

  const json = await res.json();
  return NextResponse.json(json);
}
