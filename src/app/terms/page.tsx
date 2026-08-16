import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/LegalPage";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that govern your use of FibroCare.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="January 2025"
      intro="These terms cover your use of FibroCare. They are written to be plain and fair. Please read them, and reach out if anything is unclear."
      sections={[
        {
          heading: "What FibroCare is",
          body: "FibroCare is a self-tracking companion for people living with fibromyalgia and chronic pain. It helps you record daily experiences, spot patterns, and prepare for conversations with your care team.",
        },
        {
          heading: "Not medical advice",
          body: "FibroCare is not a medical device and does not diagnose, treat, or prevent any condition. It never replaces the advice of a qualified professional. If you are in crisis, contact your local emergency services.",
        },
        {
          heading: "Your account",
          body: "You are responsible for keeping your login and privacy PIN secure. If you believe your account has been accessed without your permission, please change your password and reset your PIN from your profile.",
        },
        {
          heading: "Acceptable use",
          body: "Use FibroCare for your own personal tracking. You agree not to misuse the service, attempt to access other users' data, or interfere with the app's operation.",
        },
        {
          heading: "Changes to these terms",
          body: "We may update these terms from time to time. When we do, we will note the new date at the top of this page. Continued use of FibroCare after changes means you accept the updated terms.",
        },
      ]}
    />
  );
}
