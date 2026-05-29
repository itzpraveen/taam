const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const filterButtons = document.querySelectorAll(".filter-button");
const rangeButtons = document.querySelectorAll("[data-range-filter]");
const productCards = document.querySelectorAll(".product-card");
const enquiryForm = document.querySelector("#enquiry-form");
const formNote = document.querySelector("[data-form-note]");
const yearTarget = document.querySelector("[data-year]");
const siteHeader = document.querySelector("[data-header]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const updateHeaderState = () => {
  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  }
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Tasteful scroll-reveal — only when the user hasn't asked to reduce motion.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".section-header, .range-spotlight, .standard-copy, .standard-point, .product-card, .taste-card, .story-copy, .story-showcase, .story-points li, .plan-grid article, .quality-points article, .channel-grid > div, .retail-band__content, .contact-copy, .enquiry-form",
  );

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    // Stagger items that share a parent for a gentle cascade.
    const siblings = Array.from(el.parentElement ? el.parentElement.children : []);
    const index = siblings.indexOf(el);
    if (index > 0) {
      el.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
    }
    observer.observe(el);
  });
}

const applyProductFilter = (selected) => {
  filterButtons.forEach((item) => {
    const isActive = item.dataset.filter === selected;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  productCards.forEach((card) => {
    const shouldShow = selected === "all" || card.dataset.category === selected;
    card.classList.toggle("is-hidden", !shouldShow);
  });
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyProductFilter(button.dataset.filter || "all");
  });
});

rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyProductFilter(button.dataset.rangeFilter || "all");
    document.querySelector(".filter-bar")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });
  });
});

if (enquiryForm) {
  const emailButton = enquiryForm.querySelector("[data-send-email]");

  const readEnquiry = () => {
    const data = new FormData(enquiryForm);
    return {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      type: String(data.get("type") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };
  };

  const enquiryLines = ({ name, phone, type, message }) => [
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Enquiry type: ${type}`,
    "",
    "Message:",
    message || "Please contact me with more details.",
  ];

  // Primary action: open WhatsApp with the enquiry pre-filled.
  enquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) {
      return;
    }
    const enquiry = readEnquiry();
    const text = encodeURIComponent(
      ["Website enquiry - Taam Food Products", "", ...enquiryLines(enquiry)].join("\n"),
    );

    if (formNote) {
      formNote.textContent = "Opening WhatsApp with your enquiry details.";
    }

    window.open(`https://wa.me/916238544807?text=${text}`, "_blank", "noopener");
  });

  // Fallback action: open the user's email app instead.
  if (emailButton) {
    emailButton.addEventListener("click", () => {
      if (!enquiryForm.reportValidity()) {
        return;
      }
      const enquiry = readEnquiry();
      const subject = encodeURIComponent(`Website enquiry - ${enquiry.type || "Taam Food Products"}`);
      const body = encodeURIComponent(enquiryLines(enquiry).join("\n"));

      if (formNote) {
        formNote.textContent = "Opening your email app with the enquiry details.";
      }

      window.location.href = `mailto:taamfoodproducts@gmail.com?subject=${subject}&body=${body}`;
    });
  }
}
