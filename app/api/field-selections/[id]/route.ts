import { NextResponse } from "next/server";
import { getFieldSelections, setFieldSelections } from "@/lib/field-selections-db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const selections = getFieldSelections(id);
  return NextResponse.json({ selections });
}

export async function PUT(req: Request, { params }: Props) {
  const { id } = await params;
  let body: { selections?: Record<string, boolean> };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!body.selections || typeof body.selections !== "object") {
    return new Response("selections required", { status: 400 });
  }
  setFieldSelections(id, body.selections);
  return new Response(null, { status: 204 });
}
