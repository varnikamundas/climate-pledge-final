// netlify/functions/add-pledge.js
const { MongoClient } = require("mongodb");

let cachedClient = null;

function json(statusCode, data) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",            // ok for same-origin; keeps local tools happy
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify(data),
    };
}

exports.handler = async (event) => {
    // preflight for local tools / future cross-origin use
    if (event.httpMethod === "OPTIONS") {
        return json(200, { ok: true });
    }

    if (event.httpMethod !== "POST") {
        return json(405, { error: "Method Not Allowed" });
    }

    try {
        const { MONGODB_URI, DB_NAME } = process.env;
        if (!MONGODB_URI) {
            return json(500, { error: "Missing MONGODB_URI env var" });
        }
        const body = JSON.parse(event.body || "{}");

        // basic validation (keep it simple to start)
        const required = ["name", "email", "mobile", "state", "profileType", "commitments"];
        const missing = required.filter((k) => body[k] == null || body[k] === "");
        if (missing.length) {
            return json(400, { error: `Missing fields: ${missing.join(", ")}` });
        }

        // connect (reuse across invocations to be serverless-friendly)
        if (!cachedClient) {
            cachedClient = new MongoClient(MONGODB_URI);
            await cachedClient.connect();
        }
        const db = cachedClient.db(DB_NAME || "climate_action");
        const pledges = db.collection("pledges");

        const doc = {
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            mobile: body.mobile.trim(),
            state: body.state,
            profileType: body.profileType,               // "Student" | "Working Professional" | "Workshop Participant" | "Other"
            commitments: Array.isArray(body.commitments) ? body.commitments : [],
            message: body.message?.trim() || "",
            createdAt: new Date(),
        };

        const result = await pledges.insertOne(doc);

        return json(200, { ok: true, id: result.insertedId });
    } catch (err) {
        console.error(err);
        return json(500, { error: "Server error", details: String(err) });
    }
};
