/**
 * oura — Hardware Tracker & GPS Ingestion Service
 * Listens on TCP (port 5001) for commercial GSM/GPS trackers
 * Also exposes HTTP endpoints (port 5002) for webhooks (Ruhavik / Traccar / Google Find My).
 */

const net = require("net");
const http = require("http");

const TCP_PORT = process.env.TRACKER_TCP_PORT || 5001;
const HTTP_PORT = process.env.INGESTION_HTTP_PORT || 5002;

// In-memory rapid coordinate retrieval cache (Redis replacement for Phase 1)
const coordinateCache = new Map();

// Active tracker-to-shipment mapping
const trackerShipmentMap = new Map([
  ["TRK-FINDMY-09", "H314315796"],
  ["TRK-002", "K37856307"],
  ["TRK-CONCOX-101", "H314315796"],
]);

/**
 * Parses raw GPS data strings from commercial GSM trackers.
 * Format 1: Text string: "DEVICE_ID,LAT,LNG,SPEED,TIMESTAMP"
 * Format 2: NMEA $GPRMC string
 * Format 3: GT06 / Concox protocol
 */
function parseGpsStream(rawData) {
  const str = rawData.toString().trim();

  // Format 1: CSV stream "TRK-001,5.6037,-0.1870,65,2026-10-18T19:00:00Z"
  if (str.includes(",")) {
    const parts = str.split(",");
    if (parts.length >= 3) {
      const deviceId = parts[0].trim();
      const lat = parseFloat(parts[1]);
      const lng = parseFloat(parts[2]);
      const speed = parts.length > 3 ? parseFloat(parts[3]) : 0;
      const timestamp = parts.length > 4 ? parts[4] : new Date().toISOString();

      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          deviceId,
          lat,
          lng,
          speed,
          timestamp,
          source: "commercial_gsm_tracker",
        };
      }
    }
  }

  // Format 2: JSON payload
  try {
    const json = JSON.parse(str);
    if (json.deviceId && json.lat && json.lng) {
      return {
        deviceId: json.deviceId,
        lat: parseFloat(json.lat),
        lng: parseFloat(json.lng),
        speed: parseFloat(json.speed || 0),
        timestamp: json.timestamp || new Date().toISOString(),
        source: "json_tracker_payload",
      };
    }
  } catch (e) {}

  return null;
}

/**
 * Persists ping and updates rapid coordinate cache
 */
async function processPing(ping) {
  const shipmentId = trackerShipmentMap.get(ping.deviceId) || ping.deviceId;

  const record = {
    shipment_id: shipmentId,
    tracker_id: ping.deviceId,
    lat: ping.lat,
    lng: ping.lng,
    speed_kmh: ping.speed,
    timestamp: ping.timestamp,
    source: ping.source,
  };

  // Cache in-memory for instant 0ms retrieval
  coordinateCache.set(shipmentId, record);

  console.log(
    `[GPS Ingested] Device: ${ping.deviceId} ➔ Shipment: ${shipmentId} | Lat: ${ping.lat}, Lng: ${ping.lng} | Speed: ${ping.speed} km/h`
  );

  // Push to oura Next.js API if running
  try {
    const payload = JSON.stringify(record);
    const req = http.request(
      "http://localhost:3000/api/pings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {}
    );
    req.on("error", () => {}); // silent if Next.js not running locally
    req.write(payload);
    req.end();
  } catch (err) {}

  return record;
}

// ── 1. TCP Server for Commercial GSM/GPS Trackers ──────────────────────────
const tcpServer = net.createServer((socket) => {
  const clientAddr = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[TCP Connection] Tracker connected from ${clientAddr}`);

  socket.on("data", async (data) => {
    const parsed = parseGpsStream(data);
    if (parsed) {
      await processPing(parsed);
      socket.write(`ACK,${parsed.deviceId},OK\r\n`);
    } else {
      socket.write(`ERR,INVALID_FORMAT\r\n`);
    }
  });

  socket.on("error", (err) => {
    console.error(`[TCP Error ${clientAddr}]`, err.message);
  });
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`[oura Hardware Ingestion] TCP listener running on port ${TCP_PORT}`);
});

// ── 2. HTTP Server for Webhook Ingestion & Cache Retrieval ──────────────────
const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "healthy", service: "oura-gps-ingestion" }));
  }

  // Get cached coordinate
  if (url.pathname === "/coordinates" && req.method === "GET") {
    const shipmentId = url.searchParams.get("shipment_id");
    const cached = coordinateCache.get(shipmentId);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ success: true, coordinate: cached || null }));
  }

  // Ingest via HTTP POST
  if (url.pathname === "/ingest" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const parsed = parseGpsStream(body);
      if (parsed) {
        const result = await processPing(parsed);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: true, ping: result }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, error: "Unrecognized GPS format" }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`[oura Ingestion API] HTTP webhook listener running on port ${HTTP_PORT}`);
});

module.exports = { parseGpsStream, processPing, coordinateCache };
