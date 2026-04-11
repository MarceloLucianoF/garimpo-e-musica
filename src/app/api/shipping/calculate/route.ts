import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json(
		{ error: "Endpoint ainda não implementado." },
		{ status: 501 },
	);
}
