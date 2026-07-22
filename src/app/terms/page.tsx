import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "~/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | PathToMajor",
};

const CONTACT_EMAIL = "josephebarrera@gmail.com";

export default function TermsOfUse() {
  return (
    <LegalPage title="Terms of Service" effectiveDate="July 20, 2026">
      <LegalSection title="1. Acceptance of terms">
        <p>
          By creating an account or using PathToMajor, you agree to these terms.
          If you don't agree, please don't use the app.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 13 years old to use PathToMajor. If you're under
          18, you should have a parent or guardian's permission to use the app.
        </p>
      </LegalSection>

      <LegalSection title="3. Description of service">
        <p>
          PathToMajor helps high school students log extracurricular activities
          and see, through AI-generated feedback, how those activities connect
          to a college major. It's currently free to use. We may introduce paid
          plans in the future; if we do, we'll tell you clearly before anything
          changes for your account.
        </p>
      </LegalSection>

      <LegalSection title="4. Your account">
        <p>
          You're responsible for the accuracy of the information you provide and
          for keeping your account credentials secure. You're responsible for
          activity that happens under your account.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Submit false, misleading, or someone else's information</li>
          <li>
            Use the app to generate or store unlawful, harmful, or abusive
            content
          </li>
          <li>
            Attempt to disrupt, reverse-engineer, or abuse the AI feedback
            feature (for example, automated or excessive requests)
          </li>
          <li>Attempt to access another user's account or data</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Your content">
        <p>
          You own the activity information and other content you enter into
          PathToMajor. By using the app, you give us permission to store and
          process that content — including sending relevant parts of it to
          Google's Gemini API — solely to provide the AI feedback feature to
          you. See our{" "}
          <Link
            href="/privacy"
            className="text-accent underline underline-offset-2"
          >
            Privacy Policy
          </Link>{" "}
          for details on what's shared and with whom.
        </p>
      </LegalSection>

      <LegalSection title="7. AI feedback disclaimer">
        <p>
          AI-generated summaries, alignment scores, and suggestions are produced
          by a third-party AI model and are meant to be a helpful starting
          point, not professional college counseling or admissions advice. They
          may be inaccurate or incomplete, and they are not a prediction or
          guarantee of any college admissions outcome. Use your own judgment,
          and talk to a school counselor for decisions that matter.
        </p>
      </LegalSection>

      <LegalSection title="8. Termination">
        <p>
          You can stop using PathToMajor and request account deletion at any
          time by emailing{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          . We may suspend or terminate accounts that violate these terms.
        </p>
      </LegalSection>

      <LegalSection title="9. No warranty">
        <p>
          PathToMajor is provided "as is" and "as available," without warranties
          of any kind. We don't guarantee the app will be uninterrupted,
          error-free, or that AI feedback will be accurate.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of liability">
        <p>
          To the fullest extent permitted by law, PathToMajor and its creators
          aren't liable for indirect, incidental, or consequential damages
          arising from your use of the app.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to these terms">
        <p>
          We may update these terms from time to time. If we make material
          changes, we'll update the "last updated" date above and, where
          appropriate, notify you directly.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact us">
        <p>
          Questions about these terms? Email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-accent underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
