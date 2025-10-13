import DashboardService from "../services/dashboard.service.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const dashboardData = await DashboardService.getDashboardData(userId);

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getRecommendedProfiles = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, filters = {} } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const profiles = await DashboardService.getRecommendedProfiles(
      userId,
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error("Recommended profiles error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const stats = await DashboardService.getDashboardStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getQuickFilters = async (req, res) => {
  try {
    const userId = req.user?.id;
    const filters = await DashboardService.getQuickFilters(userId);

    res.status(200).json({
      success: true,
      data: filters,
    });
  } catch (error) {
    console.error("Quick filters error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
