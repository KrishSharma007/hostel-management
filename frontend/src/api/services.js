import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Person Service
export const PersonService = {
  getAll: async (type = null) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);

    const response = await api.get(
      `/persons${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/persons/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/persons", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/persons/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/persons/${id}`);
    return true;
  },
};

// Student Service
export const StudentService = {
  getAll: async (unallocated = false) => {
    const response = await api.get(
      `/students${unallocated ? "?unallocated=true" : ""}`
    );
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/students", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/students/${id}`);
    return true;
  },
};

// Warden Service
export const WardenService = {
  getAll: async () => {
    const response = await api.get("/wardens");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/wardens/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/wardens", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/wardens/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/wardens/${id}`);
    return true;
  },
};

// Attendant Service
export const AttendantService = {
  getAll: async () => {
    const response = await api.get("/attendants");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/attendants/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/attendants", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/attendants/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/attendants/${id}`);
    return true;
  },
};

// Hostel Service
export const HostelService = {
  getAll: async () => {
    const response = await api.get("/hostels");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/hostels/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/hostels", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/hostels/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/hostels/${id}`);
    return true;
  },
  getRooms: async (id) => {
    const response = await api.get(`/hostels/${id}/rooms`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/hostels/stats");
    return response.data;
  },
};

// Room Service
export const RoomService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.roomType) params.append("roomType", filters.roomType);
    if (filters.academicYear)
      params.append("academicYear", filters.academicYear);

    const response = await api.get(
      `/rooms${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },
};

// Room Allocation Service
export const RoomAllocationService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.roomId) params.append("roomId", filters.roomId);
    if (filters.studentId) params.append("studentId", filters.studentId);
    if (filters.status) params.append("status", filters.status);

    const response = await api.get(
      `/room-allocations${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/room-allocations/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/room-allocations", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/room-allocations/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/room-allocations/${id}`);
    return true;
  },
};

// Allocation Service
export const AllocationService = {
  create: async (data) => {
    const response = await api.post("/allocations", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/allocations/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/allocations/${id}`);
    return true;
  },
};

// Mess Bill Service
export const MessBillService = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/bills?${queryString}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/bills", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/bills/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },
};

// Warden Assignment Service
export const WardenAssignmentService = {
  create: async (data) => {
    const response = await api.post("/hostel-warden-assignments", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/hostel-warden-assignments/${id}`, data);
    return response.data;
  },
  getByHostel: async (hostelId) => {
    const response = await api.get(`/hostels/${hostelId}/warden-assignments`);
    return response.data;
  },
  getByWarden: async (wardenId) => {
    const response = await api.get(`/wardens/${wardenId}/hostel-assignments`);
    return response.data;
  },
};

// Attendant Duty Service
export const AttendantDutyService = {
  create: async (data) => {
    const response = await api.post("/attendant-duties", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/attendant-duties/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/attendant-duties/${id}`);
    return true;
  },
  getByAttendant: async (attendantId) => {
    const response = await api.get(`/attendants/${attendantId}/duties`);
    return response.data;
  },
  getByHostel: async (hostelId) => {
    const response = await api.get(`/hostels/${hostelId}/attendant-duties`);
    return response.data;
  },
};

// Dashboard Service
export const DashboardService = {
  getStats: async () => {
    try {
      const [occupancyData, financialData] = await Promise.all([
        api.get("/dashboard/occupancy"),
        api.get("/dashboard/financial"),
      ]);

      return {
        totalStudents: occupancyData.data.totalStudents,
        totalHostels: occupancyData.data.totalHostels,
        availableRooms: occupancyData.data.availableRooms,
        pendingBills: financialData.data.totalOverdue,
        occupancyRate: occupancyData.data.occupancyRate,
        roomTypeDistribution: occupancyData.data.roomTypeDistribution,
        recentActivities: [
          `Occupancy Rate: ${occupancyData.data.occupancyRate.toFixed(2)}%`,
          `Total Bills Generated: ${financialData.data.totalGenerated.toFixed(
            2
          )}`,
          `Total Bills Paid: ${financialData.data.totalPaid.toFixed(2)}`,
          `Overdue Bills: ${financialData.data.totalOverdue.toFixed(2)}`,
        ],
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      throw new Error("Failed to fetch dashboard statistics");
    }
  },
};
