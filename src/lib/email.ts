
type Email = { to: string; subject: string; text: string };

// Email provajder još nije izabran (Resend, SES, SMTP…). Dok ne bude,
// poruke se ispisuju u konzolu servera — linkovi za reset lozinke i
// verifikaciju se tako mogu kopirati direktno iz terminala.
export async function sendEmail({ to, subject, text }: Email) {
  if (process.env.SUPPRESS_EMAIL === '1') return;
  console.log(
    `\n──── EMAIL (dev) ────\nZa: ${to}\nNaslov: ${subject}\n\n${text}\n────────────────────\n`,
  );
}
