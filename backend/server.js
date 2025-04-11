const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const bodyParser = require("body-parser");
const cors = require("cors");

// Create Prisma client with error handling
let prisma;
try {
  prisma = new PrismaClient();
  console.log("Prisma client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  // Create a mock Prisma client with error responses
  prisma = {
    $connect: async () => {
      throw new Error("Database connection failed");
    },
    $disconnect: async () => {
      console.log("Mock Prisma client disconnected");
    },
    // Add mock methods that return errors
    person: {
      findMany: async () => {
        throw new Error("Database connection failed");
      },
      findUnique: async () => {
        throw new Error("Database connection failed");
      },
      create: async () => {
        throw new Error("Database connection failed");
      },
      update: async () => {
        throw new Error("Database connection failed");
      },
      delete: async () => {
        throw new Error("Database connection failed");
      },
    },
    // Add other models as needed
    student: {
      findMany: async () => {
        throw new Error("Database connection failed");
      },
      findUnique: async () => {
        throw new Error("Database connection failed");
      },
    },
    hostel: {
      findMany: async () => {
        throw new Error("Database connection failed");
      },
      findUnique: async () => {
        throw new Error("Database connection failed");
      },
    },
    room: {
      findMany: async () => {
        throw new Error("Database connection failed");
      },
      findUnique: async () => {
        throw new Error("Database connection failed");
      },
    },
    messBill: {
      findMany: async () => {
        throw new Error("Database connection failed");
      },
      findUnique: async () => {
        throw new Error("Database connection failed");
      },
      update: async () => {
        throw new Error("Database connection failed");
      },
    },
    roomAllocation: {
      findMany: async () => {
        throw new Error("Database connection failed");
      },
      findUnique: async () => {
        throw new Error("Database connection failed");
      },
      create: async () => {
        throw new Error("Database connection failed");
      },
      update: async () => {
        throw new Error("Database connection failed");
      },
      delete: async () => {
        throw new Error("Database connection failed");
      },
    },
    $transaction: async (callback) => {
      throw new Error("Database connection failed");
    },
  };
}

const app = express();

/**
 * HOSTEL MANAGEMENT SYSTEM API
 * ============================
 *
 * This API provides endpoints for managing a hostel system, including:
 * - Person management (students, wardens, attendants)
 * - Hostel management
 * - Room allocation
 * - Billing
 *
 * API VERSION: 1.0.0
 *
 * IMPORTANT NOTES ABOUT IDS IN THIS API:
 *
 * - The Student model's primary identifier in the API is personId, not id
 * - When API routes reference /students/:id, the id parameter refers to personId
 * - For room allocations, the studentId parameter refers to personId
 * - We internally map personId to the actual studentId for database operations
 *
 * This approach allows the frontend to work with Person IDs consistently.
 *
 * ERROR HANDLING:
 * All endpoints return appropriate HTTP status codes:
 * - 200: Success
 * - 201: Resource created successfully
 * - 400: Bad request (validation errors)
 * - 404: Resource not found
 * - 500: Server error
 *
 * Error responses follow the format:
 * {
 *   "error": "Error type",
 *   "message": "Detailed error message"
 * }
 */

app.use(cors());
app.use(bodyParser.json());

// Configuration
const ROOM_DEFAULTS = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  DORMITORY: 10,
};

// Zod Schemas
const schemas = {
  // Common address schema
  address: z.object({
    hNo: z.string().min(1),
    street: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/),
  }),

  // Student schema
  student: {
    create: z.object({
      name: z.string().min(2),
      contactNo: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      emergencyContact: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      fatherContact: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      motherContact: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      personalAddress: z
        .object({
          hNo: z.string().min(1),
          street: z.string().min(2),
          city: z.string().min(2),
          state: z.string().min(2),
          pincode: z.string().regex(/^\d{6}$/),
        })
        .optional(),
      remark: z.string().optional(),
      roomAllocation: z
        .object({
          roomId: z.number().int().positive(),
          academicYear: z.string().regex(/^\d{4}-\d{4}$/),
          startDate: z.string().datetime(),
        })
        .optional(),
    }),
  },

  // Warden schema
  warden: {
    create: z.object({
      name: z.string().min(2),
      contactNo: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      personalAddress: z
        .object({
          hNo: z.string().min(1),
          street: z.string().min(2),
          city: z.string().min(2),
          state: z.string().min(2),
          pincode: z.string().regex(/^\d{6}$/),
        })
        .optional(),
      hostelAssignment: z
        .object({
          hostelId: z.number().int().positive(),
          assignmentDate: z.string().datetime(),
          endDate: z.string().datetime().optional(),
        })
        .optional(),
    }),
  },

  // Attendant schema
  attendant: {
    create: z.object({
      name: z.string().min(2),
      contactNo: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      personalAddress: z
        .object({
          hNo: z.string().min(1),
          street: z.string().min(2),
          city: z.string().min(2),
          state: z.string().min(2),
          pincode: z.string().regex(/^\d{6}$/),
        })
        .optional(),
      duties: z
        .array(
          z.object({
            hostelId: z.number().int().positive(),
            dutyType: z.enum([
              "CLEANING",
              "ROOM_MANAGEMENT",
              "BASIC_ASSISTANCE",
              "SECURITY",
            ]),
            shiftType: z.enum(["MORNING", "EVENING", "NIGHT"]),
            dutyDate: z.string().datetime(),
          })
        )
        .optional(),
    }),
  },

  // Hostel schema
  hostel: {
    create: z.object({
      name: z.string().min(2),
      contactNo: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      address: z.object({
        building: z.string().min(1),
        street: z.string().min(2),
        city: z.string().min(2),
        state: z.string().min(2),
        pincode: z.string().regex(/^\d{6}$/),
        landmark: z.string().optional(),
      }),
      rooms: z.object({
        SINGLE: z.number().int().min(0).default(0),
        DOUBLE: z.number().int().min(0).default(0),
        TRIPLE: z.number().int().min(0).default(0),
        DORMITORY: z.number().int().min(0).default(0),
      }),
    }),
    update: z.object({
      name: z.string().min(2).optional(),
      contactNo: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
      address: z
        .object({
          building: z.string().min(1).optional(),
          street: z.string().min(2).optional(),
          city: z.string().min(2).optional(),
          state: z.string().min(2).optional(),
          pincode: z
            .string()
            .regex(/^\d{6}$/)
            .optional(),
          landmark: z.string().optional(),
        })
        .optional(),
      rooms: z
        .object({
          SINGLE: z.number().int().min(0).default(0).optional(),
          DOUBLE: z.number().int().min(0).default(0).optional(),
          TRIPLE: z.number().int().min(0).default(0).optional(),
          DORMITORY: z.number().int().min(0).default(0).optional(),
        })
        .optional(),
    }),
  },

  // Allocation schema
  allocation: z.object({
    personId: z.number().int().positive(), // This is the personId of the student
    roomId: z.number().int().positive(),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/),
  }),

  // Bill update schema
  billUpdate: z.object({
    billId: z.number().int().positive(),
    status: z.enum(["GENERATED", "PAID", "OVERDUE", "CANCELLED"]),
    fine: z.number().nonnegative().default(0),
  }),

  // Allocation update schema
  allocationUpdate: z.object({
    newRoomId: z.number().int().positive().optional(),
    endDate: z.string().optional(), // ISO date string
  }),

  // Room query schema
  roomQuery: z.object({
    roomType: z.enum(["SINGLE", "DOUBLE", "TRIPLE", "DORMITORY"]),
    academicYear: z
      .string()
      .regex(/^\d{4}-\d{4}$/)
      .optional(),
  }),

  // Bill schema
  bill: z.object({
    studentId: z.number().int().positive(),
    billAmount: z.number().nonnegative(),
    billGenerationDate: z.string().datetime(),
    dueDate: z.string().datetime(),
    fine: z.number().nonnegative().optional(),
    status: z.enum(["GENERATED", "PAID", "OVERDUE", "CANCELLED"]),
  }),
};

