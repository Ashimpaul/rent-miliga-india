import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const CancellationRefundPolicy = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Cancellation and Refund Policy | RentMilega</title>
        <meta name="description" content="Cancellation and refund policy for RentMilega premium services." />
      </Helmet>
      <Header />
      <main className="flex-1 py-20 sm:py-32">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Cancellation & <span className="text-primary italic">Refunds</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Last updated: May 23, 2026</p>

          <div className="mt-12 space-y-12 text-foreground/80 leading-relaxed font-light sm:text-lg">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Cancellation Policy</h2>
              <p>
                Since our services are digital and delivered immediately, cancellations are generally not available 
                once the service has been activated. However, we understand that exceptional circumstances may arise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Refund Eligibility</h2>
              <p>
                Refunds may be considered in the following cases:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Service not delivered within 24 hours of payment</li>
                <li>Technical issues preventing access to purchased features</li>
                <li>Accidental duplicate payments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Refund Process</h2>
              <p>
                To request a refund, please contact our support team at <a href="mailto:support@rentmilega.in" className="text-primary hover:underline">support@rentmilega.in</a> with:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Your payment reference or transaction ID</li>
                <li>Date of purchase</li>
                <li>Reason for refund request</li>
              </ul>
              <p className="mt-4">
                Refund requests are reviewed within 3-5 business days. If approved, refunds are processed to the original payment method within 7-10 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Contact</h2>
              <p>
                For any questions about cancellations or refunds, please reach out to us at <a href="mailto:support@rentmilega.in" className="text-primary hover:underline">support@rentmilega.in</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancellationRefundPolicy;
