// ============================================================
// ZERO-DEPENDENCY ZIP GENERATOR FOR NODE.JS
// Compliant with PKWARE ZIP Specification 2.0 (UTF-8)
// STORED mode (uncompressed) - optimal for JPEG/PNG/WebP/MP4
// ============================================================

function createCrc32Table() {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
}

const crcTable = createCrc32Table();

export function calculateCrc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

/**
 * Builds a valid ZIP file Buffer from an array of files.
 * @param {Array<{ name: string, data: Buffer, date?: Date }>} files
 * @returns {Buffer}
 */
export function buildZipBuffer(files) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (Math.floor(now.getSeconds() / 2))) & 0xFFFF;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

  for (const file of files) {
    const filenameBuf = Buffer.from(file.name, "utf-8");
    const fileData = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);
    const crc = calculateCrc32(fileData);
    const size = fileData.length;

    // --- Local File Header (30 bytes + name length) ---
    const lh = Buffer.alloc(30 + filenameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0); // signature
    lh.writeUInt16LE(20, 4);          // min version (2.0)
    lh.writeUInt16LE(0x0800, 6);       // flags: bit 11 set for UTF-8 filename
    lh.writeUInt16LE(0, 8);            // compression: 0 (STORED)
    lh.writeUInt16LE(dosTime, 10);     // mod time
    lh.writeUInt16LE(dosDate, 12);     // mod date
    lh.writeUInt32LE(crc, 14);         // CRC-32
    lh.writeUInt32LE(size, 18);        // compressed size
    lh.writeUInt32LE(size, 22);        // uncompressed size
    lh.writeUInt16LE(filenameBuf.length, 26); // filename length
    lh.writeUInt16LE(0, 28);           // extra field length
    filenameBuf.copy(lh, 30);

    localHeaders.push(lh, fileData);

    // --- Central Directory Header (46 bytes + name length) ---
    const ch = Buffer.alloc(46 + filenameBuf.length);
    ch.writeUInt32LE(0x02014b50, 0); // signature
    ch.writeUInt16LE(20, 4);          // version made by
    ch.writeUInt16LE(20, 6);          // min version (2.0)
    ch.writeUInt16LE(0x0800, 8);       // flags: UTF-8
    ch.writeUInt16LE(0, 10);           // compression: 0 (STORED)
    ch.writeUInt16LE(dosTime, 12);     // mod time
    ch.writeUInt16LE(dosDate, 14);     // mod date
    ch.writeUInt32LE(crc, 16);         // CRC-32
    ch.writeUInt32LE(size, 20);        // compressed size
    ch.writeUInt32LE(size, 24);        // uncompressed size
    ch.writeUInt16LE(filenameBuf.length, 28); // filename length
    ch.writeUInt16LE(0, 30);           // extra field length
    ch.writeUInt16LE(0, 32);           // file comment length
    ch.writeUInt16LE(0, 34);           // disk number start
    ch.writeUInt16LE(0, 36);           // internal file attributes
    ch.writeUInt32LE(0, 38);           // external file attributes
    ch.writeUInt32LE(offset, 42);      // relative offset of local header
    filenameBuf.copy(ch, 46);

    centralHeaders.push(ch);

    offset += lh.length + fileData.length;
  }

  const centralDirOffset = offset;
  const centralDirSize = centralHeaders.reduce((acc, h) => acc + h.length, 0);

  // --- End of Central Directory Record (22 bytes) ---
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);        // signature
  eocd.writeUInt16LE(0, 4);                 // disk number
  eocd.writeUInt16LE(0, 6);                 // disk with start of central directory
  eocd.writeUInt16LE(files.length, 8);       // total entries on this disk
  eocd.writeUInt16LE(files.length, 10);      // total entries
  eocd.writeUInt32LE(centralDirSize, 12);    // size of central directory
  eocd.writeUInt32LE(centralDirOffset, 16);  // offset of central directory
  eocd.writeUInt16LE(0, 20);                // comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

/**
 * Downloads a list of media assets from their URLs in parallel and returns array of file objects
 * @param {Array<Object>} mediaItems
 * @returns {Promise<Array<{ name: string, data: Buffer }>>}
 */
export async function fetchMediaBuffers(mediaItems) {
  const nameCount = new Map();
  const results = [];

  // Concurrency limit to avoid overwhelming memory/network
  const BATCH_SIZE = 8;
  for (let i = 0; i < mediaItems.length; i += BATCH_SIZE) {
    const chunk = mediaItems.slice(i, i + BATCH_SIZE);
    const chunkPromises = chunk.map(async (item) => {
      try {
        const fileUrl = item.secureUrl || item.url;
        if (!fileUrl) return null;

        const res = await fetch(fileUrl);
        if (!res.ok) {
          console.warn(`Failed to fetch media file for zip from ${fileUrl}: ${res.statusText}`);
          return null;
        }

        const arrayBuf = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuf);

        // Sanitize filename
        const ext = item.format || (fileUrl.split(".").pop().split(/[?#]/)[0] || "jpg");
        let baseName = (item.name || item.originalName || "image")
          .replace(/[\\/:*?"<>|]/g, "_")
          .trim();
        if (baseName.toLowerCase().endsWith("." + ext.toLowerCase())) {
          baseName = baseName.substring(0, baseName.lastIndexOf("."));
        }

        // Avoid duplicate filenames in zip
        const fullName = `${baseName}.${ext}`;
        let finalName = fullName;
        if (nameCount.has(fullName)) {
          const count = nameCount.get(fullName) + 1;
          nameCount.set(fullName, count);
          finalName = `${baseName}_(${count}).${ext}`;
        } else {
          nameCount.set(fullName, 0);
        }

        return {
          name: finalName,
          data: buf,
        };
      } catch (err) {
        console.error(`Error downloading media item ${item._id}:`, err);
        return null;
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    for (const r of chunkResults) {
      if (r) results.push(r);
    }
  }

  return results;
}