// Middleware
const validate = (schema) => (req, res, next) => {
  try {
    req.validated = schema.parse(req.body);
    console.log(req.validated);
    next();
  } catch (err) {
    next(err);
  }
};

// Database Helpers
const db = {
  createHostelWithRooms: async (data) => {
    return prisma.$transaction(async (tx) => {
      const hostel = await tx.hostel.create({
        data: { name: data.name, hostelAddress: { create: data.address } },
      });

      const rooms = Object.entries(data.rooms)
        .filter(([_, count]) => count > 0)
        .flatMap(([type, count]) =>
          Array.from({ length: count }, () => ({
            hostelId: hostel.id,
            roomType: type,
            capacity: ROOM_DEFAULTS[type],
            furnitureDetails: `Standard ${type.toLowerCase()} room`,
          }))
        );

      if (rooms.length) await tx.room.createMany({ data: rooms });
      return hostel;
    });
  },
};

// Add a global error handler for database errors
app.use((err, req, res, next) => {
  console.error("[Error]", err);

  // Check if it's a database connection error
  if (err.message && err.message.includes("Database connection failed")) {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "Database connection failed. Please try again later.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
    });
  }

  const statusCode = err.message.includes("not found") ? 404 : 500;
  res.status(statusCode).json({
    error: statusCode === 404 ? "Not Found" : "Internal Server Error",
    message: err.message,
  });
});

// ================ Endpoints ================ //

// Health Check Endpoint (for port detection and monitoring)
app.head("/api/health", (req, res) => {
  res.status(200).end();
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: require("./package.json").version,
  });
});

// Add a health check endpoint that checks database connectivity
app.get("/api/health/db", async (req, res) => {
  try {
    // Try to connect to the database
    await prisma.$connect();
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }
});

// Student Management
app.post(
  "/api/students",
  validate(schemas.student.create),
  async (req, res) => {
    const data = req.validated;
    try {
      const student = await prisma.$transaction(async (prisma) => {
        // Create person with address and contact
        const newPerson = await prisma.person.create({
          data: {
            name: data.name,
            personType: "Student",
            contactNo: data.contactNo,
            personalAddress: data.personalAddress
              ? { create: data.personalAddress }
              : undefined,
          },
          include: { personalAddress: true },
        });

        // Create student record
        const newStudent = await prisma.student.create({
          data: {
            personId: newPerson.id,
            remark: data.remark,
            emergencyContact: data.emergencyContact,
            fatherContact: data.fatherContact,
            motherContact: data.motherContact,
          },
        });

        // Create room allocation if provided
        if (data.roomAllocation) {
          await prisma.roomAllocation.create({
            data: {
              studentId: newStudent.id,
              roomId: data.roomAllocation.roomId,
              academicYear: data.roomAllocation.academicYear,
              startDate: new Date(data.roomAllocation.startDate),
            },
          });
        }

        // Get the final student with all relations
        const finalStudent = await prisma.student.findUnique({
          where: { id: newStudent.id },
          include: {
            person: {
              include: {
                personalAddress: true,
              },
            },
            roomAllocations: {
              include: {
                room: {
                  include: {
                    hostel: true,
                  },
                },
              },
            },
            messBills: true,
          },
        });

        return finalStudent;
      });

      res.status(201).json(student);
    } catch (err) {
      console.error("Error creating student:", err);
      res
        .status(500)
        .json({ error: "Failed to create student", message: err.message });
    }
  }
);

