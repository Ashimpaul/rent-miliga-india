declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

interface PaymentOptions {
  amount: number;
  name?: string;
  description?: string;
  email?: string;
  contact?: string;
  onSuccess: (response: any) => void;
  onFailure?: (response: any) => void;
  onDismiss?: () => void;
}

export const initializePayment = ({
  amount,
  name = "RentMilega",
  description = "Premium Listing Upgrade",
  email = "",
  contact = "",
  onSuccess,
  onFailure,
  onDismiss,
}: PaymentOptions) => {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!key || key === "rzp_test_YOUR_KEY_HERE") {
    console.error("Razorpay Key ID is missing or using placeholder.");
    if (onFailure) {
      onFailure({
        error: {
          description: "Razorpay Key ID is missing. Please check your .env file.",
          code: "MISSING_KEY",
        },
      });
    }
    return;
  }

  const options = {
    key: key,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: "INR",
    name,
    description,
    image: "/logo.png",
    handler: function (response: any) {
      onSuccess(response);
    },
    prefill: {
      email,
      contact,
    },
    theme: {
      color: "#22c55e",
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss();
      },
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", function (response: any) {
    console.error("Razorpay Payment Failed:", response.error);
    if (onFailure) {
      onFailure(response);
    }
  });

  rzp.open();
};
