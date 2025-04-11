import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  Home as HomeIcon,
  MeetingRoom as RoomIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { DashboardService } from "../api/services";
import LoadingOverlay from "./LoadingOverlay";

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        {React.cloneElement(icon, { sx: { color, mr: 1 } })}
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardService.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingOverlay message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={<PeopleIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Hostels"
            value={stats?.totalHostels || 0}
            icon={<HomeIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Rooms"
            value={stats?.availableRooms || 0}
            icon={<RoomIcon />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Bills"
            value={`₹${stats?.pendingBills || 0}`}
            icon={<PaymentIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Recent Activities
        </Typography>
        <Paper sx={{ p: 2 }}>
          {stats?.recentActivities?.length > 0 ? (
            stats.recentActivities.map((activity, index) => {
              if (
                activity.includes("Total Bills Generated") ||
                activity.includes("Total Bills Paid") ||
                activity.includes("Overdue Bills")
              ) {
                const [prefix, amount] = activity.split(": ");
                return (
                  <Box key={index} mb={2}>
                    <Typography variant="body1">
                      {prefix}: ₹{amount}
                    </Typography>
                  </Box>
                );
              }
              return (
                <Box key={index} mb={2}>
                  <Typography variant="body1">{activity}</Typography>
                </Box>
              );
            })
          ) : (
            <Typography color="text.secondary">No recent activities</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
