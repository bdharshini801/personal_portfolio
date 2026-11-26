"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle?.querySelector("i");

  // DARK / LIGHT THEME

  function updateThemeIcon() {
    if (!themeIcon) return;

    const light = root.dataset.theme === "light";

    themeIcon.className = light
      ? "bi bi-moon-fill"
      : "bi bi-sun-fill";

    themeToggle.setAttribute(
      "aria-label",
      light ? "Switch to dark theme" : "Switch to light theme"
    );
  }

  updateThemeIcon();

  themeToggle?.addEventListener("click", () => {

    root.dataset.theme =
      root.dataset.theme === "light" ? "dark" : "light";

    localStorage.setItem("portfolio-theme", root.dataset.theme);

    updateThemeIcon();

  });


  // TYPING ANIMATION

  const typedText = document.getElementById("typedText");

  const roles = [
    "Web Developer",
    "Java Developer",
    "Problem Solver",
    "CSE Student"
  ];

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = false;

  function typeRole() {

    if (!typedText) return;

    const current = roles[roleIndex];

    if (deleting) {
      charIndex--;
      typedText.textContent = current.slice(0, charIndex);
    } else {
      charIndex++;
      typedText.textContent = current.slice(0, charIndex);
    }

    let delay = deleting ? 45 : 85;

    if (!deleting && charIndex === current.length) {
      deleting = true;
      delay = 1300;
    }

    else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 350;
    }

    window.setTimeout(typeRole, delay);
  }

  window.setTimeout(typeRole, 1600);


  // SCROLL REVEAL AND SKILL BAR ANIMATION

  if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");

          entry.target.querySelectorAll(".progress-bar").forEach(bar => {

            bar.style.width = `${bar.dataset.width || 0}%`;

          });

          observer.unobserve(entry.target);

        });

      },
      { threshold: 0.14 }
    );

    document.querySelectorAll(".reveal, .skill-card").forEach(el => {
      revealObserver.observe(el);
    });

  } else {

    document.querySelectorAll(".reveal, .skill-card").forEach(el => {
      el.classList.add("visible");
    });

  }


  // NAVBAR SCROLL SPY

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");

  if ("IntersectionObserver" in window) {

    const navObserver = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          navLinks.forEach(link => {

            const active =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }

          });

        });

      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    sections.forEach(section => navObserver.observe(section));

  }


  // MOBILE NAVBAR CLOSE

  const navMenu = document.getElementById("navMenu");

  navLinks.forEach(link => {

    link.addEventListener("click", () => {

      if (
        navMenu?.classList.contains("show") &&
        window.bootstrap
      ) {

        bootstrap.Collapse
          .getOrCreateInstance(navMenu)
          .hide();

      }

    });

  });


  // PROJECT FILTER

  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(".project-item");

  filterButtons.forEach(button => {

    button.addEventListener("click", () => {

      filterButtons.forEach(item => {

        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");

      });

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      const filter = button.dataset.filter;

      projectItems.forEach(project => {

        project.hidden =
          filter !== "all" &&
          project.dataset.category !== filter;

      });

    });

    button.setAttribute(
      "aria-pressed",
      button.classList.contains("active") ? "true" : "false"
    );

  });


  // CONTACT FORM VALIDATION

  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setInvalid(field, invalid) {

    field.classList.toggle("is-invalid", invalid);

    field.setAttribute(
      "aria-invalid",
      invalid ? "true" : "false"
    );

  }


  // FORMSPREE SUBMISSION

  form?.addEventListener("submit", async event => {

    event.preventDefault();

    if (status) status.textContent = "";

    const name = form.elements.name;
    const email = form.elements.email;
    const subject = form.elements.subject;
    const message = form.elements.message;

    const checks = [

      [name, name.value.trim().length > 0],

      [email, emailPattern.test(email.value.trim())],

      [subject, subject.value.trim().length > 0],

      [message, message.value.trim().length >= 20]

    ];

    checks.forEach(([field, valid]) => {
      setInvalid(field, !valid);
    });

    const firstInvalid = checks.find(
      ([, valid]) => !valid
    )?.[0];

    if (firstInvalid) {

      firstInvalid.focus();

      if (status) {
        status.textContent =
          "Please check the highlighted fields.";
      }

      return;
    }


    // REPLACE WITH YOUR FORMSPREE FORM ID

    const endpoint = "https://formspree.io/f/YOUR_FORMSPREE_ID";

    const submitButton = form.querySelector('[type="submit"]');

    submitButton.disabled = true;

    if (status) status.textContent = "Sending...";


    try {

      const response = await fetch(endpoint, {

        method: "POST",

        body: new FormData(form),

        headers: {
          Accept: "application/json"
        }

      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();

      form.querySelectorAll(".is-invalid").forEach(field => {
        setInvalid(field, false);
      });

      if (status) status.textContent = "";

      const toastElement = document.getElementById("successToast");

      if (toastElement && window.bootstrap) {

        bootstrap.Toast
          .getOrCreateInstance(toastElement)
          .show();

      }

    }

    catch (error) {

      if (status) {
        status.textContent =
          "Message could not be sent. Please email me directly.";
      }

    }

    finally {

      submitButton.disabled = false;

    }

  });


  // CLEAR VALIDATION ERRORS WHILE TYPING

  form?.querySelectorAll("input, textarea").forEach(field => {

    field.addEventListener("input", () => {

      if (field.classList.contains("is-invalid")) {
        setInvalid(field, false);
      }

    });

  });


  // AUTOMATIC COPYRIGHT YEAR

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

});
