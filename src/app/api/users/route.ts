import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming you're using Prisma

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        licenseKey: true,
        licenseType: true,
        expirationDate: true,
        isBlocked: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 