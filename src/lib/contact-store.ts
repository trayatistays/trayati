import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: "contact" | "connect" | "property-booking";
  createdAt: string;
};

const contactFilePath = path.join(
  process.cwd(),
  "src",
  "data",
  "contact-submissions.json",
);

type ContactPayload = {
  submissions: ContactSubmission[];
  updatedAt: string;
};

async function ensureDirectory() {
  await fs.mkdir(path.dirname(contactFilePath), { recursive: true });
}

async function readPayload(): Promise<ContactPayload> {
  try {
    const raw = await fs.readFile(contactFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ContactPayload>;
    if (Array.isArray(parsed.submissions)) {
      return {
        submissions: parsed.submissions,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      };
    }
  } catch {
    // Seed on first write.
  }

  return {
    submissions: [],
    updatedAt: new Date().toISOString(),
  };
}

async function writePayload(submissions: ContactSubmission[]) {
  await ensureDirectory();
  const payload: ContactPayload = {
    submissions,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(contactFilePath, JSON.stringify(payload, null, 2), "utf8");
}

export async function getContactSubmissions() {
  const payload = await readPayload();
  return payload.submissions;
}

export async function addContactSubmission(
  submission: ContactSubmission,
) {
  const existing = await getContactSubmissions();
  const nextSubmissions = [submission, ...existing];
  await writePayload(nextSubmissions);
  return submission;
}
