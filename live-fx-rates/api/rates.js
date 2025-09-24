// This is the code for /api/rates.js
// It automatically tries multiple API sources for maximum reliability.

const API_ENDPOINTS = [
  "https://api.exchangerate.host/latest?base=NGN",
  "https://api.frankfurter.app/latest?from=NGN",
  "https://open.er-api.com/v6/latest/NGN"
];

export default async function handler(request, response) {
  // Loop through each API endpoint.
  for (const apiUrl of API_ENDPOINTS) {
    try {
      // Attempt to fetch data from the current API URL.
      const apiResponse = await fetch(apiUrl);
      
      // If the response is not 'ok' (e.g., a 404 or 500 error),
      // throw an error to trigger the 'catch' block and try the next URL.
      if (!apiResponse.ok) {
        throw new Error(`API fetch failed with status: ${apiResponse.status}`);
      }
      
      const data = await apiResponse.json();

      // Ensure the data has the 'rates' object we need.
      if (!data || !data.rates) {
        throw new Error('API response did not contain a "rates" object.');
      }

      // --- Success! ---
      // Set headers for caching and to allow your blog to use it (CORS).
      response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache for 1 hour
      response.setHeader('Access-Control-Allow-Origin', '*');
      
      // Send the successful data back and stop the function.
      return response.status(200).json(data);

    } catch (error) {
      // If an error occurred, log it for debugging on Vercel
      // and let the loop continue to the next API endpoint.
      console.error(`Failed to fetch from ${apiUrl}:`, error.message);
    }
  }

  // --- Failure ---
  // If the loop finishes without a successful fetch, send a final error response.
  response.status(503).json({ error: 'All currency data sources are currently unavailable.' });
}