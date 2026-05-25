const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".product-card");
const enquiryForm = document.querySelector("#enquiry-form");
const formNote = document.querySelector("[data-form-note]");
const yearTarget = document.querySelector("[data-year]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

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
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter || "all";

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    productCards.forEach((card) => {
      const shouldShow = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

if (enquiryForm) {
  enquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(enquiryForm);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const type = String(data.get("type") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = encodeURIComponent(`Website enquiry - ${type || "Taam Food Products"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Enquiry type: ${type}`,
        "",
        "Message:",
        message || "Please contact me with more details.",
      ].join("\n"),
    );

    if (formNote) {
      formNote.textContent = "Opening your email app with the enquiry details.";
    }

    window.location.href = `mailto:taamfoodproducts@gmail.com?subject=${subject}&body=${body}`;
  });
}
