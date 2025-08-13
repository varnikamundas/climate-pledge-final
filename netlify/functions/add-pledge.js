// netlify/functions/add-pledge.js
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const data = JSON.parse(event.body); // Read pledge data from frontend

        console.log("Received pledge:", data);

        // TODO: Save to database here later
        // For now, just return it back as confirmation
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Pledge received successfully!",
                pledge: data,
            }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Server Error" }),
        };
    }
};
