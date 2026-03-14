import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Terms = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Terms and Conditions | RentMilega</title>
        <meta name="description" content="Read the terms of use and copyright policies for RentMilega." />
      </Helmet>
      <Header />
      <main className="flex-1 py-20 sm:py-32">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Terms & <span className="text-primary italic">Conditions</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: March 11, 2026</p>

          <div className="mt-12 space-y-12 text-foreground/80 leading-relaxed font-light sm:text-lg">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Intellectual Property Rights</h2>
              <p>
                All content, features, and functionality on RentMilega (including but not limited to information, software, text, displays, images, video, and audio) are owned by RentMilega and are protected by international copyright, trademark, and other intellectual property or proprietary rights laws.
              </p>
              <p className="mt-4">
                You must not reproduce, distribute, modify, create derivative works of, publicly display, or publicly perform any of the material on our website without prior written consent from RentMilega.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. User Conduct & Content</h2>
              <p>
                Users are solely responsible for the content they post. By posting listings, you grant RentMilega a worldwide, non-exclusive, royalty-free license to use, copy, and display that content on the platform.
              </p>
              <p className="mt-4 font-bold text-foreground">
                Unauthorized scraping or automated collection of data from RentMilega is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Image Protection</h2>
              <p>
                To protect property owners, RentMilega applies digital watermarks to all listing images. Removal of these watermarks or unauthorized use of these images on other platforms is a violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Disclaimer</h2>
              <p>
                RentMilega provides a platform for connecting property owners and seekers. We do not guarantee the accuracy of listings and are not responsible for any transactions or disputes between users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Contact</h2>
              <p>
                If you have questions about these terms, please contact us at <a href="mailto:support@rentmilega.in" className="text-primary hover:underline">support@rentmilega.in</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
