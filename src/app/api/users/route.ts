import { NextResponse } from "next/server";
import { getAllUsers, getUserCount } from "@/lib/store";
import { ApiResponse, UsersResponse } from "@/types";

export async function GET() {
  try {
    const users = getAllUsers();
    const total = getUserCount();

    // Sort by joinedAt descending (newest first)
    users.sort((a, b) => b.joinedAt - a.joinedAt);

    return NextResponse.json<ApiResponse<UsersResponse>>({
      success: true,
      data: {
        users,
        total,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

