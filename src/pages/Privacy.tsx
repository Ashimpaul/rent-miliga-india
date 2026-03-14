import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Privacy Policy | RentMilega</title>
        <meta name="description" content="Read the privacy policy for RentMilega and learn how we protect your data." />
      </Helmet>
      <Header />
      <main className="flex-1 py-20 sm:py-32">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Privacy <span className="text-primary italic">Policy</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: March 11, 2026</p>

          <div className="mt-12 space-y-12 text-foreground/80 leading-relaxed font-light sm:text-lg">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information Collection</h2>
              <p>
                RentMilega is designed to be as private as possible. We do not require account creation to browse or post listings. However, we collect some basic information like your IP address, browser type, and listing details (phone numbers, addresses, photos) that you choose to provide.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Information</h2>
              <p>
                The information you provide is used solely to provide the rental listing service. Phone numbers and property details are displayed publicly to allow potential tenants to contact you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Sharing</h2>
              <p>
                We do not sell or rent your personal information to third parties. We share your property information only with the public through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Security</h2>
              <p>
                We use industry-standard security measures to protect your data. This includes JavaScript obfuscation to prevent unauthorized data scraping and image watermarking to prevent unauthorized photo usage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Contact</h2>
              <p>
                If you have questions about your privacy, please contact us at <a href="mailto:privacy@rentmilega.in" className="text-primary hover:underline">privacy@rentmilega.in</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
