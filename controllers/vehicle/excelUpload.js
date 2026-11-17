import * as XLSX from "xlsx";
import Vehicle from "../../models/vehicle/index.js";
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
// DOWNLOAD VEHICLE TEMPLATE
// ================================================================
export const downloadVehicleTemplate = async (req, res) => {
  try {
    const format = (req.query.format || "xlsx").toLowerCase();

    const sampleRows = [
      {
        "name*": "Toyota Innova Crysta",
        "type*": "suv", // sedan, suv, luxury, tempo-traveller, mini-bus, bus, van, other
        "category*": "premium", // economy, standard, premium, luxury, group
        "seatingCapacity*": 7, // Number (1 to 100)
        "largeBags": 3,
        "smallBags": 2,
        "ac": "true",
        "fuelType": "diesel", // petrol, diesel, cng, electric, hybrid, other
        "transmission": "automatic", // manual, automatic, both, not-specified
        "modelYear": 2024,
        "driverIncluded": "true",
        "shortDescription": "India's most preferred luxury touring MPV offering sublime comfort on long-distance journeys.",
        "description": "The Toyota Innova Crysta is celebrated for its unmatched ride comfort, generous legroom, dual AC vents, and spacious luggage room for family and corporate touring across India.",
        "features": "Push-back captain seats | Dual-zone climate control | Rear USB mobile chargers | Ample boot space | Bluetooth audio | Clean bottled water provided",
        "amenities": "ac, music-system, charging-port, first-aid-kit, luggage-carrier",
        "status": "published", // published, draft
        "isFeatured": "true",
        "isPopular": "true",
      },
      {
        "name*": "Maruti Suzuki Dzire",
        "type*": "sedan",
        "category*": "economy",
        "seatingCapacity*": 4,
        "largeBags": 2,
        "smallBags": 2,
        "ac": "true",
        "fuelType": "cng",
        "transmission": "manual",
        "modelYear": 2023,
        "driverIncluded": "true",
        "shortDescription": "Comfortable, cost-effective sedan ideal for couples and small families.",
        "description": "Reliable and fuel-efficient compact sedan featuring plush interiors, air conditioning, and smooth suspension for city and interstate holiday trips.",
        "features": "Chilled air conditioning | Power windows | Music system with Aux/Bluetooth | Chauffeur driven",
        "amenities": "ac, music-system, charging-port",
        "status": "published",
        "isFeatured": "false",
        "isPopular": "true",
      },
      {
        "name*": "Force Tempo Traveller 12-Seater",
        "type*": "tempo-traveller",
        "category*": "group",
        "seatingCapacity*": 12,
        "largeBags": 8,
        "smallBags": 6,
        "ac": "true",
        "fuelType": "diesel",
        "transmission": "manual",
        "modelYear": 2024,
        "driverIncluded": "true",
        "shortDescription": "Spacious luxury van designed for large family holidays and group expeditions.",
        "description": "Equipped with 1x1 luxury reclining seats, individual AC blowers, wide windows, and dedicated rear luggage compartment.",
        "features": "1x1 Reclining luxury seats | LED TV & Sound System | Ice box & charging ports | Rooftop luggage carrier | Extra wide aisle",
        "amenities": "ac, tv, music-system, charging-port, luggage-carrier, mic",
        "status": "published",
        "isFeatured": "true",
        "isPopular": "true",
      },
    ];

    const typesGuide = [
      { "Allowed Type": "sedan", "Description": "Dzire, Etios, Amaze, Honda City" },
      { "Allowed Type": "suv", "Description": "Innova Crysta, Ertiga, Scorpio, Fortuner" },
      { "Allowed Type": "luxury", "Description": "Mercedes E-Class, BMW, Audi, Fortuner" },
      { "Allowed Type": "tempo-traveller", "Description": "9-seater, 12-seater, 16-seater, 20-seater vans" },
      { "Allowed Type": "mini-bus", "Description": "21 to 30 seater mini coaches" },
      { "Allowed Type": "bus", "Description": "35 to 45 seater luxury coaches" },
      { "Allowed Type": "van", "Description": "Omni, Eeco, HiAce" },
      { "Allowed Type": "other", "Description": "Vintage cars, special carriers" },
    ];

    const wb = XLSX.utils.book_new();

    const wsTemplate = XLSX.utils.json_to_sheet(sampleRows);
    wsTemplate["!cols"] = [
      { wch: 30 }, // name
      { wch: 18 }, // type
      { wch: 14 }, // category
      { wch: 16 }, // seatingCapacity
      { wch: 12 }, // largeBags
      { wch: 12 }, // smallBags
      { wch: 8 },  // ac
      { wch: 12 }, // fuelType
      { wch: 14 }, // transmission
      { wch: 12 }, // modelYear
      { wch: 15 }, // driverIncluded
      { wch: 45 }, // shortDescription
      { wch: 60 }, // description
      { wch: 60 }, // features
      { wch: 40 }, // amenities
      { wch: 12 }, // status
      { wch: 12 }, // isFeatured
      { wch: 12 }, // isPopular
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Vehicles_Template");

    const wsGuide = XLSX.utils.json_to_sheet(typesGuide);
    wsGuide["!cols"] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, "Allowed_Types_Guide");

    if (format === "csv") {
      const csvData = XLSX.utils.sheet_to_csv(wsTemplate);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="vehicles-template.csv"');
      return res.send(csvData);
    }

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="vehicles-import-template.xlsx"');
    res.setHeader("Content-Length", buffer.length);
    return res.end(buffer);
  } catch (error) {
    console.error("Download Vehicle Template Error:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to generate vehicle template");
  }
};

