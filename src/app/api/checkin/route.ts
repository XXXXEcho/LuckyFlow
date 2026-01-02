import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addUser, getUserByName, getUserByPhone } from "@/lib/store";
import { ApiResponse, CheckinRequest, CheckinResponse, User } from "@/types";

// Generate a random avatar color
function generateAvatarColor(): string {
  const colors = [
    "#ff2d95", // neon pink
    "#00f0ff", // neon cyan
    "#b026ff", // neon purple
    "#f0ff00", // neon yellow
    "#39ff14", // neon green
    "#ff6b35", // orange
    "#4ecdc4", // teal
    "#ffe66d", // gold
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckinRequest = await request.json();

    // Validation
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "姓名不能为空" },
        { status: 400 }
      );
    }

    if (!body.phone || body.phone.trim() === "") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "手机号不能为空" },
        { status: 400 }
      );
    }

    const trimmedName = body.name.trim();
    const trimmedPhone = body.phone.trim();

    // Validate phone format
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "请输入有效的手机号" },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existingUser = getUserByName(trimmedName);
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "该姓名已签到" },
        { status: 409 }
      );
    }

    // Check for duplicate phone
    const existingPhone = getUserByPhone(trimmedPhone);
    if (existingPhone) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "该手机号已签到" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      name: trimmedName,
      phone: trimmedPhone,
      department: body.department?.trim() || undefined,
      avatar: generateAvatarColor(),
      joinedAt: Date.now(),
    };

    addUser(newUser);

    return NextResponse.json<ApiResponse<CheckinResponse>>(
      {
        success: true,
        data: {
          user: newUser,
          message: "签到成功！请关注大屏幕",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkin error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}

