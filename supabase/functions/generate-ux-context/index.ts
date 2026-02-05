import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  word: string;
  definition: string;
  translation?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("context, level, goal")
      .eq("id", user.id)
      .single();

    const userContext = profile?.context || "UX Designer";
    const userLevel = profile?.level || "A2";

    // Parse request body
    const { word, definition, translation }: RequestBody = await req.json();

    if (!word) {
      return new Response(
        JSON.stringify({ error: "Missing 'word' in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Gemini prompt
    const prompt = `You are an English teacher helping a ${userContext} learn professional English at ${userLevel} level.

The vocabulary word is: "${word}"
Definition: ${definition || "N/A"}
${translation ? `Spanish translation: ${translation}` : ""}

Generate a realistic, practical example sentence that a ${userContext} would use in their daily work. 
The example should be about real UX/Design scenarios like:
- Presenting designs in Figma
- Conducting user research
- Design reviews with stakeholders
- Collaborating with developers
- Usability testing

Respond in JSON format:
{
  "example_sentence": "The example sentence using the word",
  "scenario": "Brief description of the work scenario (e.g., 'Design Review Meeting')",
  "tip": "A quick pronunciation or usage tip for Spanish speakers"
}`;

    // Call Gemini API
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to generate context" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData: GeminiResponse = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from Gemini response
    let parsedResponse;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { example_sentence: generatedText };
    } catch {
      parsedResponse = { example_sentence: generatedText, scenario: "Professional context", tip: "" };
    }

    return new Response(
      JSON.stringify({
        word,
        definition,
        translation,
        context: userContext,
        ...parsedResponse,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
