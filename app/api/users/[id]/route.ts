import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"
import { UnauthorizedError, NotFoundError } from "@/lib/services"
