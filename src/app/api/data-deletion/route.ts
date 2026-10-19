import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    url: "https://useoura.com/data-deletion",
    confirmation_code: `oura_del_${Date.now()}`,
    status: "Data deletion instructions available at https://useoura.com/data-deletion",
  });
}

export async function POST() {
  const code = `oura_del_${Date.now()}`;
  return NextResponse.json({
    url: `https://useoura.com/data-deletion?code=${code}`,
    confirmation_code: code,
  });
}
