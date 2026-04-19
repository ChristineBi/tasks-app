export interface TaskAnalysis {
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
  reason: string;
}

export async function analyzeTask(
  tasks: { id: string; title: string; dueDate?: string }[]
): Promise<Record<string, TaskAnalysis>> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `Analyze these tasks and return a JSON object.
For each task id, provide: priority (high/medium/low), estimatedMinutes (integer), reason (one short sentence).

Tasks:
${tasks.map((t) => `- id: ${t.id}, title: "${t.title}"${t.dueDate ? `, due: ${t.dueDate}` : ""}`).join("\n")}

Return ONLY valid JSON, no markdown, no explanation:
{
  "TASK_ID": { "priority": "high", "estimatedMinutes": 60, "reason": "..." }
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("Gemini API error:", err);
    throw new Error(err.error?.message ?? "API call failed");
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
