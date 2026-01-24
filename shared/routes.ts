import { z } from "zod";
import { insertUserSchema, insertSkillSchema, insertSwapSchema, insertReviewSchema, users, skills, swaps, reviews } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
  },
  skills: {
    list: {
      method: "GET" as const,
      path: "/api/skills",
      input: z.object({
        userId: z.coerce.number().optional(),
        type: z.enum(["OFFERED", "WANTED"]).optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof skills.$inferSelect & { user?: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/skills",
      input: insertSkillSchema,
      responses: {
        201: z.custom<typeof skills.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/skills/:id",
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  swaps: {
    list: {
      method: "GET" as const,
      path: "/api/swaps",
      responses: {
        200: z.array(z.custom<typeof swaps.$inferSelect & { 
          initiator: typeof users.$inferSelect,
          receiver: typeof users.$inferSelect,
          offerSkill: typeof skills.$inferSelect,
          wantSkill: typeof skills.$inferSelect 
        }>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/swaps",
      input: insertSwapSchema,
      responses: {
        201: z.custom<typeof swaps.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: "PATCH" as const,
      path: "/api/swaps/:id/status",
      input: z.object({
        status: z.enum(["accepted", "rejected", "completed"]),
      }),
      responses: {
        200: z.custom<typeof swaps.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  reviews: {
    create: {
      method: "POST" as const,
      path: "/api/reviews",
      input: insertReviewSchema,
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    getUserReviews: {
      method: "GET" as const,
      path: "/api/users/:id/reviews",
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect & { reviewer: typeof users.$inferSelect }>()),
      },
    },
  },
  users: {
    get: {
      method: "GET" as const,
      path: "/api/users/:id",
      responses: {
        200: z.custom<typeof users.$inferSelect & { 
          skills: typeof skills.$inferSelect[],
          reviewsReceived: typeof reviews.$inferSelect[] 
        }>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