app.put(
  "/api/students/:id",
  validate(schemas.student.create),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.validated;

    try {
      // First, check if the student exists
      const existingStudent = await prisma.student.findFirst({
        where: { personId: id },
        include: {
          person: {
            include: {
              personalAddress: true,
            },
          },
          roomAllocations: {
            where: { endDate: null },
            include: {
              room: true,
            },
          },
        },
      });

      if (!existingStudent) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Update person with upsert for address
      const updatedPerson = await prisma.person.update({
        where: { id },
        data: {
          name: data.name,
          contactNo: data.contactNo,
          personalAddress: data.personalAddress
            ? {
                upsert: {
                  create: {
                    ...data.personalAddress,
                    personId: id,
                  },
                  update: data.personalAddress,
                },
              }
            : undefined,
        },
        include: { personalAddress: true },
      });

      // Update student
      await prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          remark: data.remark,
          emergencyContact: data.emergencyContact,
          fatherContact: data.fatherContact,
          motherContact: data.motherContact,
        },
      });

      // Handle room allocation update if provided
      if (data.roomAllocation) {
        // End the current allocation if exists
        if (existingStudent.roomAllocations.length > 0) {
          await prisma.roomAllocation.update({
            where: { id: existingStudent.roomAllocations[0].id },
            data: { endDate: new Date() },
          });
        }

        // Create new allocation
        await prisma.roomAllocation.create({
          data: {
            studentId: existingStudent.id,
            roomId: data.roomAllocation.roomId,
            academicYear: data.roomAllocation.academicYear,
            startDate: new Date(data.roomAllocation.startDate),
          },
        });
      }

      // Get the final updated student with all relations
      const finalStudent = await prisma.student.findFirst({
        where: { personId: id },
        include: {
          person: {
            include: {
              personalAddress: true,
            },
          },
          roomAllocations: {
            include: {
              room: {
                include: {
                  hostel: true,
                },
              },
            },
          },
          messBills: true,
        },
      });

      // Map the response to include personId as id for frontend compatibility
      const mappedStudent = {
        ...finalStudent,
        id: finalStudent.personId,
      };

      res.json(mappedStudent);
    } catch (err) {
      console.error("Error updating student:", err);
      res
        .status(500)
        .json({ error: "Failed to update student", message: err.message });
    }
  }
);

app.delete("/api/students/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // First, check if the student exists
    const student = await prisma.student.findFirst({
      where: { personId: id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete the person - all related records will be automatically deleted due to cascade
    await prisma.person.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting student:", err);
    res
      .status(500)
      .json({ error: "Failed to delete student", message: err.message });
  }
});

// Warden Management
app.post("/api/wardens", validate(schemas.warden.create), async (req, res) => {
  const data = req.validated;
  try {
    const warden = await prisma.$transaction(async (prisma) => {
      // Create person with address and contact
      const newPerson = await prisma.person.create({
        data: {
          name: data.name,
          personType: "Warden",
          contactNo: data.contactNo,
          personalAddress: data.personalAddress
            ? { create: data.personalAddress }
            : undefined,
        },
        include: { personalAddress: true },
      });

      // Create warden record
      const newWarden = await prisma.warden.create({
        data: {
          personId: newPerson.id,
        },
      });

      // Create hostel assignment if provided
      if (data.hostelAssignment) {
        await prisma.hostelWardenAssignment.create({
          data: {
            wardenId: newWarden.id,
            hostelId: data.hostelAssignment.hostelId,
            assignmentDate: new Date(data.hostelAssignment.assignmentDate),
            endDate: data.hostelAssignment.endDate
              ? new Date(data.hostelAssignment.endDate)
              : null,
          },
        });
      }

      // Get the final warden with all relations
      const finalWarden = await prisma.warden.findUnique({
        where: { id: newWarden.id },
        include: {
          person: {
            include: {
              personalAddress: true,
            },
          },
          hostelAssignments: {
            include: {
              hostel: true,
            },
          },
        },
      });

      return finalWarden;
    });

    res.status(201).json(warden);
  } catch (err) {
    console.error("Error creating warden:", err);
    res
      .status(500)
      .json({ error: "Failed to create warden", message: err.message });
  }
});

app.put(
  "/api/wardens/:id",
  validate(schemas.warden.create),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.validated;

    try {
      // First, check if the warden exists
      const existingWarden = await prisma.warden.findFirst({
        where: { personId: id },
        include: {
          person: {
            include: {
              personalAddress: true,
            },
          },
          hostelAssignments: {
            where: { endDate: null },
            include: {
              hostel: true,
            },
          },
        },
      });

      if (!existingWarden) {
        return res.status(404).json({ error: "Warden not found" });
      }

      // Update person with upsert for address
      const updatedPerson = await prisma.person.update({
        where: { id },
        data: {
          name: data.name,
          contactNo: data.contactNo,
          personalAddress: data.personalAddress
            ? {
                upsert: {
                  create: {
                    ...data.personalAddress,
                    personId: id,
                  },
                  update: data.personalAddress,
                },
              }
            : undefined,
        },
        include: { personalAddress: true },
      });

      // Handle hostel assignment update if provided
      if (data.hostelAssignment) {
        // End the current assignment if exists
        if (existingWarden.hostelAssignments.length > 0) {
          await prisma.hostelWardenAssignment.update({
            where: { id: existingWarden.hostelAssignments[0].id },
            data: { endDate: new Date() },
          });
        }

        // Create new assignment
        await prisma.hostelWardenAssignment.create({
          data: {
            wardenId: existingWarden.id,
            hostelId: data.hostelAssignment.hostelId,
            assignmentDate: new Date(data.hostelAssignment.assignmentDate),
            endDate: data.hostelAssignment.endDate
              ? new Date(data.hostelAssignment.endDate)
              : null,
          },
        });
      }

      // Get the final updated warden with all relations
      const finalWarden = await prisma.warden.findFirst({
        where: { personId: id },
        include: {
          person: {
            include: {
              personalAddress: true,
            },
          },
          hostelAssignments: {
            include: {
              hostel: true,
            },
          },
        },
      });

      // Map the response to include personId as id for frontend compatibility
      const mappedWarden = {
        ...finalWarden,
        id: finalWarden.personId,
      };

      res.json(mappedWarden);
    } catch (err) {
      console.error("Error updating warden:", err);
      res
        .status(500)
        .json({ error: "Failed to update warden", message: err.message });
    }
  }
);

