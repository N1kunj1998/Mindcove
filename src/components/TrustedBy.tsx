const TrustedBy = () => {
  // You can replace these with actual company logos or names
  const companies = [
    "Freshworks",
    "PhonePe",
    "BigBasket",
    "Razorpay",
    "Zomato",
    "Swiggy",
  ];

  return (
    <div className="py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-wider font-medium">
          Trusted by professionals at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {companies.map((company, index) => (
            <div
              key={index}
              className="text-foreground/60 hover:text-foreground transition-colors font-semibold text-lg md:text-xl"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;





