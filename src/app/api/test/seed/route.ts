import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addUser, getAllUsers, resetAll } from "@/lib/store";
import { ApiResponse, User } from "@/types";

// Chinese surnames and given names for generating realistic names
const surnames = [
  "王", "李", "张", "刘", "陈", "杨", "黄", "赵", "周", "吴",
  "徐", "孙", "马", "胡", "朱", "郭", "何", "罗", "高", "林",
  "郑", "梁", "谢", "宋", "唐", "许", "韩", "冯", "邓", "曹",
  "彭", "曾", "萧", "田", "董", "袁", "潘", "于", "蒋", "蔡",
  "余", "杜", "叶", "程", "苏", "魏", "吕", "丁", "任", "沈",
];

const givenNames = [
  "伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军",
  "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞",
  "平", "刚", "桂英", "华", "飞", "玲", "建华", "建国", "建军", "建平",
  "志强", "志明", "志伟", "志刚", "志军", "海燕", "海涛", "海波", "海龙", "海霞",
  "小红", "小明", "小华", "小军", "小燕", "小龙", "小凤", "小玲", "小芳", "小强",
  "文", "文华", "文明", "文军", "文杰", "文涛", "文静", "文娟", "文芳", "文丽",
  "晓", "晓明", "晓华", "晓军", "晓燕", "晓红", "晓玲", "晓芳", "晓静", "晓丽",
  "雪", "雪梅", "雪莲", "雪峰", "雪松", "雪芳", "雪华", "雪玲", "雪燕", "雪娟",
  "春", "春华", "春梅", "春燕", "春霞", "春玲", "春芳", "春丽", "春红", "春娟",
  "秋", "秋华", "秋梅", "秋燕", "秋霞", "秋玲", "秋芳", "秋丽", "秋红", "秋菊",
];

const colors = [
  "#ff2d95", "#00f0ff", "#b026ff", "#f0ff00", "#39ff14",
  "#ff6b35", "#4ecdc4", "#ffe66d", "#ff6b9d", "#4fc3f7",
  "#ab47bc", "#26a69a", "#ef5350", "#42a5f5", "#66bb6a",
];

// Generate a random phone number
function generatePhone(): string {
  const prefixes = ["130", "131", "132", "133", "134", "135", "136", "137", "138", "139",
                    "150", "151", "152", "153", "155", "156", "157", "158", "159",
                    "180", "181", "182", "183", "184", "185", "186", "187", "188", "189"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
  return prefix + suffix;
}

// Generate a random name
function generateName(index: number): string {
  const surname = surnames[index % surnames.length];
  const givenName = givenNames[Math.floor(index / surnames.length) % givenNames.length];
  // Add a number suffix if we've cycled through all combinations
  const cycle = Math.floor(index / (surnames.length * givenNames.length));
  return cycle > 0 ? `${surname}${givenName}${cycle}` : `${surname}${givenName}`;
}

export async function POST() {
  try {
    // Reset existing data
    resetAll();

    const totalUsers = 500;

    // Add test users
    const users: User[] = [];
    for (let i = 0; i < totalUsers; i++) {
      users.push({
        id: uuidv4(),
        name: generateName(i),
        phone: generatePhone(),
        avatar: colors[i % colors.length],
        joinedAt: Date.now() - (totalUsers - i) * 100,
      });
    }

    users.forEach((user) => addUser(user));

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: `已添加 ${users.length} 个测试用户`,
        count: getAllUsers().length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
