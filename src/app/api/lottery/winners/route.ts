import { NextRequest, NextResponse } from "next/server";
import { addWinner, getAllWinners, getEligibleParticipants } from "@/lib/store";
import { ApiResponse, User, WinnersResponse } from "@/types";

// GET - Get all winners
export async function GET() {
  try {
    const winners = getAllWinners();

    return NextResponse.json<ApiResponse<WinnersResponse>>({
      success: true,
      data: { winners },
    });
  } catch (error) {
    console.error("Get winners error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

// POST - Add a new winner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "缺少用户ID" },
        { status: 400 }
      );
    }

    const winner = addWinner(userId);

    if (!winner) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "用户不存在或已中奖" },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ winner: User }>>({
      success: true,
      data: { winner },
    });
  } catch (error) {
    console.error("Add winner error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

