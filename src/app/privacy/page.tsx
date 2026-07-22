import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "~/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | PathToMajor",
};

const CONTACT_EMAIL = "josephebarrera@gmail.com";

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="July 20, 2026">
      <LegalSection title="1. Introduction">
        <p>
          PathToMajor ("we," "us," "our") is committed to protecting your
          personal information. This policy explains what information we collect
          when you use the app, how we use it, and the choices you have.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong className="font-semibold text-foreground">
            Account information.
          </strong>{" "}
          When you sign up, we collect your email address and name, either
          directly (email/password) or from Google if you sign in with Google.
        </p>
        <p>
          <strong className="font-semibold text-foreground">
            Profile information.
          </strong>{" "}
          Grade level, intended major(s), and whether you're still exploring
          majors — all optional, entered by you.
        </p>
        <p>
          <strong className="font-semibold text-foreground">
            Activity information.
          </strong>{" "}
          Everything you log about your extracurriculars: name, category,
          organization, description, dates, leadership role, skills, and hours.
        </p>
        <p>
          <strong className="font-semibold text-foreground">
            AI feedback data.
          </strong>{" "}
          When you request AI feedback on an activity, we send relevant details
          (the activity's name, category, organization, leadership role,
          description, skills, your grade level, and intended major) to Google's
          Gemini API to generate a summary, alignment score, and suggestions.
          The response is saved back to your account.
        </p>
        <p>
          We don't collect payment information — PathToMajor is free. We don't
          use advertising or tracking cookies; the only cookies we set are the
          ones needed to keep you signed in.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <p>
          To provide the service: storing your activities, generating AI
          feedback, showing your dashboard and progress, and keeping your
          account secure. We also use it to communicate essential
          service-related information and to improve PathToMajor.
        </p>
      </LegalSection>

      <LegalSection title="4. Who we share information with">
        <p>
          We don't sell your personal information, and we don't share it with
          advertisers. We work with a small number of service providers who
          process data on our behalf:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="font-semibold text-foreground">Supabase</strong>{" "}
            — hosts our database and handles authentication.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Google</strong> —
            processes the activity and profile details described above via the
            Gemini API to generate AI feedback, and acts as an OAuth provider if
            you choose to sign in with Google.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Data retention">
        <p>
          We keep your information for as long as your account is active. You
          can delete individual activities at any time from within the app. To
          delete your account and all associated data, email us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>
          You can access, correct, or delete your information at any time. For
          requests you can't complete yourself in the app, contact us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Children's privacy">
        <p>
          PathToMajor is intended for users age 13 and older. We don't knowingly
          collect information from children under 13. If you believe a child
          under 13 has created an account, contact us and we'll delete the
          associated data.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use industry-standard safeguards, including row-level database
          security so your data is only accessible to your own account. No
          method of storage or transmission is completely secure, so we can't
          guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to this policy">
        <p>
          If we make material changes to this policy, we'll update the "last
          updated" date above and, where appropriate, notify you directly.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact us">
        <p>
          Questions about this policy or your data? Email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          . See also our{" "}
          <Link
            href="/terms"
            className="text-accent underline underline-offset-2"
          >
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