app.delete("/api/wardens/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // First, check if the warden exists
    const warden = await prisma.warden.findFirst({
      where: { personId: id },
    });

    if (!warden) {
      return res.status(404).json({ error: "Warden not found" });
    }

    // Delete the person - all related records will be automatically deleted due to cascade
    await prisma.person.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting warden:", err);
    res
      .status(500)
      .json({ error: "Failed to delete warden", message: err.message });
  }
});

// Attendant Management
app.post(
  "/api/attendants",
  validate(schemas.attendant.create),
  async (req, res) => {
    const data = req.validated;
    try {
      const attendant = await prisma.$transaction(async (prisma) => {
        // Create person with address and contact
        const newPerson = await prisma.person.create({
          data: {
            name: data.name,
            personType: "Attendant",
            contactNo: data.contactNo,
            personalAddress: data.personalAddress
              ? { create: data.personalAddress }
              : undefined,
          },
          include: { personalAddress: true },
        });

        // Create attendant record
        const newAttendant = await prisma.attendant.create({
          data: {
            personId: newPerson.id,
          },
        });

        // Create duties if provided
        if (data.duties && data.duties.length > 0) {
          await prisma.attendantDuty.createMany({
            data: data.duties.map((duty) => ({
              attendantId: newAttendant.id,
              hostelId: duty.hostelId,
              dutyType: duty.dutyType,
              shiftType: duty.shiftType,
              dutyDate: new Date(duty.dutyDate),
            })),
          });
        }

        // Get the final attendant with all relations
        const finalAttendant = await prisma.attendant.findUnique({
          where: { id: newAttendant.id },
          include: {
            person: {
              include: {
                personalAddress: true,
              },
            },
            duties: {
              include: {
                hostel: true,
              },
            },
          },
        });

        return finalAttendant;
      });

      res.status(201).json(attendant);
    } catch (err) {
      console.error("Error creating attendant:", err);
      res
        .status(500)
        .json({ error: "Failed to create attendant", message: err.message });
    }
  }
);

app.put(
  "/api/attendants/:id",
  validate(schemas.attendant.create),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.validated;

    try {
      // First, check if the attendant exists
      const existingAttendant = await prisma.attendant.findFirst({
        where: { personId: id },
        include: {
          person: {
            include: {
              personalAddress: true,
            },
          },
        },
      });

      if (!existingAttendant) {
        return res.status(404).json({ error: "Attendant not found" });
      }

      // Update person with upsert for address
      const updatedPerson = await prisma.person.update({
        where: { id },
        data: {
          name: data.name,
          contactNo: data.contactNo,
          personalAddress: data.personalAddress
            ? {
                upsert: {
                  create: {
                    ...data.personalAddress,
                    personId: id,
                  },
                  update: data.personalAddress,
                },
              }
            : undefined,
        },
        include: { personalAddress: true },
      });

      // Handle duties update if provided
      if (data.duties && data.duties.length > 0) {
        // Delete existing duties
        await prisma.attendantDuty.deleteMany({
          where: { attendantId: existingAttendant.id },
        });

        // Create new duties
        await prisma.attendantDuty.createMany({
          data: data.duties.map((duty) => ({
            attendantId: existingAttendant.id,
            hostelId: duty.hostelId,
            dutyType: duty.dutyType,
            shiftType: duty.shiftType,
            dutyDate: new Date(duty.dutyDate),
          })),
        });
      }

      // Get the final updated attendant with all relations
      const finalAttendant = await prisma.attendant.findFirst({
        where: { personId: id },
        include: {
          person: {
            include: {
              personalAddress: true,
            },
          },
          duties: {
            include: {
              hostel: true,
            },
          },
        },
      });

      // Map the response to include personId as id for frontend compatibility
      const mappedAttendant = {
        ...finalAttendant,
        id: finalAttendant.personId,
      };

      res.json(mappedAttendant);
    } catch (err) {
      console.error("Error updating attendant:", err);
      res
        .status(500)
        .json({ error: "Failed to update attendant", message: err.message });
    }
  }
);

app.delete("/api/attendants/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // First, check if the attendant exists
    const attendant = await prisma.attendant.findFirst({
      where: { personId: id },
    });

    if (!attendant) {
      return res.status(404).json({ error: "Attendant not found" });
    }

    // Delete the person - all related records will be automatically deleted due to cascade
    await prisma.person.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting attendant:", err);
    res
      .status(500)
      .json({ error: "Failed to delete attendant", message: err.message });
  }
});

// Hostel Management
app.post("/api/hostels", validate(schemas.hostel.create), async (req, res) => {
  const data = req.validated;
  try {
    const hostel = await prisma.$transaction(async (prisma) => {
      // Create hostel with address and contact
      const newHostel = await prisma.hostel.create({
        data: {
          name: data.name,
          contactNo: data.contactNo,
          hostelAddress: data.address ? { create: data.address } : undefined,
        },
        include: { hostelAddress: true },
      });

      // Create rooms if specified
      if (data.rooms) {
        const rooms = Object.entries(data.rooms)
          .filter(([_, count]) => count > 0)
          .flatMap(([type, count]) =>
            Array.from({ length: count }, () => ({
              hostelId: newHostel.id,
              roomType: type,
              capacity: ROOM_DEFAULTS[type],
            }))
          );

        if (rooms.length > 0) {
          await prisma.room.createMany({ data: rooms });
        }
      }

      return newHostel;
    });

    res.status(201).json(hostel);
  } catch (err) {
    console.error("Error creating hostel:", err);
    res
      .status(500)
      .json({ error: "Failed to create hostel", message: err.message });
  }
});

