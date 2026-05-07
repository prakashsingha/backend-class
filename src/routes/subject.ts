import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { departments, subjects } from "../db/schema";
import { db } from "../db/db";
import { escapeLikePattern, parsePositiveIntQuery } from "../utils/query";

const subjectRouter = express.Router();

// Get all subjects with optional search and pagination parameters
subjectRouter.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const currentPage = parsePositiveIntQuery(
      page as string | string[] | undefined,
      1,
    );
    const requestedLimit = parsePositiveIntQuery(
      limit as string | string[] | undefined,
      10,
    );

    const limitPerPage = Math.min(requestedLimit, 100);
    const offset = (currentPage - 1) * limitPerPage;

    const filterCoditions = [];

    if (search) {
      filterCoditions.push(
        or(
          ilike(subjects.name, `%${escapeLikePattern(search as string)}%`),
          ilike(subjects.code, `%${escapeLikePattern(search as string)}%`),
        ),
      );
    }

    if (department) {
      filterCoditions.push(
        ilike(departments.name, `%${escapeLikePattern(department as string)}%`),
      );
    }

    const whereClause =
      filterCoditions.length > 0 ? and(...filterCoditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    const subjectsResult = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectsResult,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total,
        totalPages: Math.ceil(total / limitPerPage),
      },
    });
  } catch (error) {
    console.error(`GET /subjects: ${error}`);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});

export default subjectRouter;
