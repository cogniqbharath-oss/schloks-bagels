// ==========================================
// SCHLOK's BAGELS AI WORKER CONFIGURATION
// Worker URL: https://divine-water-8da3.cogniq-bharath.workers.dev/
// ==========================================

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // AI Chatbot Backend Logic (POST)
    if (request.method === "POST") {
      try {
        const { message } = await request.json();
        
        // Configured dynamically as requested
        const apiKey = env.API_KEY_schloks;
        const model = "gemma-3-27b-it";
        
        if (!apiKey || apiKey.length < 10) {
           return new Response(JSON.stringify({ response: "Error: Your API_KEY_schloks is missing or invalid. Please check your Cloudflare secrets." }), {
             headers: { ...corsHeaders, "Content-Type": "application/json" }
           });
        }

        const instruction = "System: You are a friendly, normal human working at the counter of Schlok's Bagels & Lox. Answer questions in a very simple, warm, and natural conversational way. Keep answers super brief, human, and casual. Address operational pain points easily.\n\nUser: ";

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: instruction + message }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 150
            }
          }),
        });

        const data = await response.json();
        
        if (data.error) {
           return new Response(JSON.stringify({ response: `API Error: ` + data.error.message }), {
             headers: { ...corsHeaders, "Content-Type": "application/json" }
           });
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

        return new Response(JSON.stringify({ response: aiResponse }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ response: "Internal Worker Error: " + e.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "text/plain" }
    });
  },
};