app.get("/api/hostels", async (req, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        hostelAddress: true,
        rooms: {
          include: {
            allocations: {
              where: { endDate: null },
              include: { student: true },
            },
          },
        },
        wardenAssignments: {
          where: { endDate: null },
          include: { warden: true },
        },
        attendantDuties: {
          include: {
            attendant: {
              include: {
                person: true,
              },
            },
          },
        },
      },
    });

    // Transform the data to include counts
    const hostelsWithCounts = hostels.map((hostel) => {
      const activeWardens = hostel.wardenAssignments.length;
      const activeStudents = hostel.rooms.reduce(
        (count, room) => count + room.allocations.length,
        0
      );
      // Count unique attendants based on their person IDs, regardless of duty dates
      const activeAttendants = new Set(
        hostel.attendantDuties.map((duty) => duty.attendant.person.id)
      ).size;

      return {
        ...hostel,
        wardenCount: activeWardens,
        studentCount: activeStudents,
        attendantCount: activeAttendants,
      };
    });

    res.json(hostelsWithCounts);
  } catch (err) {
    console.error("Error fetching hostels:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch hostels", message: err.message });
  }
});

app.get("/api/hostels/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const hostel = await prisma.hostel.findUnique({
    where: { id },
    include: { hostelAddress: true, rooms: true },
  });

  if (!hostel) {
    return res.status(404).json({ error: "Hostel not found" });
  }

  res.json(hostel);
});

// Get rooms for a specific hostel
app.get("/api/hostels/:id/rooms", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // First check if the hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id },
    });

    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    // Get all rooms for this hostel
    const rooms = await prisma.room.findMany({
      where: { hostelId: id },
      include: {
        allocations: {
          where: { endDate: null },
          include: {
            student: {
              include: {
                person: true,
              },
            },
          },
        },
      },
    });

    res.json(rooms);
  } catch (err) {
    console.error("Error fetching hostel rooms:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch hostel rooms", message: err.message });
  }
});

app.put(
  "/api/hostels/:id",
  validate(schemas.hostel.update),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.validated;

    try {
      // Check if hostel exists
      const existingHostel = await prisma.hostel.findUnique({
        where: { id },
        include: {
          hostelAddress: true,
          rooms: {
            include: {
              allocations: {
                where: { endDate: null },
              },
            },
          },
        },
      });

      if (!existingHostel) {
        return res.status(404).json({ error: "Hostel not found" });
      }

      // Update hostel and rooms in a transaction
      const updatedHostel = await prisma.$transaction(async (tx) => {
        // Update hostel with upsert for address
        const hostel = await tx.hostel.update({
          where: { id },
          data: {
            name: data.name,
            contactNo: data.contactNo,
            hostelAddress: data.address
              ? {
                  upsert: {
                    create: data.address,
                    update: data.address,
                  },
                }
              : undefined,
          },
          include: { hostelAddress: true, rooms: true },
        });

        // Handle room updates if provided
        if (data.rooms) {
          // Get current room counts by type
          const currentRoomCounts = existingHostel.rooms.reduce((acc, room) => {
            acc[room.roomType] = (acc[room.roomType] || 0) + 1;
            return acc;
          }, {});

          // Get rooms with active allocations by type
          const roomsWithAllocations = existingHostel.rooms.reduce(
            (acc, room) => {
              if (room.allocations.length > 0) {
                acc[room.roomType] = (acc[room.roomType] || 0) + 1;
              }
              return acc;
            },
            {}
          );

          // Check if we're trying to decrease room counts below allocated rooms
          const invalidDecreases = Object.entries(data.rooms).some(
            ([type, newCount]) => {
              const currentCount = currentRoomCounts[type] || 0;
              const allocatedCount = roomsWithAllocations[type] || 0;
              return newCount < allocatedCount;
            }
          );

          if (invalidDecreases) {
            throw new Error(
              "Cannot decrease room counts below currently allocated rooms. " +
                "Please ensure you maintain enough rooms for all current residents."
            );
          }

          // Delete rooms that are being removed (only those without allocations)
          const roomsToDelete = existingHostel.rooms.filter((room) => {
            const newCount = data.rooms[room.roomType] || 0;
            const currentCount = currentRoomCounts[room.roomType] || 0;
            return room.allocations.length === 0 && newCount < currentCount;
          });

          if (roomsToDelete.length > 0) {
            await tx.room.deleteMany({
              where: {
                id: {
                  in: roomsToDelete.map((room) => room.id),
                },
              },
            });
          }

          // Create new rooms for increased counts
          const newRooms = Object.entries(data.rooms).flatMap(
            ([type, count]) => {
              const currentCount = currentRoomCounts[type] || 0;
              const increase = count - currentCount;
              if (increase <= 0) return [];

              return Array.from({ length: increase }, () => ({
                hostelId: id,
                roomType: type,
                capacity: ROOM_DEFAULTS[type],
                furnitureDetails: `Standard ${type.toLowerCase()} room`,
              }));
            }
          );

          if (newRooms.length > 0) {
            await tx.room.createMany({ data: newRooms });
          }

          // Fetch the updated hostel with all rooms
          return await tx.hostel.findUnique({
            where: { id },
            include: { hostelAddress: true, rooms: true },
          });
        }

        return hostel;
      });

      res.json(updatedHostel);
    } catch (err) {
      console.error("Error updating hostel:", err);
      res
        .status(500)
        .json({ error: "Failed to update hostel", message: err.message });
    }
  }
);

app.delete("/api/hostels/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Check if there are any active room allocations
    const hostel = await prisma.hostel.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            allocations: {
              where: { endDate: null },
            },
          },
        },
      },
    });

    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    // Check if any rooms have active allocations
    const hasActiveAllocations = hostel.rooms.some(
      (room) => room.allocations.length > 0
    );
    if (hasActiveAllocations) {
      return res.status(400).json({
        error: "Cannot delete hostel with active room allocations",
      });
    }

    // Delete the hostel - all related records will be automatically deleted due to cascade
    await prisma.hostel.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting hostel:", err);
    res
      .status(500)
      .json({ error: "Failed to delete hostel", message: err.message });
  }
});

