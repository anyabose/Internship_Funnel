import type { ApplicationPackage } from "@/types";
import type { ResumeData } from "./resume-store";
import { loadProfile } from "./profile-store";

interface JobInput {
  id: string;
  title: string;
  company: string;
  requirements: string[];
  description: string;
  tags: string[];
}

export function generatePackageLocally(
  job: JobInput,
  resume: ResumeData
): ApplicationPackage {
  const profile = loadProfile();
  const name = profile.name || "I";

  // Figure out which skills from their profile match requirements
  const matchedSkills = job.requirements.filter((req) =>
    profile.skills.some(
      (s) =>
        s.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(s.toLowerCase())
    )
  );

  const skillsToEmphasize = matchedSkills.length > 0
    ? matchedSkills.slice(0, 4)
    : profile.skills.slice(0, 4);

  const field = job.tags[0] ?? "this field";
  const roleType = job.title.toLowerCase().includes("engineer") ||
    job.title.toLowerCase().includes("software") ||
    job.title.toLowerCase().includes("developer")
    ? "technical"
    : job.title.toLowerCase().includes("design")
    ? "design"
    : job.title.toLowerCase().includes("data") || job.title.toLowerCase().includes("analytics")
    ? "data"
    : "business";

  // Opening paragraph — who you are + why this company
  const opening = `I am writing to express my strong interest in the ${job.title} position at ${job.company}. As a student passionate about ${field}, I have been following ${job.company}'s work and am excited by the opportunity to contribute to your team. I believe my background and skills make me a strong fit for this role.`;

  // Middle paragraph — skills + experience
  const skillLine = skillsToEmphasize.length > 0
    ? `My experience with ${skillsToEmphasize.join(", ")} directly aligns with the requirements for this position.`
    : `I have been building skills relevant to this role and am eager to apply them in a real-world setting.`;

  const roleLines: Record<string, string> = {
    technical: `I enjoy building and problem-solving, and I thrive in fast-paced environments where I can learn quickly and make meaningful contributions to engineering projects.`,
    design: `I have a strong eye for user experience and enjoy creating intuitive, visually compelling products that solve real problems for users.`,
    data: `I enjoy working with data to uncover insights and support decision-making, and I am comfortable working across the full data pipeline from collection to visualization.`,
    business: `I am a strong communicator who enjoys working cross-functionally and am excited by the opportunity to contribute to ${job.company}'s growth and operations.`,
  };

  const middle = `${skillLine} ${roleLines[roleType]}`;

  // Closing paragraph
  const closing = `I am genuinely excited about the possibility of joining ${job.company} this summer. I would love the opportunity to bring my energy, curiosity, and skills to your team. Thank you so much for considering my application — I look forward to the possibility of speaking with you.`;

  const coverLetter = [opening, middle, closing].join("\n\n");

  // Tips
  const tips: string[] = [
    `Customize the second paragraph using a specific project or experience from your resume that relates to ${job.company}'s work.`,
    skillsToEmphasize.length > 0
      ? `Lead with ${skillsToEmphasize[0]} — it directly matches what ${job.company} is looking for.`
      : `Look up a recent ${job.company} project or product and mention it by name in your opening.`,
    `Follow up via LinkedIn 5–7 days after applying — a short message to the recruiter or hiring manager significantly boosts your chances.`,
  ];

  return {
    internshipId: job.id,
    company: job.company,
    title: job.title,
    subject: `Application for ${job.title} – ${name !== "I" ? name : "Student Applicant"}`,
    coverLetter,
    skillsToEmphasize,
    tips,
  };
}
