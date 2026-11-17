import * as XLSX from "xlsx";
import mongoose from "mongoose";

import Package from "../../models/package/index.js";
import State from "../../models/state/index.js";
import City from "../../models/city/index.js";
import Country from "../../models/country/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";
import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";

// ================================================================
// SLUG GENERATOR HELPER
// ================================================================
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// ================================================================
// 1. DOWNLOAD SAMPLE EXCEL / CSV TEMPLATE
// ================================================================
export const downloadPackageTemplate = async (req, res) => {
  try {
    const format = (req.query.format || "xlsx").toLowerCase();

    // Fetch existing cities and states to populate reference sheet
    const [states, cities] = await Promise.all([
      State.find({ isActive: true }).select("name code region").sort({ name: 1 }).lean(),
      City.find({ isActive: true })
        .populate("stateId", "name")
        .select("name stateId")
        .sort({ name: 1 })
        .lean(),
    ]);

    // Sample data rows to guide the user
    const sampleRows = [
      {
        "title*": "Golden Triangle Classical Tour",
        "tagline": "Explore Delhi, Agra & Jaipur in 4 Memorable Days",
        "packageType": "private", // private, group, family, honeymoon, luxury
        "days*": 4,
        "nights*": 3,
        "states": "Delhi, Uttar Pradesh, Rajasthan",
        "cities": "New Delhi, Agra, Jaipur",
        "startLocation": "New Delhi",
        "endLocation": "Jaipur",
        "priceStandard": 12500,
        "priceDeluxe": 18500,
        "priceLuxury": 27000,
        "currency": "INR",
        "highlights": "Sunrise visit to the iconic Taj Mahal | Rickshaw safari through Old Delhi bazaars | Elephant/Jeep ascent to Amber Fort | Guided tour of Agra Fort & Fatehpur Sikri",
        "inclusions": "Private AC sedan with experienced chauffeur | 3-star / 4-star boutique hotel accommodation | Daily breakfast buffet | All interstate toll, fuel & parking taxes | Monument entry assistance",
        "exclusions": "International or domestic flight tickets | Monument entry tickets | Personal expenses, alcoholic beverages & driver gratuities",
        "itinerary": "Day 1: Arrival in Delhi - Sightseeing of Jama Masjid, Red Fort, and India Gate | Day 2: Delhi to Agra - Drive to Agra, visit Agra Fort and sunset at Mehtab Bagh | Day 3: Agra to Jaipur - Sunrise at Taj Mahal, drive to Jaipur via Fatehpur Sikri stepwells | Day 4: Jaipur City Tour - Visit Amber Fort, Hawa Mahal, Jal Mahal, and departure to Delhi/Jaipur airport",
        "description": "The Golden Triangle is India's most celebrated travel circuit, offering an enchanting journey through centuries of Mughal and Rajput architectural splendour.",
        "bestTimeToVisit": "October to March",
        "status": "published", // published, draft
        "isFeatured": "true",
        "isPopular": "true",
        "isBestSeller": "true",
      },
      {
        "title*": "Royal Rajasthan Forts & Desert Safaris",
        "tagline": "Palaces of Jaipur, Lakes of Udaipur & Golden Dunes of Jaisalmer",
        "packageType": "luxury",
        "days*": 7,
        "nights*": 6,
        "states": "Rajasthan",
        "cities": "Jaipur, Jodhpur, Jaisalmer, Udaipur",
        "startLocation": "Jaipur",
        "endLocation": "Udaipur",
        "priceStandard": 24000,
        "priceDeluxe": 36000,
        "priceLuxury": 54000,
        "currency": "INR",
        "highlights": "Thar Desert camel safari and luxury Swiss tent stay | Boat cruise on Lake Pichola in Udaipur | Mehrangarh Fort towering over the Blue City | Majestic Amber Palace in Jaipur",
        "inclusions": "Chauffeur-driven AC SUV throughout the journey | Heritage Haveli stays with breakfast & dinner in desert | Desert folk dance & cultural night | Sightseeing transfers & tolls",
        "exclusions": "Flights/trains | Camera fees at monuments | Alcoholic beverages | Travel insurance",
        "itinerary": "Day 1: Arrive in Jaipur - Check in and visit City Palace | Day 2: Jaipur Sightseeing - Amber Fort, Nahargarh & Hawa Mahal | Day 3: Jaipur to Jodhpur - Visit Mehrangarh Fort & Jaswant Thada | Day 4: Jodhpur to Jaisalmer - Sam Sand Dunes camel safari and tent stay | Day 5: Jaisalmer to Udaipur - Drive to the City of Lakes | Day 6: Udaipur Sightseeing - City Palace & Lake Pichola boat ride | Day 7: Departure from Udaipur Airport",
        "description": "Step into royal history with this 7-day curated Rajasthan expedition showcasing formidable forts, romantic lakes, and golden desert dunes.",
        "bestTimeToVisit": "November to February",
        "status": "published",
        "isFeatured": "true",
        "isPopular": "true",
        "isBestSeller": "false",
      },
    ];

    // Reference table for City and State names
    const cityStateReference = cities.map((c) => ({
      "City Name": c.name,
      "State Name": c.stateId?.name || "N/A",
    }));

    // Build workbook
    const wb = XLSX.utils.book_new();

    // 1. Template Sheet
    const wsTemplate = XLSX.utils.json_to_sheet(sampleRows);
    // Set column widths
    wsTemplate["!cols"] = [
      { wch: 35 }, // title
      { wch: 45 }, // tagline
      { wch: 14 }, // packageType
      { wch: 8 },  // days
      { wch: 8 },  // nights
      { wch: 30 }, // states
      { wch: 35 }, // cities
      { wch: 16 }, // startLocation
      { wch: 16 }, // endLocation
      { wch: 14 }, // priceStandard
      { wch: 14 }, // priceDeluxe
      { wch: 14 }, // priceLuxury
      { wch: 10 }, // currency
      { wch: 60 }, // highlights
      { wch: 60 }, // inclusions
      { wch: 60 }, // exclusions
      { wch: 80 }, // itinerary
      { wch: 60 }, // description
      { wch: 20 }, // bestTimeToVisit
      { wch: 12 }, // status
      { wch: 12 }, // isFeatured
      { wch: 12 }, // isPopular
      { wch: 12 }, // isBestSeller
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Packages_Template");

    // 2. Reference Sheet for Cities & States
    const wsReference = XLSX.utils.json_to_sheet(cityStateReference);
    wsReference["!cols"] = [{ wch: 28 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, wsReference, "Available_Cities_States");

    if (format === "csv") {
      // Return Sheet 1 as CSV
      const csvData = XLSX.utils.sheet_to_csv(wsTemplate);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="tour-packages-template.csv"'
      );
      return res.send(csvData);
    }

    // Default: XLSX format
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="tour-packages-import-template.xlsx"'
    );
    res.setHeader("Content-Length", buffer.length);
    return res.end(buffer);

  } catch (error) {
    console.error("Download Package Template Error:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to generate template spreadsheet"
    );
  }
};

