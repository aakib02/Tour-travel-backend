import * as XLSX from "xlsx";
import Attraction from "../../models/attraction/index.js";
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
// DOWNLOAD ATTRACTION TEMPLATE
// ================================================================
export const downloadAttractionTemplate = async (req, res) => {
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
        "name*": "Taj Mahal",
        "category*": "monument", // heritage, monument, fort, palace, temple, mosque, church, museum, wildlife, national-park, beach, lake, waterfall, hill-station, viewpoint, garden, market, cultural, religious, adventure, other
        "state*": "Uttar Pradesh",
        "city*": "Agra",
        "shortDescription": "UNESCO World Heritage ivory-white marble mausoleum on the south bank of the Yamuna river.",
        "description": "An immense mausoleum of white marble, built in Agra between 1631 and 1648 by order of the Mughal emperor Shah Jahan in memory of his favourite wife Mumtaz Mahal.",
        "history": "Commissioned in 1631, the Taj Mahal took over 20,000 artisans and more than 15 years to complete, representing the jewel of Muslim art in India.",
        "highlights": "UNESCO World Heritage Site | Symmetrical Mughal architectural perfection | Spectacular reflection in Yamuna river | Intricate marble inlay floral pietre dure",
        "bestTimeToVisit": "October to March (Closed on Fridays)",
        "status": "published", // published, draft
        "isFeatured": "true",
        "isPopular": "true",
      },
      {
        "name*": "Amber Palace & Fort",
        "category*": "fort",
        "state*": "Rajasthan",
        "city*": "Jaipur",
        "shortDescription": "Majestic hilltop fortress famous for its artistic Hindu elements and Sheesh Mahal mirror palace.",
        "description": "Located high on a hill in Amer, this opulent palace fortress constructed of red sandstone and marble overlooks the Maota Lake. Features the world-renowned Hall of Mirrors (Sheesh Mahal).",
        "history": "Built by Raja Man Singh in 1592 and later expanded by Sawai Jai Singh, Amer served as the seat of the Kachwaha Rajputs before Jaipur was founded.",
        "highlights": "Sheesh Mahal (Hall of Mirrors) | Elephant and jeep ride to the palace courtyard | Panoramic views over Maota Lake | Sound and Light show in evening",
        "bestTimeToVisit": "September to March",
        "status": "published",
        "isFeatured": "true",
        "isPopular": "true",
      },
      {
        "name*": "Hawa Mahal (Palace of Winds)",
        "category*": "palace",
        "state*": "Rajasthan",
        "city*": "Jaipur",
        "shortDescription": "Five-storey pink sandstone palace featuring 953 intricately carved jharokha windows.",
        "description": "Constructed in 1799, Hawa Mahal allowed royal ladies to observe daily street festivities and processions unseen from behind 953 casements cooled by natural breezes.",
        "history": "Designed by Lal Chand Ustad in the form of the crown of Lord Krishna for Maharaja Sawai Pratap Singh.",
        "highlights": "953 small casements (jharokhas) | Honeycomb pink sandstone façade | Rooftop vista of the Pink City | Beautiful city museum collection",
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
      { wch: 30 }, // name
      { wch: 18 }, // category
      { wch: 20 }, // state
      { wch: 20 }, // city
      { wch: 50 }, // shortDescription
      { wch: 60 }, // description
      { wch: 60 }, // history
      { wch: 60 }, // highlights
      { wch: 25 }, // bestTimeToVisit
      { wch: 12 }, // status
      { wch: 12 }, // isFeatured
      { wch: 12 }, // isPopular
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Attractions_Template");

    const wsReference = XLSX.utils.json_to_sheet(cityStateReference);
    wsReference["!cols"] = [{ wch: 28 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, wsReference, "Available_Cities_States");

    if (format === "csv") {
      const csvData = XLSX.utils.sheet_to_csv(wsTemplate);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="attractions-template.csv"');
      return res.send(csvData);
    }

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="attractions-import-template.xlsx"');
    res.setHeader("Content-Length", buffer.length);
    return res.end(buffer);
  } catch (error) {
    console.error("Download Attraction Template Error:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to generate attraction template");
  }
};

// ================================================================
// BULK UPLOAD ATTRACTIONS FROM EXCEL / CSV
// ================================================================
export const bulkUploadAttractionsFromExcel = async (req, res) => {
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
      workbook.SheetNames.find((s) => s.toLowerCase().includes("attraction")) ||
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

    const existingAttractions = await Attraction.find({}).select("slug").lean();
    const existingSlugs = new Set(existingAttractions.map((a) => a.slug));

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
      const rawCategory = (row["category*"] || row["category"] || row["Category"] || "monument").toString().toLowerCase().trim();
      const rawState = (row["state*"] || row["state"] || row["State"] || "").toString().trim();
      const rawCity = (row["city*"] || row["city"] || row["City"] || "").toString().trim();

      if (!name) {
        results.failedCount++;
        results.errors.push({ row: rowNum, name: "N/A", message: "Attraction name is required" });
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
      if (!baseSlug) baseSlug = `attraction-${Date.now()}`;
      let finalSlug = baseSlug;
      let suffix = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${suffix++}`;
      }
      existingSlugs.add(finalSlug);

      const validCategories = [
        "heritage", "monument", "fort", "palace", "temple", "mosque", "church",
        "museum", "wildlife", "national-park", "beach", "lake", "waterfall",
        "hill-station", "viewpoint", "market", "garden", "cultural", "religious",
        "adventure", "other"
      ];
      const category = validCategories.includes(rawCategory) ? rawCategory : "monument";

      const parseList = (str) =>
        str ? str.toString().split(/[|\n]/).map((s) => s.trim()).filter(Boolean) : [];

      const toBool = (val, defaultVal = false) => {
        if (val === undefined || val === null || val === "") return defaultVal;
        const s = val.toString().toLowerCase().trim();
        return s === "true" || s === "yes" || s === "1";
      };

      const attractionDoc = {
        name,
        slug: finalSlug,
        stateId: resolvedState._id,
        cityId: resolvedCity._id,
        category,
        shortDescription: (row["shortDescription"] || "").toString().trim().slice(0, 500),
        description: (row["description"] || "").toString().trim().slice(0, 10000),
        history: (row["history"] || "").toString().trim().slice(0, 10000),
        highlights: parseList(row["highlights"] || row["Highlights"]),
        bestTimeToVisit: (row["bestTimeToVisit"] || "").toString().trim(),
        status: (row["status"] || "published").toString().toLowerCase().trim() === "draft" ? "draft" : "published",
        isFeatured: toBool(row["isFeatured"], false),
        isPopular: toBool(row["isPopular"], false),
        isActive: true,
        createdBy: req.user?.id || req.admin?._id || null,
      };

      try {
        const created = await Attraction.create(attractionDoc);
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
          message: insertErr.message || "Failed to insert attraction record",
        });
      }
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      `Bulk attraction upload completed: ${results.createdCount} created, ${results.failedCount} failed.`,
      results
    );
  } catch (error) {
    console.error("Bulk Upload Attractions Error:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, `Upload failed: ${error.message}`);
  }
};

