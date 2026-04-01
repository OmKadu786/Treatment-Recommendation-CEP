import dotenv from "dotenv";
dotenv.config();
const key = process.env.GEMINI_API_KEY || "AIzaSyDNjzAvZLuYXHtk888dt3B9PVYQg1Dn54Y";
const test = async () => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "hi i got a 19in my ipss" }] }],
            tools: [{ googleSearch: {} }]
        })
    });
    const d = await response.json();
    console.log(JSON.stringify(d, null, 2));
};
test();
