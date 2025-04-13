import axios from "axios";

const API_URL = "https://hostel-management-we8d.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


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
};


// Mess Bill Service
export const MessBillService = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/bills?${queryString}`);
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
