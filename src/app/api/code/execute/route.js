import { NextResponse } from "next/server";

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  c: { language: "c", version: "10.2.0" },
  cpp: { language: "c++", version: "10.2.0" },
};

export async function POST(request) {
  try {
    const { code, language } = await request.json();

    const config = LANGUAGE_MAP[language];

    if (!config) {
      return NextResponse.json({ error: `Language ${language} is not supported.` }, { status: 400 });
    }

    // Prepare payload for Piston API
    const payload = {
      language: config.language,
      version: config.version,
      files: [
        {
          name: language === "java" ? "Main.java" : undefined, // Java requires specific filename usually, or Main class
          content: code,
        },
      ],
      // stdin: "", // If we want to support stdin later
    };

    const response = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.message || "Failed to execute code via Piston API" },
        { status: response.status }
      );
    }

    // Piston returns { run: { stdout, stderr, output, code, signal } }
    // We'll return the combined output or stderr if execution failed
    const output = result.run.output || result.run.stderr || "No output";

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Execution error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
