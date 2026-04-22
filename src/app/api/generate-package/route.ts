import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ApplicationPackage } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface JobInput {
  id: string;
  title: string;
  company: string;
  requirements: string[];
  description: string;
  tags: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobs } = (await req.json()) as {
      resumeText: string;
      jobs: JobInput[];
    };

    if (!resumeText || !jobs?.length) {
      return NextResponse.json(
        { error: "Resume text and jobs are required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const packages: ApplicationPackage[] = await Promise.all(
      jobs.map(async (job) => {
        const message = await client.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 1024,
          system: `You are a career coach helping a college student apply to internships.
Generate tailored application materials based on their resume and the job details.
Always respond with valid JSON only — no markdown, no extra text.`,
          messages: [
            {
              role: "user",
              content: `Resume:
${resumeText}

Job: ${job.title} at ${job.company}
Requirements: ${job.requirements.join(", ")}
Description: ${job.description}
Field: ${job.tags.join(", ")}

Generate a JSON object with these exact fields:
{
  "subject": "email subject line for this application",
  "coverLetter": "3-paragraph tailored cover letter. Sound like an enthusiastic student, not corporate. Reference the company and role specifically.",
  "skillsToEmphasize": ["up to 4 skills from their resume that match this role"],
  "tips": ["3 short, specific tips for this exact application"]
}`,
            },
          ],
        });

        const raw =
          message.content[0].type === "text" ? message.content[0].text : "{}";

        let parsed: {
          subject: string;
          coverLetter: string;
          skillsToEmphasize: string[];
          tips: string[];
        };
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = {
            subject: `Application for ${job.title} at ${job.company}`,
            coverLetter: raw,
            skillsToEmphasize: [],
            tips: [],
          };
        }

        return {
          internshipId: job.id,
          company: job.company,
          title: job.title,
          subject: parsed.subject,
          coverLetter: parsed.coverLetter,
          skillsToEmphasize: parsed.skillsToEmphasize ?? [],
          tips: parsed.tips ?? [],
        };
      })
    );

    return NextResponse.json({ packages });
  } catch (err) {
    console.error("Generate package error:", err);
    return NextResponse.json(
      { error: "Failed to generate application packages" },
      { status: 500 }
    );
  }
}
