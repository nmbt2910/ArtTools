import { fetchArtTools } from './apiService';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCHK2WzA87T30velh9mgYxX3RC5be1OPIA';
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

// Cache for products data to avoid repeated API calls
let productsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION) || 5 * 60 * 1000; // 5 minutes

const getProductsData = async () => {
  const now = Date.now();
  if (productsCache && (now - lastCacheTime) < CACHE_DURATION) {
    return productsCache;
  }

  try {
    const products = await fetchArtTools();
    productsCache = products;
    lastCacheTime = now;
    return products;
  } catch (error) {
    console.error('Error fetching products for AI context:', error);
    throw error;
  }
};

const createSystemPrompt = (products) => {
  const productsContext = products.map(product => 
    `ID: ${product.id}, Name: ${product.artName}, Brand: ${product.brand}, Price: $${product.price}, Glass Surface: ${product.glassSurface}, Limited Time Deal: ${product.limitedTimeDeal}%`
  ).join('\n');

  return `You are an AI assistant for an art tools e-commerce app. You can ONLY discuss products from this specific catalog. Here are the available products:

${productsContext}

IMPORTANT RULES:
1. ONLY talk about products from the above list
2. When mentioning products, always include their ID, name, brand, and price
3. If user asks about brands, products, or recommendations, provide relevant products from the catalog
4. If you mention specific products, format them as: [PRODUCT:ID:NAME:BRAND:PRICE] so the app can display them as clickable items
5. Be helpful but stay within the product catalog scope
6. If asked about products not in the catalog, politely explain you can only discuss the available art tools

Example response format:
"Here are some great art tools from [BRAND]: [PRODUCT:1:Professional Brush Set:ArtPro:$25.99] and [PRODUCT:2:Watercolor Palette:ArtPro:$18.50]. These are excellent choices for your art projects."`;
};

export const sendMessageToAI = async (userMessage) => {
  try {
    const products = await getProductsData();
    const systemPrompt = createSystemPrompt(products);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nUser question: ${userMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const urlWithKey = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(urlWithKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error Response:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid API response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Extract product references from the response
    const productReferences = extractProductReferences(aiResponse, products);
    
    return {
      message: aiResponse,
      products: productReferences
    };
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};

const extractProductReferences = (aiResponse, products) => {
  const productPattern = /\[PRODUCT:(\d+):([^:]+):([^:]+):([^:]+)\]/g;
  const references = [];
  let match;

  while ((match = productPattern.exec(aiResponse)) !== null) {
    const [, id, name, brand, price] = match;
    const product = products.find(p => p.id === id);
    if (product) {
      references.push(product);
    }
  }

  return references;
};

export const getProductSuggestions = async (query) => {
  try {
    const products = await getProductsData();
    
    // Simple search for products matching the query
    const suggestions = products.filter(product => 
      product.artName.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions

    return suggestions;
  } catch (error) {
    console.error('Error getting product suggestions:', error);
    return [];
  }
};

