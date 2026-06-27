import fetch from "node-fetch";

async function testKey(key, name) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
  });
  const json = await res.json();
  console.log(`\n=== Testing ${name} ===`);
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(json, null, 2));
}

async function run() {
  await testKey("dummy_key", "dummy_key");
  await testKey("AQ.Ab8RN6JZvTZ6m5k6PRiJ35e8LsoasL_bV76t8YXcrF54pDiVNQ", "user_key");
}
run();
