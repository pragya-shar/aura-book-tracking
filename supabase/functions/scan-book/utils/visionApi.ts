
// Enhanced Google Vision API request with multiple feature types
export async function analyzeImageWithVision(apiKey: string, imageBase64: string) {
  const requestBody = {
    requests: [
      {
        image: {
          content: imageBase64,
        },
        features: [
          { type: "TEXT_DETECTION" },
          { type: "LOGO_DETECTION" },
          { type: "IMAGE_PROPERTIES" },
          { type: "OBJECT_LOCALIZATION" }
        ],
      },
    ],
  };

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `Google Vision API error: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(
      `Google Vision API request failed: ${response.statusText}`
    );
  }

  return await response.json();
}
