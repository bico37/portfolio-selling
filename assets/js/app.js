// GSAP Animations
if (window.gsap) {
  const { gsap } = window;
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const heroTl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });

    heroTl
      .from(".inline-flex.rounded-full", {
        y: -50,
        opacity: 0,
        duration: 1
      })
      .from("h1", {
        y: 100,
        opacity: 0,
        skewY: 7,
        duration: 1.5
      }, "-=0.8")
      .from("p.text-lg", {
        y: 30,
        opacity: 0,
        duration: 1
      }, "-=1.2")
      .from(".flex.flex-col.sm\\:flex-row", {
        y: 20,
        opacity: 0,
        duration: 1
      }, "-=1")
      .from(".relative.max-w-4xl", {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: "expo.out"
      }, "-=1");

    gsap.utils.toArray("section h2").forEach(header => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    });

    ScrollTrigger.batch("#vorteile .group", {
      start: "top 90%",
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.7)"
      }),
      onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: 50 })
    });

    gsap.set("#vorteile .group", { opacity: 0, y: 50 });

    const cards = gsap.utils.toArray("#portfolio .grid > div, #leistungen .grid > div");

    cards.forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%"
        },
        y: 80,
        opacity: 0,
        duration: 1,
        delay: (i % 2) * 0.1,
        ease: "power3.out"
      });
    });

    gsap.utils.toArray(".blur-3xl").forEach((blob, i) => {
      gsap.to(blob, {
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5
        },
        y: (i + 1) * 150,
        rotation: i % 2 === 0 ? 45 : -45,
        ease: "none"
      });
    });

    gsap.from(".marquee-container", {
      scrollTrigger: {
        trigger: ".marquee-container",
        start: "top 95%"
      },
      opacity: 0,
      scaleX: 0.8,
      duration: 1.5,
      ease: "expo.out"
    });
  }
}

// Contact form handling
const contactForm = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");

if (contactForm && submitBtn) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Wird gesendet...";
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);

    try {
      const response = await fetch("https://formspree.io/f/mykynenn", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        contactForm.reset();
        window.location.href = "success.html";
      } else {
        alert("Hoppla! Da gab es ein Problem. Bitte versuchen Sie es erneut.");
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
      }
    } catch (error) {
      alert("Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.");
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}