// ================================================================
// BULK UPLOAD VEHICLES FROM EXCEL / CSV
// ================================================================
export const bulkUploadVehiclesFromExcel = async (req, res) => {
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
      workbook.SheetNames.find((s) => s.toLowerCase().includes("vehicle")) ||
      workbook.SheetNames[0];

    const worksheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rawRows || !rawRows.length) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Spreadsheet is empty or has no data rows.");
    }

    const existingVehicles = await Vehicle.find({}).select("slug").lean();
    const existingSlugs = new Set(existingVehicles.map((v) => v.slug));

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
      const rawType = (row["type*"] || row["type"] || row["Type"] || "sedan").toString().toLowerCase().trim();
      const rawCategory = (row["category*"] || row["category"] || row["Category"] || "standard").toString().toLowerCase().trim();
      const rawSeating = row["seatingCapacity*"] ?? row["seatingCapacity"] ?? row["seats"] ?? "";

      if (!name) {
        results.failedCount++;
        results.errors.push({ row: rowNum, name: "N/A", message: "Vehicle name is required" });
        continue;
      }

      const seatingCapacity = parseInt(rawSeating, 10);
      if (isNaN(seatingCapacity) || seatingCapacity < 1) {
        results.failedCount++;
        results.errors.push({ row: rowNum, name, message: "Valid seating capacity (>= 1) is required" });
        continue;
      }

      let baseSlug = slugify(name);
      if (!baseSlug) baseSlug = `vehicle-${Date.now()}`;
      let finalSlug = baseSlug;
      let suffix = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${suffix++}`;
      }
      existingSlugs.add(finalSlug);

      const validTypes = ["sedan", "suv", "luxury", "tempo-traveller", "mini-bus", "bus", "van", "other"];
      const type = validTypes.includes(rawType) ? rawType : "sedan";

      const validCategories = ["economy", "standard", "premium", "luxury", "group"];
      const category = validCategories.includes(rawCategory) ? rawCategory : "standard";

      const validFuel = ["petrol", "diesel", "cng", "electric", "hybrid", "petrol-diesel", "other"];
      const rawFuel = (row["fuelType"] || "diesel").toString().toLowerCase().trim();
      const fuelType = validFuel.includes(rawFuel) ? rawFuel : "diesel";

      const validTrans = ["manual", "automatic", "both", "not-specified"];
      const rawTrans = (row["transmission"] || "manual").toString().toLowerCase().trim();
      const transmission = validTrans.includes(rawTrans) ? rawTrans : "manual";

      const parseList = (str, delim = /[|\n]/) =>
        str ? str.toString().split(delim).map((s) => s.trim()).filter(Boolean) : [];

      const toBool = (val, defaultVal = false) => {
        if (val === undefined || val === null || val === "") return defaultVal;
        const s = val.toString().toLowerCase().trim();
        return s === "true" || s === "yes" || s === "1";
      };

      const largeBags = parseInt(row["largeBags"] || 0, 10) || 0;
      const smallBags = parseInt(row["smallBags"] || 0, 10) || 0;
      const modelYear = parseInt(row["modelYear"] || new Date().getFullYear(), 10) || new Date().getFullYear();

      const vehicleDoc = {
        name,
        slug: finalSlug,
        type,
        category,
        seatingCapacity,
        luggageCapacity: {
          largeBags,
          smallBags,
        },
        ac: toBool(row["ac"], true),
        fuelType,
        transmission,
        modelYear,
        driverIncluded: toBool(row["driverIncluded"], true),
        shortDescription: (row["shortDescription"] || "").toString().trim().slice(0, 500),
        description: (row["description"] || "").toString().trim().slice(0, 10000),
        features: parseList(row["features"] || row["Features"]),
        amenities: parseList(row["amenities"] || row["Amenities"], /[,\n|]/).map((a) => a.toLowerCase()),
        status: (row["status"] || "published").toString().toLowerCase().trim() === "draft" ? "draft" : "published",
        isFeatured: toBool(row["isFeatured"], false),
        isPopular: toBool(row["isPopular"], false),
        isActive: true,
        createdBy: req.user?.id || req.admin?._id || null,
      };

      try {
        const created = await Vehicle.create(vehicleDoc);
        results.createdCount++;
        results.createdItems.push({
          id: created._id,
          name: created.name,
          slug: created.slug,
          type: created.type,
          capacity: created.seatingCapacity,
        });
      } catch (insertErr) {
        results.failedCount++;
        results.errors.push({
          row: rowNum,
          name,
          message: insertErr.message || "Failed to insert vehicle record",
        });
      }
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      `Bulk vehicle upload completed: ${results.createdCount} created, ${results.failedCount} failed.`,
      results
    );
  } catch (error) {
    console.error("Bulk Upload Vehicles Error:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, `Upload failed: ${error.message}`);
  }
};

