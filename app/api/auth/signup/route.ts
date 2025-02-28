import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

// Function to generate a unique username
async function generateUniqueUsername(name: string): Promise<string> {
  // Remove spaces and special characters, convert to lowercase
  const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let username = baseUsername;
  let counter = 1;
  
  // Keep trying until we find a unique username
  while (true) {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!existingUser) {
      return username;
    }
    
    // If username exists, append a number and try again
    username = `${baseUsername}${counter}`;
    counter++;
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate unique username
    const username = await generateUniqueUsername(name);

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
} 