import { NextResponse } from "next/server";
import { getEligibleParticipants } from "@/lib/store";
import { ApiResponse, User } from "@/types";

// GET - Get all eligible participants (not yet winners)
export async function GET() {
  try {
    const participants = getEligibleParticipants();

    return NextResponse.json<ApiResponse<{ participants: User[]; count: number }>>({
      success: true,
      data: {
        participants,
        count: participants.length,
      },
    });
  } catch (error) {
    console.error("Get participants error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

