// netlify/functions/list-pledges.js
const { MongoClient } = require("mongodb");

let cachedClient = null;

function json(statusCode, data) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
        body: JSON.stringify(data),
    };
}

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "GET") return json(405, { error: "Method Not Allowed" });

    try {
        const { MONGODB_URI, DB_NAME } = process.env;
        if (!MONGODB_URI) return json(500, { error: "Missing MONGODB_URI env var" });

        if (!cachedClient) {
            cachedClient = new MongoClient(MONGODB_URI);
            await cachedClient.connect();
        }
        const db = cachedClient.db(DB_NAME || "climate_action");
        const pledges = db.collection("pledges");

        // simple pagination
        const limit = Math.min(parseInt(event.queryStringParameters?.limit || "50", 10), 200);
        const docs = await pledges
            .find({}, { projection: { email: 0, mobile: 0 } }) // hide sensitive fields on the wall
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

        return json(200, { ok: true, pledges: docs });
    } catch (err) {
        console.error(err);
        return json(500, { error: "Server error", details: String(err) });
    }
};