// ================================================================
// 2. BULK UPLOAD PACKAGES FROM EXCEL / CSV
// ================================================================
export const bulkUploadPackagesFromExcel = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file."
      );
    }

    // Read spreadsheet buffer
    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer", cellDates: true });
    } catch (parseErr) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        `Could not parse file. Ensure it is a valid Excel or CSV file. (${parseErr.message})`
      );
    }

    if (!workbook.SheetNames || !workbook.SheetNames.length) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "The uploaded spreadsheet contains no sheets."
      );
    }

    // Use sheet named "Packages_Template" or the first available sheet
    const targetSheetName =
      workbook.SheetNames.find((s) => s.toLowerCase().includes("package")) ||
      workbook.SheetNames[0];

    const worksheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rawRows || !rawRows.length) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "The uploaded spreadsheet is empty or contains no valid rows."
      );
    }

    // Load master reference maps for fast lookup
    const [allStates, allCities, defaultCountry] = await Promise.all([
      State.find({ isActive: true }).select("_id name code slug").lean(),
      City.find({ isActive: true }).select("_id name slug stateId").lean(),
      Country.findOne({ slug: "india" }).select("_id").lean(),
    ]);

    const stateMap = new Map();
    allStates.forEach((s) => {
      stateMap.set(s.name.toLowerCase().trim(), s);
      if (s.code) stateMap.set(s.code.toLowerCase().trim(), s);
      if (s.slug) stateMap.set(s.slug.toLowerCase().trim(), s);
    });

    const cityMap = new Map();
    allCities.forEach((c) => {
      cityMap.set(c.name.toLowerCase().trim(), c);
      if (c.slug) cityMap.set(c.slug.toLowerCase().trim(), c);
    });

    // Existing package titles/codes to generate unique slugs
    const existingPackages = await Package.find({}).select("slug packageCode").lean();
    const existingSlugs = new Set(existingPackages.map((p) => p.slug));
    const existingCodes = new Set(existingPackages.map((p) => p.packageCode));

    const results = {
      totalRows: rawRows.length,
      createdCount: 0,
      failedCount: 0,
      createdPackages: [],
      errors: [],
    };

    let counter = existingPackages.length + 1;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 2; // Excel 1-based index (Header is row 1)

      // Column name resolution (support both "title*" and "title")
      const title = (row["title*"] || row["title"] || row["Title"] || "").toString().trim();
      const rawDays = row["days*"] ?? row["days"] ?? row["Days"] ?? "";
      const rawNights = row["nights*"] ?? row["nights"] ?? row["Nights"] ?? "";

      if (!title) {
        results.failedCount++;
        results.errors.push({ row: rowNum, title: "N/A", message: "Title is required" });
        continue;
      }

      const days = parseInt(rawDays, 10);
      const nights = parseInt(rawNights, 10);

      if (isNaN(days) || days < 1) {
        results.failedCount++;
        results.errors.push({ row: rowNum, title, message: "Valid 'days' count (>= 1) is required" });
        continue;
      }

      // 1. Generate unique slug
      let baseSlug = slugify(title);
      if (!baseSlug) baseSlug = `package-${Date.now()}`;
      let finalSlug = baseSlug;
      let slugSuffix = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${slugSuffix++}`;
      }
      existingSlugs.add(finalSlug);

      // 2. Generate unique package code
      let packageCode = (row["packageCode"] || row["code"] || "").toString().trim().toUpperCase();
      if (!packageCode || existingCodes.has(packageCode)) {
        packageCode = `PKG-${String(counter).padStart(4, "0")}`;
        while (existingCodes.has(packageCode)) {
          counter++;
          packageCode = `PKG-${String(counter).padStart(4, "0")}`;
        }
      }
      existingCodes.add(packageCode);
      counter++;

      // 3. Resolve States
      const rawStates = (row["states"] || row["States"] || "").toString();
      const resolvedStateIds = [];
      if (rawStates) {
        rawStates.split(",").forEach((s) => {
          const key = s.toLowerCase().trim();
          if (stateMap.has(key)) {
            resolvedStateIds.push(stateMap.get(key)._id);
          }
        });
      }

      // 4. Resolve Cities
      const rawCities = (row["cities"] || row["Cities"] || "").toString();
      const resolvedCityIds = [];
      const resolvedCities = [];
      if (rawCities) {
        rawCities.split(",").forEach((c) => {
          const key = c.toLowerCase().trim();
          if (cityMap.has(key)) {
            const cityDoc = cityMap.get(key);
            resolvedCityIds.push(cityDoc._id);
            resolvedCities.push(cityDoc);
            if (cityDoc.stateId && !resolvedStateIds.includes(cityDoc.stateId)) {
              resolvedStateIds.push(cityDoc.stateId);
            }
          }
        });
      }

      // 5. Build Destinations (Array of strings matching Package model schema)
      let destinations = [];
      const rawDest = (row["destinations"] || row["Destinations"] || "").toString().trim();
      if (rawDest) {
        destinations = rawDest.split(/[|,]/).map((d) => d.trim()).filter(Boolean);
      } else if (rawCities) {
        destinations = rawCities.split(/[|,]/).map((d) => d.trim()).filter(Boolean);
      } else if (resolvedCities.length) {
        destinations = resolvedCities.map((c) => c.name);
      }

      // 6. Parse Itinerary (Day must be an integer >= 1)
      const rawItinerary = (row["itinerary"] || row["Itinerary"] || "").toString().trim();
      const itinerary = [];
      if (rawItinerary) {
        // Split by pipe '|' or newline '\n'
        const rawDaysArr = rawItinerary
          .split(/[|\n]/)
          .map((d) => d.trim())
          .filter(Boolean);

        rawDaysArr.forEach((dayStr, dIdx) => {
          // Detect day number if written as "Day 1:", "Day 2", etc.
          const dayMatch = dayStr.match(/^Day\s*(\d+)/i);
          const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : (dIdx + 1);

          let dayTitle = `Day ${dayNum}`;
          let dayDesc = dayStr;

          // Strip leading "Day X:" or "Day X -"
          const contentAfterPrefix = dayStr.replace(/^Day\s*\d+\s*[:\-]\s*/i, "").trim();

          if (contentAfterPrefix) {
            // Check separator like " - " or en/em dash
            const dashParts = contentAfterPrefix.split(/\s+[-–—]\s+/);
            if (dashParts.length > 1) {
              dayTitle = dashParts[0].trim().slice(0, 300);
              dayDesc = dashParts.slice(1).join(" - ").trim();
            } else {
              // Or check colon separator
              const colonParts = contentAfterPrefix.split(/\s*:\s*/);
              if (colonParts.length > 1) {
                dayTitle = colonParts[0].trim().slice(0, 300);
                dayDesc = colonParts.slice(1).join(" - ").trim();
              } else {
                dayTitle = contentAfterPrefix.slice(0, 100);
                dayDesc = contentAfterPrefix;
              }
            }
          }

          if (!dayTitle) dayTitle = `Day ${dayNum}`;
          if (!dayDesc) dayDesc = `Sightseeing and tour activities for Day ${dayNum}.`;

          itinerary.push({
            day: dayNum,
            dayNumber: dayNum,
            title: dayTitle.slice(0, 300),
            description: dayDesc.slice(0, 5000),
          });
        });
      }

      // If itinerary not provided in sheet, create default placeholder days
      if (!itinerary.length) {
        for (let d = 1; d <= days; d++) {
          itinerary.push({
            day: d,
            dayNumber: d,
            title: d === 1 ? "Arrival & Welcome" : d === days ? "Departure" : `Day ${d} Sightseeing`,
            description: `Scheduled sightseeing, transfers and activities for Day ${d}.`,
          });
        }
      }

      // 7. Parse Arrays (Highlights, Inclusions, Exclusions)
      const parseList = (str) =>
        str
          ? str
              .toString()
              .split(/[|\n]/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      const highlights = parseList(row["highlights"] || row["Highlights"]);
      const inclusions = parseList(row["inclusions"] || row["Inclusions"]);
      const exclusions = parseList(row["exclusions"] || row["Exclusions"]);

      // 8. Start / End locations (Object matching schema: { name, cityId })
      const rawStartName = (row["startLocation"] || resolvedCities[0]?.name || "New Delhi").toString().trim();
      const rawEndName = (row["endLocation"] || resolvedCities[resolvedCities.length - 1]?.name || rawStartName).toString().trim();
      const startCity = cityMap.get(rawStartName.toLowerCase());
      const endCity = cityMap.get(rawEndName.toLowerCase());

      const startLocation = {
        name: rawStartName.slice(0, 150),
        cityId: startCity?._id || resolvedCities[0]?._id || null,
      };

      const endLocation = {
        name: rawEndName.slice(0, 150),
        cityId: endCity?._id || resolvedCities[resolvedCities.length - 1]?._id || null,
      };

      // 9. Pricing
      const priceStandard = Number(row["priceStandard"] || row["standardPrice"] || 0);
      const priceDeluxe = Number(row["priceDeluxe"] || row["deluxePrice"] || 0);
      const priceLuxury = Number(row["priceLuxury"] || row["luxuryPrice"] || 0);

      const pricing = {
        currency: (row["currency"] || "INR").toString().trim().toUpperCase(),
        standard: { startingPrice: priceStandard },
        deluxe: { startingPrice: priceDeluxe },
        luxury: { startingPrice: priceLuxury },
      };

      // 10. Boolean helpers
      const toBool = (val, defaultVal = false) => {
        if (val === undefined || val === null || val === "") return defaultVal;
        const s = val.toString().toLowerCase().trim();
        return s === "true" || s === "yes" || s === "1";
      };

      // Build Document
      const packageDoc = {
        title,
        slug: finalSlug,
        packageCode,
        tagline: (row["tagline"] || "").toString().trim(),
        description: (row["description"] || row["overview"] || "").toString().trim(),
        overview: (row["overview"] || row["description"] || row["tagline"] || "").toString().trim(),
        shortDescription: (row["shortDescription"] || row["tagline"] || "").toString().trim().slice(0, 700),
        packageType: (row["packageType"] || "private").toString().toLowerCase().trim(),
        duration: {
          days,
          nights: isNaN(nights) ? Math.max(0, days - 1) : nights,
        },
        countries: defaultCountry ? [defaultCountry._id] : [],
        states: resolvedStateIds,
        cities: resolvedCityIds,
        destinations,
        startLocation,
        endLocation,
        highlights,
        itinerary,
        pricing,
        inclusions,
        exclusions,
        included: inclusions,
        excluded: exclusions,
        currency: (row["currency"] || "INR").toString().trim().toUpperCase(),
        bestTimeToVisit: (row["bestTimeToVisit"] || "").toString().trim().slice(0, 1000),
        status: (row["status"] || "published").toString().toLowerCase().trim() === "draft" ? "draft" : "published",
        isFeatured: toBool(row["isFeatured"], false),
        isPopular: toBool(row["isPopular"], false),
        isBestSeller: toBool(row["isBestSeller"], false),
        isActive: true,
        createdBy: req.user?.id || req.admin?._id || null,
      };

      try {
        const created = await Package.create(packageDoc);
        results.createdCount++;
        results.createdPackages.push({
          id: created._id,
          title: created.title,
          packageCode: created.packageCode,
          slug: created.slug,
        });
      } catch (insertErr) {
        results.failedCount++;
        results.errors.push({
          row: rowNum,
          title,
          message: insertErr.message || "Failed to insert package record",
        });
      }
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      `Bulk upload completed: ${results.createdCount} packages created, ${results.failedCount} failed.`,
      results
    );

  } catch (error) {
    console.error("Bulk Upload Packages Error:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      `Bulk upload failed: ${error.message}`
    );
  }
};

