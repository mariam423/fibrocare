import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How FibroCare collects, stores, and protects your health data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="January 2025"
      intro="FibroCare is built on a simple promise: your health data belongs to you. This policy explains what we collect, why, and the choices you have over your information."
      sections={[
        {
          heading: "What we collect",
          body: "We collect the information you choose to record: your daily check-ins (pain, energy, sleep, mood, and any notes), resource usage, and account details such as your email and name. We do not collect data from your device beyond what is needed for the app to function.",
        },
        {
          heading: "How your data is used",
          body: "Your data is used only to power FibroCare for you: showing your trends and insights, generating your reports, and keeping your account working. We never sell your data, and we never use it to advertise to you.",
        },
        {
          heading: "Storage and security",
          body: "Your data is stored on encrypted servers and protected with industry-standard security. Access to the app itself can be locked behind a PIN of your choice, and Sensory Mode keeps your experience calm and private in shared spaces.",
        },
        {
          heading: "Your choices",
          body: "You can export or delete your data at any time from your account. Deleting your account removes your check-ins and personal details. You can also disable the optional privacy PIN whenever you like.",
        },
        {
          heading: "Medical disclaimer",
          body: "FibroCare is a self-tracking companion, not a medical device, and it does not diagnose or treat any condition. Data you record is for your own awareness and for sharing with your care team at your discretion.",
        },
      ]}
    />
  );
}
