import * as XLSX from "xlsx";
import Hotel from "../../models/hotel/index.js";
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
// DOWNLOAD HOTEL TEMPLATE
// ================================================================
export const downloadHotelTemplate = async (req, res) => {
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
        "name*": "The Oberoi Rajvilas",
        "category*": "luxury", // budget, standard, premium, luxury, heritage, resort, boutique, villa, homestay, hostel
        "starRating": 5, // 1 to 5
        "state*": "Rajasthan",
        "city*": "Jaipur",
        "address": "Goner Rd, Jagatpura, Jaipur, Rajasthan 302031",
        "shortDescription": "Luxury resort set in 32 acres of landscaped gardens with traditional Rajasthani architecture.",
        "description": "Experience the epitome of royal hospitality at The Oberoi Rajvilas, featuring private pools, luxury tents, and an ancient Shiva temple within the grounds.",
        "amenities": "wifi, pool, restaurant, spa, gym, parking, room-service, ac, bar",
        "highlights": "32 acres of lush royal gardens | Private plunge pool villas | Rejuvenating Ayurvedic spa | Authentic Rajasthani dining",
        "checkIn": "14:00",
        "checkOut": "12:00",
        "status": "published", // published, draft
        "isFeatured": "true",
        "isPopular": "true",
      },
      {
        "name*": "Taj Fateh Prakash Palace",
        "category*": "heritage",
        "starRating": 5,
        "state*": "Rajasthan",
        "city*": "Udaipur",
        "address": "The City Palace Complex, Udaipur, Rajasthan 313001",
        "shortDescription": "Grand heritage palace hotel perched on the shores of Lake Pichola.",
        "description": "Built in the early 20th century as an exclusive royal venue, Taj Fateh Prakash Palace offers unmatched views of Lake Pichola and the Jagmandir Island Palace.",
        "amenities": "wifi, restaurant, bar, concierge, room-service, ac, pool",
        "highlights": "Direct Lake Pichola panoramic views | Historic museum corridors | Sunset terrace dining | Palace boat rides",
        "checkIn": "14:00",
        "checkOut": "11:00",
        "status": "published",
        "isFeatured": "true",
        "isPopular": "true",
      },
      {
        "name*": "ITC Mughal Resort & Spa",
        "category*": "resort",
        "starRating": 5,
        "state*": "Uttar Pradesh",
        "city*": "Agra",
        "address": "Taj Ganj, Agra, Uttar Pradesh 282001",
        "shortDescription": "Sprawling luxury resort close to the Taj Mahal with Mughal-inspired architecture.",
        "description": "Spread over 35 acres of luxuriant gardens, ITC Mughal offers world-class dining, Kaya Kalp royal spa, and close proximity to the Taj Mahal.",
        "amenities": "wifi, pool, spa, restaurant, gym, parking, ac",
        "highlights": "Kaya Kalp Royal Spa | Close to Taj Mahal | 35 acres of gardens | Multiple award-winning restaurants",
        "checkIn": "15:00",
        "checkOut": "12:00",
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
      { wch: 30 }, // name
      { wch: 15 }, // category
      { wch: 12 }, // starRating
      { wch: 20 }, // state
      { wch: 20 }, // city
      { wch: 40 }, // address
      { wch: 50 }, // shortDescription
      { wch: 60 }, // description
      { wch: 50 }, // amenities
      { wch: 60 }, // highlights
      { wch: 10 }, // checkIn
      { wch: 10 }, // checkOut
      { wch: 12 }, // status
      { wch: 12 }, // isFeatured
      { wch: 12 }, // isPopular
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Hotels_Template");

    const wsReference = XLSX.utils.json_to_sheet(cityStateReference);
    wsReference["!cols"] = [{ wch: 28 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, wsReference, "Available_Cities_States");

    if (format === "csv") {
      const csvData = XLSX.utils.sheet_to_csv(wsTemplate);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="hotels-template.csv"');
      return res.send(csvData);
    }

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="hotels-import-template.xlsx"');
    res.setHeader("Content-Length", buffer.length);
    return res.end(buffer);
  } catch (error) {
    console.error("Download Hotel Template Error:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to generate hotel template");
  }
};

