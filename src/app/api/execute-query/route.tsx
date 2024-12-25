import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { query } = await request.json()

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  try {
    // Parse the query to get the model and method
    const result = await eval(`(async () => {
      return await prisma.${query}
    })()`)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Query error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
