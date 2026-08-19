export interface OnboardingSlide {
  key: string;
  title: string;
  text: string;
  image: number | { uri: string };
}

const slides: OnboardingSlide[] = [
  {
    key: "1",
    title: "All-in-One Business OS",
    text: "Manage sales, track operations, and run your entire Kenyan business from one dashboard.",
    image: require("../assets/duka-owner.jpg"), // keep your local image
  },
  {
    key: "2",
    title: "Instant M-Pesa & Bank Payouts",
    text: "Accept customer payments seamlessly and handle bank payouts with zero delay.",
    image: {
      uri: "https://www.safaricom.co.ke/images/calendars/m-pesa-go-banner.png",
    },
  },
  {
    key: "3",
    title: "Automated KRA eTIMS",
    text: "Eliminate compliance risks with automated tax invoicing and seamless eTIMS integration.",
    image: {
      uri: "https://scale.co.ke/blog/wp-content/uploads/2025/06/KRA-eTims--793x397.jpg",
    },
  },
  {
    key: "4",
    title: "Multi-Branch & Payroll",
    text: "Create branches, monitor performance, and process staff payroll effortlessly.",
    image: {
      uri: "https://checkoutchamp.com/uploads/extra/multi_store1.png",
    },
  },
];

export default slides;