// ================================================================
// BULK UPLOAD HOTELS FROM EXCEL / CSV
// ================================================================
export const bulkUploadHotelsFromExcel = async (req, res) => {
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
      workbook.SheetNames.find((s) => s.toLowerCase().includes("hotel")) ||
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

    const existingHotels = await Hotel.find({}).select("slug").lean();
    const existingSlugs = new Set(existingHotels.map((h) => h.slug));

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
      const rawCategory = (row["category*"] || row["category"] || row["Category"] || "standard").toString().toLowerCase().trim();
      const rawState = (row["state*"] || row["state"] || row["State"] || "").toString().trim();
      const rawCity = (row["city*"] || row["city"] || row["City"] || "").toString().trim();

      if (!name) {
        results.failedCount++;
        results.errors.push({ row: rowNum, name: "N/A", message: "Hotel name is required" });
        continue;
      }

      // Resolve City & State
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

      // Slug
      let baseSlug = slugify(name);
      if (!baseSlug) baseSlug = `hotel-${Date.now()}`;
      let finalSlug = baseSlug;
      let suffix = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${suffix++}`;
      }
      existingSlugs.add(finalSlug);

      // Category validation
      const validCategories = [
        "budget", "standard", "premium", "luxury", "heritage", "resort",
        "boutique", "villa", "homestay", "hostel", "camp", "eco-resort", "other"
      ];
      const category = validCategories.includes(rawCategory) ? rawCategory : "standard";

      // Star rating
      let starRating = parseInt(row["starRating"] || row["StarRating"] || "", 10);
      if (isNaN(starRating) || starRating < 1 || starRating > 5) {
        starRating = null;
      }

      // Arrays (Amenities, Highlights)
      const parseList = (str, delim = /[,\n|]/) =>
        str
          ? str.toString().split(delim).map((s) => s.trim().toLowerCase()).filter(Boolean)
          : [];

      const amenities = parseList(row["amenities"] || row["Amenities"]);
      const highlights = str => str ? str.toString().split(/[|\n]/).map((s) => s.trim()).filter(Boolean) : [];

      const toBool = (val, defaultVal = false) => {
        if (val === undefined || val === null || val === "") return defaultVal;
        const s = val.toString().toLowerCase().trim();
        return s === "true" || s === "yes" || s === "1";
      };

      const hotelDoc = {
        name,
        slug: finalSlug,
        stateId: resolvedState._id,
        cityId: resolvedCity._id,
        category,
        starRating,
        shortDescription: (row["shortDescription"] || "").toString().trim().slice(0, 500),
        description: (row["description"] || "").toString().trim().slice(0, 10000),
        amenities,
        highlights: highlights(row["highlights"] || row["Highlights"]),
        location: {
          address: (row["address"] || "").toString().trim().slice(0, 1000),
        },
        policies: {
          checkIn: (row["checkIn"] || "14:00").toString().trim(),
          checkOut: (row["checkOut"] || "11:00").toString().trim(),
        },
        status: (row["status"] || "published").toString().toLowerCase().trim() === "draft" ? "draft" : "published",
        isFeatured: toBool(row["isFeatured"], false),
        isPopular: toBool(row["isPopular"], false),
        isActive: true,
        createdBy: req.user?.id || req.admin?._id || null,
      };

      try {
        const created = await Hotel.create(hotelDoc);
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
          message: insertErr.message || "Failed to insert hotel record",
        });
      }
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      `Bulk hotel upload completed: ${results.createdCount} created, ${results.failedCount} failed.`,
      results
    );
  } catch (error) {
    console.error("Bulk Upload Hotels Error:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, `Upload failed: ${error.message}`);
  }
};