app.get("/api/hostels/stats", async (req, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        rooms: {
          include: {
            _count: { select: { allocations: { where: { endDate: null } } } },
          },
        },
      },
    });

    const stats = hostels.map((hostel) => {
      let totalCapacity = 0;
      let totalOccupied = 0;
      const roomTypes = {};

      hostel.rooms.forEach((room) => {
        const type = room.roomType;
        const occupied = room._count.allocations;
        const available = room.capacity - occupied;

        roomTypes[type] = roomTypes[type] || {
          count: 0,
          capacity: 0,
          occupied: 0,
          available: 0,
        };
        roomTypes[type].count++;
        roomTypes[type].capacity += room.capacity;
        roomTypes[type].occupied += occupied;
        roomTypes[type].available += available;

        totalCapacity += room.capacity;
        totalOccupied += occupied;
      });

      const occupancyRate =
        totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

      return {
        hostelId: hostel.id,
        name: hostel.name,
        totalRooms: hostel.rooms.length,
        totalCapacity,
        totalOccupied,
        available: totalCapacity - totalOccupied,
        occupancyRate: parseFloat(occupancyRate.toFixed(2)),
        roomTypes,
      };
    });

    res.json(stats);
  } catch (err) {
    console.error("Error fetching hostel stats:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch hostel stats", message: err.message });
  }
});

// Dashboard API Endpoints
app.get("/api/dashboard/occupancy", async (req, res) => {
  try {
    // Get all hostels with rooms and allocations
    const hostels = await prisma.hostel.findMany({
      include: {
        rooms: {
          include: {
            _count: { select: { allocations: { where: { endDate: null } } } },
          },
        },
      },
    });

    // Get total students count
    const totalStudents = await prisma.student.count();

    // Get total hostels count
    const totalHostels = hostels.length;

    // Calculate total rooms and available rooms
    let totalRooms = 0;
    let occupiedRooms = 0;

    hostels.forEach((hostel) => {
      totalRooms += hostel.rooms.length;
      occupiedRooms += hostel.rooms.reduce(
        (sum, room) => sum + room._count.allocations,
        0
      );
    });

    const availableRooms = totalRooms - occupiedRooms;

    // Calculate occupancy rate
    const occupancyRate =
      totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // Get room type distribution
    const roomTypes = await prisma.room.groupBy({
      by: ["roomType"],
      _count: {
        id: true,
      },
    });

    const roomTypeDistribution = roomTypes.map((type) => ({
      name: type.roomType,
      value: type._count.id,
    }));

    res.json({
      totalStudents,
      totalHostels,
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      roomTypeDistribution,
      hostels: hostels.map((hostel) => ({
        id: hostel.id,
        name: hostel.name,
        totalRooms: hostel.rooms.length,
        occupied: hostel.rooms.reduce(
          (sum, room) => sum + room._count.allocations,
          0
        ),
      })),
    });
  } catch (err) {
    console.error("Error fetching occupancy data:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch occupancy data", message: err.message });
  }
});

app.get("/api/dashboard/financial", async (req, res) => {
  try {
    const bills = await prisma.messBill.findMany();

    // Convert Decimal to Number for JSON serialization with proper precision
    const totalGenerated = bills.reduce(
      (sum, b) => sum + Number(b.billAmount),
      0
    );

    const totalPaid = bills
      .filter((b) => b.status === "PAID")
      .reduce((sum, b) => sum + Number(b.billAmount), 0);

    // Format the amounts properly for JSON response
    const formatAmount = (amount) => {
      // Ensure consistent decimal precision
      return parseFloat(amount.toFixed(2));
    };

    res.json({
      totalGenerated: formatAmount(totalGenerated),
      totalPaid: formatAmount(totalPaid),
      totalOverdue: formatAmount(totalGenerated - totalPaid),
      billCount: bills.length,
      paidBillCount: bills.filter((b) => b.status === "PAID").length,
      overdueBillCount: bills.filter((b) => b.status === "OVERDUE").length,
    });
  } catch (err) {
    console.error("Error fetching financial data:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch financial data", message: err.message });
  }
});

// Student Management
app.get("/api/students", async (req, res) => {
  try {
    const { unallocated } = req.query;

    // Base query to get students with their person details
    const baseQuery = {
      include: {
        person: {
          include: {
            personalAddress: true,
          },
        },
      },
    };

    // If unallocated=true, filter for students without active room allocations
    if (unallocated === "true") {
      const students = await prisma.student.findMany({
        ...baseQuery,
        where: {
          NOT: {
            roomAllocations: {
              some: {
                endDate: null,
              },
            },
          },
        },
      });

      // Map the response to include personId as id for frontend compatibility
      const mappedStudents = students.map((student) => ({
        ...student,
        id: student.personId,
      }));

      return res.json(mappedStudents);
    }

    // Otherwise, return all students
    const students = await prisma.student.findMany(baseQuery);

    // Map the response to include personId as id for frontend compatibility
    const mappedStudents = students.map((student) => ({
      ...student,
      id: student.personId,
    }));

    res.json(mappedStudents);
  } catch (err) {
    console.error("Error fetching students:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch students", message: err.message });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const personId = parseInt(req.params.id);

    // Find the student by personId
    const student = await prisma.student.findFirst({
      where: { personId },
      include: {
        person: {
          include: {
            personalAddress: true,
          },
        },
        roomAllocations: {
          include: {
            room: {
              include: {
                hostel: true,
              },
            },
          },
        },
        messBills: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Map the response to include personId as id for frontend compatibility
    const mappedStudent = {
      ...student,
      id: student.personId,
    };

    res.json(mappedStudent);
  } catch (err) {
    console.error("Error fetching student:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch student", message: err.message });
  }
});

// Warden Management
app.get("/api/wardens", async (req, res) => {
  try {
    const wardens = await prisma.warden.findMany({
      include: {
        person: {
          include: {
            personalAddress: true,
          },
        },
        hostelAssignments: {
          include: {
            hostel: true,
          },
        },
      },
    });

    // Map the response to include personId as id for frontend compatibility
    const mappedWardens = wardens.map((warden) => ({
      ...warden,
      id: warden.personId,
    }));

    res.json(mappedWardens);
  } catch (err) {
    console.error("Error fetching wardens:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch wardens", message: err.message });
  }
});

