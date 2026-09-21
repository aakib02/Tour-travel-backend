import mongoose from "mongoose";

import Package from "../../models/package/index.js";
import Enquiry from "../../models/enquiry/index.js";
import CustomizePackage from "../../models/customizePackage/index.js";
import City from "../../models/city/index.js";
import State from "../../models/state/index.js";
import Country from "../../models/country/index.js";
import Hotel from "../../models/hotel/index.js";
import Attraction from "../../models/attraction/index.js";
import Activity from "../../models/activity/index.js";
import Vehicle from "../../models/vehicle/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";

// ================================================================
// GET DASHBOARD STATS
// Aggregated metrics, recent leads, and analytics for Admin Dashboard
// ================================================================

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Parallel KPI Counts
    const [
      totalPackages,
      publishedPackages,
      draftPackages,
      totalEnquiries,
      newEnquiries,
      repliedEnquiries,
      closedEnquiries,
      totalCustomPackages,
      newCustomPackages,
      confirmedCustomPackages,
      totalCities,
      totalStates,
      totalCountries,
      totalHotels,
      totalAttractions,
      totalActivities,
      totalVehicles,
    ] = await Promise.all([
      Package.countDocuments({ isActive: true }),
      Package.countDocuments({ isActive: true, status: "published" }),
      Package.countDocuments({ isActive: true, status: "draft" }),
      Enquiry.countDocuments({ isActive: true }),
      Enquiry.countDocuments({ isActive: true, status: "new" }),
      Enquiry.countDocuments({ isActive: true, status: "replied" }),
      Enquiry.countDocuments({ isActive: true, status: "closed" }),
      CustomizePackage.countDocuments({ isActive: true }),
      CustomizePackage.countDocuments({
        isActive: true,
        status: { $in: ["submitted", "draft"] },
      }),
      CustomizePackage.countDocuments({ isActive: true, status: "confirmed" }),
      City.countDocuments({ isActive: true }),
      State.countDocuments({ isActive: true }),
      Country.countDocuments({ isActive: true }),
      Hotel.countDocuments({ isActive: true }),
      Attraction.countDocuments({ isActive: true }),
      Activity.countDocuments({ isActive: true }),
      Vehicle.countDocuments({ isActive: true }),
    ]);

    // 2. Recent Enquiries (Latest 6)
    const recentEnquiries = await Enquiry.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("name email phone subject status createdAt message")
      .lean();

    // 3. Recent Custom Packages (Latest 6)
    const recentCustomPackages = await CustomizePackage.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("destinations.cityId", "name")
      .select("customer travelerType totalDays totalNights startDate status createdAt")
      .lean();

    // 4. Package Type Distribution
    const packageTypeCounts = await Package.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$packageType", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // 5. Enquiry Status Distribution
    const enquiryStatusCounts = await Enquiry.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } },
    ]);

    // 6. Monthly Trends (Past 6 months for Enquiries & Custom Inquiries)
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [enquiriesMonthlyRaw, customMonthlyRaw] = await Promise.all([
      Enquiry.aggregate([
        {
          $match: {
            isActive: true,
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      CustomizePackage.aggregate([
        {
          $match: {
            isActive: true,
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Build timeline for all 6 past months with 0 default
    const monthlyTrends = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-12
      const monthLabel = `${monthNames[d.getMonth()]} ${String(y).slice(-2)}`;

      const enqMatch = enquiriesMonthlyRaw.find(
        (r) => r._id.year === y && r._id.month === m
      );
      const custMatch = customMonthlyRaw.find(
        (r) => r._id.year === y && r._id.month === m
      );

      monthlyTrends.push({
        month: monthLabel,
        enquiries: enqMatch ? enqMatch.count : 0,
        customTours: custMatch ? custMatch.count : 0,
        totalLeads: (enqMatch ? enqMatch.count : 0) + (custMatch ? custMatch.count : 0),
      });
    }

    // 7. Structured Response Data
    const dashboardData = {
      counts: {
        packages: {
          total: totalPackages,
          published: publishedPackages,
          draft: draftPackages,
        },
        enquiries: {
          total: totalEnquiries,
          new: newEnquiries,
          replied: repliedEnquiries,
          closed: closedEnquiries,
        },
        customPackages: {
          total: totalCustomPackages,
          new: newCustomPackages,
          confirmed: confirmedCustomPackages,
        },
        inventory: {
          cities: totalCities,
          states: totalStates,
          countries: totalCountries,
          hotels: totalHotels,
          attractions: totalAttractions,
          activities: totalActivities,
          vehicles: totalVehicles,
        },
      },
      recentEnquiries,
      recentCustomPackages,
      packageTypeDistribution: packageTypeCounts,
      enquiryStatusDistribution: enquiryStatusCounts,
      monthlyTrends,
    };

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Dashboard stats fetched successfully",
      dashboardData
    );
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message || "Failed to fetch dashboard stats"
    );
  }
};
