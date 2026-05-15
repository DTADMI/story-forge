import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log("[EMAIL] Not configured:", params.subject);
    return;
  }
  await resend.emails.send({
    from: "StoryForge <noreply@storyforge.app>",
    ...params,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/verify?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Verify your StoryForge email",
    html: `<p>Click to verify: <a href="${link}">${link}</a></p>`,
  });
}