app.get("/api/wardens/:wardenId/hostel-assignments", async (req, res) => {
  const personId = parseInt(req.params.wardenId);

  try {
    // Check if warden exists
    const warden = await prisma.warden.findFirst({
      where: { personId },
    });

    if (!warden) {
      return res.status(404).json({ error: "Warden not found" });
    }

    // Get warden assignments
    const assignments = await prisma.hostelWardenAssignment.findMany({
      where: { wardenId: warden.id },
      include: {
        hostel: true,
      },
      orderBy: {
        assignmentDate: "desc",
      },
    });

    res.status(200).json(assignments);
  } catch (err) {
    console.error("Error fetching warden assignments:", err);
    res.status(500).json({
      error: "Failed to fetch warden assignments",
      message: err.message,
    });
  }
});

// Attendant Management
app.get("/api/attendants", async (req, res) => {
  try {
    const attendants = await prisma.attendant.findMany({
      include: {
        person: {
          include: {
            personalAddress: true,
          },
        },
        duties: {
          include: {
            hostel: true,
          },
        },
      },
    });

    // Map the response to include personId as id for frontend compatibility
    const mappedAttendants = attendants.map((attendant) => ({
      ...attendant,
      id: attendant.personId,
    }));

    res.json(mappedAttendants);
  } catch (err) {
    console.error("Error fetching attendants:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch attendants", message: err.message });
  }
});

app.get("/api/attendants/:id", async (req, res) => {
  try {
    const personId = parseInt(req.params.id);

    // Find the attendant by personId
    const attendant = await prisma.attendant.findFirst({
      where: { personId },
      include: {
        person: {
          include: {
            personalAddress: true,
          },
        },
        duties: {
          include: {
            hostel: true,
          },
        },
      },
    });

    if (!attendant) {
      return res.status(404).json({ error: "Attendant not found" });
    }

    // Map the response to include personId as id for frontend compatibility
    const mappedAttendant = {
      ...attendant,
      id: attendant.personId,
    };

    res.json(mappedAttendant);
  } catch (err) {
    console.error("Error fetching attendant:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch attendant", message: err.message });
  }
});

// Warden Assignment to Hostel
app.post("/api/hostel-warden-assignments", async (req, res) => {
  const { hostelId, wardenId, assignmentDate, endDate } = req.body;

  try {
    // Validate input
    if (!hostelId || !wardenId || !assignmentDate) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Hostel ID, Warden ID, and Assignment Date are required",
      });
    }

    // Check if hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: parseInt(hostelId) },
    });

    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    // Check if warden exists
    const warden = await prisma.warden.findFirst({
      where: { personId: parseInt(wardenId) },
    });

    if (!warden) {
      return res.status(404).json({ error: "Warden not found" });
    }

    // Create warden assignment
    const assignment = await prisma.hostelWardenAssignment.create({
      data: {
        hostelId: parseInt(hostelId),
        wardenId: warden.id,
        assignmentDate: new Date(assignmentDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        hostel: true,
        warden: {
          include: {
            person: true,
          },
        },
      },
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Error assigning warden to hostel:", err);
    res.status(500).json({
      error: "Failed to assign warden to hostel",
      message: err.message,
    });
  }
});

// Update warden assignment
app.put("/api/hostel-warden-assignments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { endDate } = req.body;

  try {
    // Check if assignment exists
    const existingAssignment = await prisma.hostelWardenAssignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Update assignment
    const updatedAssignment = await prisma.hostelWardenAssignment.update({
      where: { id },
      data: {
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        hostel: true,
        warden: {
          include: {
            person: true,
          },
        },
      },
    });

    res.status(200).json(updatedAssignment);
  } catch (err) {
    console.error("Error updating warden assignment:", err);
    res.status(500).json({
      error: "Failed to update warden assignment",
      message: err.message,
    });
  }
});

// Get warden assignments for a hostel
app.get("/api/hostels/:hostelId/warden-assignments", async (req, res) => {
  const hostelId = parseInt(req.params.hostelId);

  try {
    // Check if hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    // Get warden assignments
    const assignments = await prisma.hostelWardenAssignment.findMany({
      where: { hostelId },
      include: {
        warden: {
          include: {
            person: true,
          },
        },
      },
      orderBy: [
        {
          assignmentDate: "desc",
        },
      ],
    });

    res.status(200).json(assignments);
  } catch (err) {
    console.error("Error fetching warden assignments:", err);
    res.status(500).json({
      error: "Failed to fetch warden assignments",
      message: err.message,
    });
  }
});

// Attendant Duties Management
app.post("/api/attendant-duties", async (req, res) => {
  const { attendantId, hostelId, dutyType, shiftType, dutyDate } = req.body;

  try {
    // Validate input
    if (!attendantId || !hostelId || !dutyType || !shiftType || !dutyDate) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "Attendant ID, Hostel ID, Duty Type, Shift Type, and Duty Date are required",
      });
    }

    // Check if attendant exists
    const attendant = await prisma.attendant.findFirst({
      where: { personId: parseInt(attendantId) },
    });

    if (!attendant) {
      return res.status(404).json({ error: "Attendant not found" });
    }

    // Check if hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: parseInt(hostelId) },
    });

    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    // Create attendant duty
    const duty = await prisma.attendantDuty.create({
      data: {
        attendantId: attendant.id,
        hostelId: parseInt(hostelId),
        dutyType,
        shiftType,
        dutyDate: new Date(dutyDate),
      },
      include: {
        attendant: {
          include: {
            person: true,
          },
        },
        hostel: true,
      },
    });

    res.status(201).json(duty);
  } catch (err) {
    console.error("Error creating attendant duty:", err);
    res.status(500).json({
      error: "Failed to create attendant duty",
      message: err.message,
    });
  }
});

