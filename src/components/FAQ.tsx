import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What are ATS-optimized resume templates?",
      answer: "ATS (Applicant Tracking System) optimized resume templates are professionally designed resume formats that are specifically structured to pass through automated resume screening systems used by most companies. These templates use proper formatting, keyword optimization, and clean layouts that ATS systems can easily parse and understand, significantly increasing your chances of getting past the initial screening and reaching human recruiters.",
    },
    {
      question: "How do I use the STAR method?",
      answer: "The STAR method (Situation, Task, Action, Result) is a proven framework for answering behavioral interview questions. Our kit includes the STAR Story Builder for both behavioral and technical interviews, along with winning answer frameworks for common and tough questions. You'll learn how to: (1) Describe the Situation and context, (2) Explain the Task you needed to accomplish, (3) Detail the Actions you took, and (4) Highlight the Results you achieved. We provide templates and practice frameworks to help you master this technique for any interview scenario.",
    },
    // {
    //   question: "Is there a money-back guarantee?",
    //   answer: "Yes! We offer a 7-day money-back guarantee with no questions asked. If you're not completely satisfied with the Resume + Interview Mastery Kit, simply contact us within 7 days of purchase and we'll provide a full refund. We're confident in the value our kit provides, but your satisfaction is our priority.",
    // },
    {
      question: "How quickly will I receive the product?",
      answer: "You'll receive instant digital access immediately after providing your email! Once you submit your email address, you'll get instant access to all materials via the download link. There's no waiting period - you can start improving your resume and preparing for interviews right away. All files are delivered digitally in formats you can use immediately (PDF, Word, etc.).",
    },
    {
      question: "Can I use these templates for any industry?",
      answer: "Absolutely! Our 50+ resume templates are designed to work across all industries and job levels. We include templates for tech roles, finance, marketing, operations, sales, and more. Each template is ATS-optimized and can be customized to match your specific industry and role. The interview guides and salary negotiation scripts are also applicable across all industries.",
    },
    {
      question: "What format will I receive the files in?",
      answer: "You'll receive files in multiple formats for maximum flexibility: (1) PDF files for easy viewing and printing, (2) Microsoft Word (.docx) files for easy editing and customization, (3) Google Docs compatible formats, and (4) Some templates in both formats. All files are professionally formatted and ready to use immediately. You can edit, customize, and adapt them to your specific needs.",
    },
    {
      question: "Do I need any special software to use these templates?",
      answer: "No special software is required! The templates work with Microsoft Word (which most people already have), Google Docs (free), or any word processor that supports .docx files. PDF files can be viewed with any PDF reader (most browsers can open them). If you don't have Word, you can use the free Google Docs or LibreOffice to edit the templates.",
    },
    {
      question: "Will I get updates if you add new content?",
      answer: "Yes! When you download the kit, you get access to all future updates and new templates at no extra cost. As we add new resume templates, interview questions, or update our guides, you'll automatically receive access to all the new content. This ensures your career resources stay current and valuable.",
    },
    {
      question: "How is this different from free resume templates online?",
      answer: "Our templates are specifically designed to pass ATS systems (most free templates fail this), include proven frameworks like STAR Story Builder with winning answer frameworks, come with comprehensive interview preparation guides, include India-friendly salary negotiation scripts proven to work in the Indian market, and offer lifetime updates. Free templates often lack ATS optimization, don't include interview prep, and may not be suitable for the competitive Indian job market.",
    },
    {
      question: "Can I share these templates with friends or colleagues?",
      answer: "The license is for personal use only. Each download is intended for one individual. However, if you know someone who would benefit, we'd appreciate you directing them to download their own copy. This helps us continue creating valuable resources and supporting our community of professionals.",
    },
  ];

  return (
    <section id="faq" className="py-20 px-4 bg-secondary/50 scroll-mt-20" aria-labelledby="faq-heading">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="faq-heading" className="font-display text-4xl md:text-5xl text-foreground mb-4">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-lg text-muted-foreground font-body">
            Everything you need to know about the Resume + Interview Mastery Kit
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:hello@mindcove.io"
              className="text-primary hover:underline font-medium"
            >
              Email: hello@mindcove.io
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a
              href="https://wa.me/917567071072?text=Hi!%20I%20have%20a%20question%20about%20the%20Resume%20%2B%20Interview%20Mastery%20Kit."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#20BA5A] font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

