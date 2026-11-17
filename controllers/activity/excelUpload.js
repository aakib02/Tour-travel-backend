import * as XLSX from "xlsx";
import Activity from "../../models/activity/index.js";
import State from "../../models/state/index.js";
import City from "../../models/city/index.js";
import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";
import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";

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
// DOWNLOAD ACTIVITY TEMPLATE
// ================================================================
export const downloadActivityTemplate = async (req, res) => {
  try {
    const format = (req.query.format || "xlsx").toLowerCase();

    const [states, cities] = await Promise.all([
      State.find({ isActive: true }).select("name code").sort({ name: 1 }).lean(),
      City.find({ isActive: true })
        .populate("stateId", "name")
        .select("name stateId")
        .sort({ name: 1 })
        .lean(),
    ]);

    const sampleRows = [
      {
        "name*": "Thar Desert Sunset Camel Safari",
        "category*": "safari", // adventure, culture, heritage, wildlife, water-sports, trekking, safari, sightseeing, food, shopping, wellness, spiritual, family, romantic, luxury, local-experience
        "state*": "Rajasthan",
        "city*": "Jaisalmer",
        "durationValue": 3,
        "durationUnit": "hours", // hours, days, minutes
        "difficulty": "easy", // easy, moderate, challenging
        "shortDescription": "Glide through the golden dunes of Sam on a traditional camel safari during sunset.",
        "description": "Embark on an unforgettable desert experience into the Thar Desert. Witness the changing colors of the horizon, enjoy Rajasthani folk music, and capture stunning photography across vast ripple sand dunes.",
        "highlights": "Camel ride across golden Thar dunes | Mesmerizing desert sunset view | Traditional Rajasthani turban tying & welcome | Evening folk dance & tea",
        "inclusions": "Camel ride with handler | Mineral water bottle | Evening tea and snacks",
        "exclusions": "Transportation to desert camp | Alcoholic drinks | Personal tipping",
        "bestTimeToVisit": "October to March",
        "status": "published", // published, draft
        "isFeatured": "true",
        "isPopular": "true",
      },
      {
        "name*": "Periyar Tiger Reserve Guided Jungle Trek",
        "category*": "wildlife",
        "state*": "Kerala",
        "city*": "Thekkady",
        "durationValue": 4,
        "durationUnit": "hours",
        "difficulty": "moderate",
        "shortDescription": "Guided walking trek through the dense tropical rainforest of Periyar National Park.",
        "description": "Led by indigenous forest trackers, walk through dense canopies, spot wild elephants, endemic birds, Nilgiri langurs, and aromatic wild spice trees.",
        "highlights": "Expert forest ranger accompaniment | Bird watching & wildlife tracking | Ancient forest canopy walk | Leeches protection socks provided",
        "inclusions": "National park entry pass | Professional forest guide | Anti-leech footwear",
        "exclusions": "Camera fees | Food & beverages | Hotel pick-up and drop",
        "bestTimeToVisit": "September to April",
        "status": "published",
        "isFeatured": "true",
        "isPopular": "true",
      },
      {
        "name*": "Old Delhi Heritage & Street Food Rickshaw Safari",
        "category*": "food",
        "state*": "Delhi",
        "city*": "New Delhi",
        "durationValue": 3,
        "durationUnit": "hours",
        "difficulty": "easy",
        "shortDescription": "Navigate centuries-old alleyways of Chandni Chowk tasting legendary heritage delicacies.",
        "description": "Experience the vibrant heart of Mughal Delhi on a private cycle rickshaw. Visit Khari Baoli Asia largest spice market and taste famous street foods like paranthas, jalebis, and lassi.",
        "highlights": "Cycle rickshaw ride through Chandni Chowk | Visit Asia largest spice market rooftop | Tasting at historic 100-year-old food stalls | English-speaking culinary guide",
        "inclusions": "Private cycle rickshaw ride | Guided culinary tastings | Bottled water",
        "exclusions": "Personal souvenir shopping | Excess dining outside tasting plan",
        "bestTimeToVisit": "October to March",
        "status": "published",
        "isFeatured": "false",
        "isPopular": "true",
      },
    ];

    const cityStateReference = cities.map((c) => ({
      "City Name": c.name,
      "State Name": c.stateId?.name || "N/A",
    }));

    const wb = XLSX.utils.book_new();

    const wsTemplate = XLSX.utils.json_to_sheet(sampleRows);
    wsTemplate["!cols"] = [
      { wch: 35 }, // name
      { wch: 18 }, // category
      { wch: 20 }, // state
      { wch: 20 }, // city
      { wch: 14 }, // durationValue
      { wch: 14 }, // durationUnit
      { wch: 14 }, // difficulty
      { wch: 50 }, // shortDescription
      { wch: 60 }, // description
      { wch: 60 }, // highlights
      { wch: 60 }, // inclusions
      { wch: 60 }, // exclusions
      { wch: 20 }, // bestTimeToVisit
      { wch: 12 }, // status
      { wch: 12 }, // isFeatured
      { wch: 12 }, // isPopular
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Activities_Template");

    const wsReference = XLSX.utils.json_to_sheet(cityStateReference);
    wsReference["!cols"] = [{ wch: 28 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, wsReference, "Available_Cities_States");

    if (format === "csv") {
      const csvData = XLSX.utils.sheet_to_csv(wsTemplate);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="activities-template.csv"');
      return res.send(csvData);
    }

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="activities-import-template.xlsx"');
    res.setHeader("Content-Length", buffer.length);
    return res.end(buffer);
  } catch (error) {
    console.error("Download Activity Template Error:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to generate activity template");
  }
};

// ================================================================
// BULK UPLOAD ACTIVITIES FROM EXCEL / CSV
// ================================================================
export const bulkUploadActivitiesFromExcel = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Please upload a valid Excel or CSV file.");
    }

    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer", cellDates: true });
    } catch (parseErr) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, `Invalid spreadsheet: ${parseErr.message}`);
    }

    const targetSheetName =
      workbook.SheetNames.find((s) => s.toLowerCase().includes("activity")) ||
      workbook.SheetNames[0];

    const worksheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rawRows || !rawRows.length) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Spreadsheet is empty or has no data rows.");
    }

    const [allStates, allCities] = await Promise.all([
      State.find({ isActive: true }).select("_id name code slug").lean(),
      City.find({ isActive: true }).select("_id name slug stateId").lean(),
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

    const existingActivities = await Activity.find({}).select("slug").lean();
    const existingSlugs = new Set(existingActivities.map((a) => a.slug));

    const results = {
      totalRows: rawRows.length,
      createdCount: 0,
      failedCount: 0,
      createdItems: [],
      errors: [],
    };

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 2;

      const name = (row["name*"] || row["name"] || row["Name"] || "").toString().trim();
      const rawCategory = (row["category*"] || row["category"] || row["Category"] || "sightseeing").toString().toLowerCase().trim();
      const rawState = (row["state*"] || row["state"] || row["State"] || "").toString().trim();
      const rawCity = (row["city*"] || row["city"] || row["City"] || "").toString().trim();

      if (!name) {
        results.failedCount++;
        results.errors.push({ row: rowNum, name: "N/A", message: "Activity name is required" });
        continue;
      }

      let resolvedCity = cityMap.get(rawCity.toLowerCase());
      let resolvedState = stateMap.get(rawState.toLowerCase());

      if (!resolvedCity && !resolvedState) {
        results.failedCount++;
        results.errors.push({ row: rowNum, name, message: `Could not find City "${rawCity}" or State "${rawState}"` });
        continue;
      }

      if (resolvedCity && !resolvedState && resolvedCity.stateId) {
        resolvedState = allStates.find((s) => s._id.toString() === resolvedCity.stateId.toString());
      }

      if (!resolvedCity) {
        results.failedCount++;
        results.errors.push({ row: rowNum, name, message: `City "${rawCity}" is not registered in database` });
        continue;
      }

      if (!resolvedState) {
        results.failedCount++;
        results.errors.push({ row: rowNum, name, message: `State "${rawState}" is not registered in database` });
        continue;
      }

      let baseSlug = slugify(name);
      if (!baseSlug) baseSlug = `activity-${Date.now()}`;
      let finalSlug = baseSlug;
      let suffix = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${suffix++}`;
      }
      existingSlugs.add(finalSlug);

      const validCategories = [
        "adventure", "culture", "heritage", "wildlife", "water-sports", "trekking",
        "safari", "sightseeing", "food", "shopping", "wellness", "spiritual",
        "photography", "nightlife", "family", "romantic", "luxury", "local-experience",
        "art-and-craft", "other"
      ];
      const category = validCategories.includes(rawCategory) ? rawCategory : "sightseeing";

      const parseList = (str) =>
        str ? str.toString().split(/[|\n]/).map((s) => s.trim()).filter(Boolean) : [];

      const durationVal = parseFloat(row["durationValue"] || row["duration"] || 0) || 2;
      const durationUnit = ["hours", "days", "minutes"].includes(
        (row["durationUnit"] || "").toString().toLowerCase().trim()
      )
        ? (row["durationUnit"] || "").toString().toLowerCase().trim()
        : "hours";

      const validDifficulties = ["easy", "moderate", "challenging"];
      const difficulty = validDifficulties.includes((row["difficulty"] || "").toString().toLowerCase().trim())
        ? (row["difficulty"] || "").toString().toLowerCase().trim()
        : "easy";

      const toBool = (val, defaultVal = false) => {
        if (val === undefined || val === null || val === "") return defaultVal;
        const s = val.toString().toLowerCase().trim();
        return s === "true" || s === "yes" || s === "1";
      };

      const activityDoc = {
        name,
        slug: finalSlug,
        stateId: resolvedState._id,
        cityId: resolvedCity._id,
        category,
        shortDescription: (row["shortDescription"] || "").toString().trim().slice(0, 500),
        description: (row["description"] || "").toString().trim().slice(0, 10000),
        duration: {
          value: durationVal,
          unit: durationUnit,
        },
        difficulty,
        highlights: parseList(row["highlights"] || row["Highlights"]),
        inclusions: parseList(row["inclusions"] || row["Inclusions"]),
        exclusions: parseList(row["exclusions"] || row["Exclusions"]),
        bestTimeToVisit: (row["bestTimeToVisit"] || "").toString().trim(),
        status: (row["status"] || "published").toString().toLowerCase().trim() === "draft" ? "draft" : "published",
        isFeatured: toBool(row["isFeatured"], false),
        isPopular: toBool(row["isPopular"], false),
        isActive: true,
        createdBy: req.user?.id || req.admin?._id || null,
      };

      try {
        const created = await Activity.create(activityDoc);
        results.createdCount++;
        results.createdItems.push({
          id: created._id,
          name: created.name,
          slug: created.slug,
          city: resolvedCity.name,
        });
      } catch (insertErr) {
        results.failedCount++;
        results.errors.push({
          row: rowNum,
          name,
          message: insertErr.message || "Failed to insert activity record",
        });
      }
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      `Bulk activity upload completed: ${results.createdCount} created, ${results.failedCount} failed.`,
      results
    );
  } catch (error) {
    console.error("Bulk Upload Activities Error:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, `Upload failed: ${error.message}`);
  }
};