// Update attendant duty
app.put("/api/attendant-duties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { dutyType, shiftType, dutyDate } = req.body;

  try {
    // Check if duty exists
    const existingDuty = await prisma.attendantDuty.findUnique({
      where: { id },
    });

    if (!existingDuty) {
      return res.status(404).json({ error: "Duty not found" });
    }

    // Update duty
    const updatedDuty = await prisma.attendantDuty.update({
      where: { id },
      data: {
        dutyType,
        shiftType,
        dutyDate: new Date(dutyDate),
      },
      include: {
        attendant: {
          include: {
            person: true,
          },
        },
        hostel: true,
      },
    });

    res.status(200).json(updatedDuty);
  } catch (err) {
    console.error("Error updating attendant duty:", err);
    res.status(500).json({
      error: "Failed to update attendant duty",
      message: err.message,
    });
  }
});

// Delete attendant duty
app.delete("/api/attendant-duties/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Check if duty exists
    const existingDuty = await prisma.attendantDuty.findUnique({
      where: { id },
    });

    if (!existingDuty) {
      return res.status(404).json({ error: "Duty not found" });
    }

    // Delete duty
    await prisma.attendantDuty.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting attendant duty:", err);
    res.status(500).json({
      error: "Failed to delete attendant duty",
      message: err.message,
    });
  }
});

// Get attendant duties for an attendant
app.get("/api/attendants/:attendantId/duties", async (req, res) => {
  const personId = parseInt(req.params.attendantId);

  try {
    // Check if attendant exists
    const attendant = await prisma.attendant.findFirst({
      where: { personId },
    });

    if (!attendant) {
      return res.status(404).json({ error: "Attendant not found" });
    }

    // Get attendant duties
    const duties = await prisma.attendantDuty.findMany({
      where: { attendantId: attendant.id },
      include: {
        hostel: true,
      },
      orderBy: {
        dutyDate: "desc",
      },
    });

    res.status(200).json(duties);
  } catch (err) {
    console.error("Error fetching attendant duties:", err);
    res.status(500).json({
      error: "Failed to fetch attendant duties",
      message: err.message,
    });
  }
});

// Get attendant duties for a hostel
app.get("/api/hostels/:hostelId/attendant-duties", async (req, res) => {
  const hostelId = parseInt(req.params.hostelId);

  try {
    // Check if hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    // Get attendant duties
    const duties = await prisma.attendantDuty.findMany({
      where: { hostelId },
      include: {
        attendant: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        dutyDate: "desc",
      },
    });

    res.status(200).json(duties);
  } catch (err) {
    console.error("Error fetching attendant duties:", err);
    res.status(500).json({
      error: "Failed to fetch attendant duties",
      message: err.message,
    });
  }
});

// Mess Bill Management
app.get("/api/bills", async (req, res) => {
  try {
    const { status, studentId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    console.log("Fetching bills with query:", { where });

    // First try a simple query without includes or ordering
    const bills = await prisma.messBill.findMany({
      where,
    });

    console.log(`Found ${bills.length} bills`);

    // If successful, try with includes
    const billsWithDetails = await prisma.messBill.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            person: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          billGenerationDate: "desc",
        },
      ],
    });

    res.json(billsWithDetails);
  } catch (error) {
    console.error("Error fetching bills:", error);
    // Log more details about the error
    if (error.code) console.error("Error code:", error.code);
    if (error.meta) console.error("Error meta:", error.meta);
    res
      .status(500)
      .json({ error: "Failed to fetch bills", details: error.message });
  }
});

app.get("/api/bills/:id", async (req, res) => {
  try {
    const bill = await prisma.messBill.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        student: {
          select: {
            id: true,
            person: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ error: "Failed to fetch bill" });
  }
});

app.post("/api/bills", async (req, res) => {
  try {
    // Validate the request body
    const validatedData = schemas.bill.parse(req.body);

    // Convert string dates to Date objects
    const billData = {
      ...validatedData,
      billGenerationDate: new Date(validatedData.billGenerationDate),
      dueDate: new Date(validatedData.dueDate),
    };

    console.log("Creating bill with data:", billData);

    const bill = await prisma.messBill.create({
      data: billData,
      include: {
        student: {
          select: {
            id: true,
            person: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(bill);
  } catch (error) {
    console.error("Error creating bill:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }
    res
      .status(500)
      .json({ error: "Failed to create bill", details: error.message });
  }
});

app.put("/api/bills/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if bill exists
    const existingBill = await prisma.messBill.findUnique({
      where: { id },
    });

    if (!existingBill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // Validate the request body
    const validatedData = schemas.billUpdate.parse(req.body);

    // Remove billId from the data before passing to Prisma
    const { billId, ...updateData } = validatedData;

    // Convert string dates to Date objects if provided
    const billData = { ...updateData };
    if (req.body.billGenerationDate) {
      billData.billGenerationDate = new Date(req.body.billGenerationDate);
    }
    if (req.body.dueDate) {
      billData.dueDate = new Date(req.body.dueDate);
    }
    if (req.body.billDepositDate) {
      billData.billDepositDate = new Date(req.body.billDepositDate);
    }

    console.log("Updating bill with data:", billData);

    const bill = await prisma.messBill.update({
      where: { id },
      data: billData,
      include: {
        student: {
          select: {
            id: true,
            person: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.json(bill);
  } catch (error) {
    console.error("Error updating bill:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }
    res
      .status(500)
      .json({ error: "Failed to update bill", details: error.message });
  }
});

app.delete("/api/bills/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if bill exists
    const existingBill = await prisma.messBill.findUnique({
      where: { id },
    });

    if (!existingBill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    await prisma.messBill.delete({
      where: { id },
    });

    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting bill:", error);
    res
      .status(500)
      .json({ error: "Failed to delete bill", details: error.message });
  }
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
