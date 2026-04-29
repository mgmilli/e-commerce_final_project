document.addEventListener("DOMContentLoaded", () => {
    const mobileQuery = window.matchMedia("(max-width: 899.98px)");
    const navbar = document.querySelector(".navbar");
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");

    const closeMenu = () => {
        if (!navMenu || !navToggle) {
            return;
        }

        navMenu.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
    };

    if (navbar && navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("active");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navMenu.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                if (mobileQuery.matches) {
                    closeMenu();
                }
            });
        });

        window.addEventListener("resize", () => {
            if (!mobileQuery.matches) {
                closeMenu();
            }
        });
    }

    const revealTargets = document.querySelectorAll(
        ".hero-content, .hero-stats, .page-hero, .featured-events, .experience-grid, .page-section, .event-card, .booking-layout, .contact-layout, .detail-layout, .footer-content"
    );

    revealTargets.forEach((element) => element.classList.add("scroll-reveal"));

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14 }
        );

        revealTargets.forEach((element) => observer.observe(element));
    } else {
        revealTargets.forEach((element) => element.classList.add("is-visible"));
    }

    const filterButtons = document.querySelectorAll("[data-filter]");
    const eventCards = document.querySelectorAll(".event-card[data-category]");
    const filterStatus = document.getElementById("filterStatus");

    const updateFilterStatus = (filterValue, visibleCount) => {
        if (!filterStatus) {
            return;
        }

        if (filterValue === "all") {
            filterStatus.textContent = `Showing ${visibleCount} event${visibleCount === 1 ? "" : "s"}`;
            return;
        }

        const labels = {
            concert: "concert",
            theater: "theater",
            festival: "festival"
        };

        const noun = labels[filterValue] || "event";
        filterStatus.textContent = `Showing ${visibleCount} ${noun} event${visibleCount === 1 ? "" : "s"}`;
    };

    const setActiveFilter = (button) => {
        filterButtons.forEach((btn) => {
            const isActive = btn === button;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });
    };

    const filterEvents = (filterValue) => {
        let visibleCount = 0;

        eventCards.forEach((card) => {
            const matches = filterValue === "all" || card.dataset.category === filterValue;
            card.classList.toggle("is-hidden", !matches);
            if (matches) {
                visibleCount += 1;
            }
        });

        updateFilterStatus(filterValue, visibleCount);
    };

    if (filterButtons.length && eventCards.length) {
        filterButtons.forEach((button) => {
            button.setAttribute("aria-pressed", String(button.classList.contains("active")));
            button.addEventListener("click", () => {
                const filterValue = button.dataset.filter;
                setActiveFilter(button);
                filterEvents(filterValue);
            });
        });

        filterEvents(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
    }

    const ensureErrorNode = (field) => {
        let errorNode = field.parentElement.querySelector(".field-error");

        if (!errorNode) {
            errorNode = document.createElement("p");
            errorNode.className = "field-error";
            errorNode.setAttribute("aria-live", "polite");
            field.insertAdjacentElement("afterend", errorNode);
        }

        return errorNode;
    };

    const setFieldState = (field, errorMessage = "") => {
        const errorNode = ensureErrorNode(field);
        errorNode.textContent = errorMessage;
        field.classList.toggle("is-invalid", Boolean(errorMessage));
    };

    const setBannerMessage = (element, text, kind) => {
        if (!element) {
            return;
        }

        element.textContent = text;
        element.className = "form-message";

        if (kind) {
            element.classList.add(kind);
        }
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        const nameField = document.getElementById("name");
        const emailField = document.getElementById("email");
        const eventField = document.getElementById("event");
        const ticketsField = document.getElementById("tickets");
        const bookingMessage = document.getElementById("bookingMessage");
        const selectedEvent = document.getElementById("selectedEvent");
        const selectedVenue = document.getElementById("selectedVenue");
        const pricePerTicket = document.getElementById("pricePerTicket");
        const totalPrice = document.getElementById("totalPrice");

        const updateBookingSummary = () => {
            const option = eventField.selectedOptions[0];
            const ticketCount = Math.max(Number(ticketsField.value) || 0, 0);
            const price = Number(option?.dataset.price || 0);
            const venue = option?.dataset.venue || "Choose an event";
            const eventName = option?.value || "No event selected";

            if (selectedEvent) {
                selectedEvent.textContent = option?.value ? eventName : "Select an event to see pricing.";
            }

            if (selectedVenue) {
                selectedVenue.textContent = option?.value ? venue : "Venue will appear here";
            }

            if (pricePerTicket) {
                pricePerTicket.textContent = option?.value ? `$${price}` : "$0";
            }

            if (totalPrice) {
                totalPrice.textContent = `$${price * ticketCount}`;
            }
        };

        const validateName = () => {
            const value = nameField.value.trim();
            if (!value) {
                setFieldState(nameField, "Please enter your full name.");
                return false;
            }

            if (value.length < 2) {
                setFieldState(nameField, "Name should be at least 2 characters.");
                return false;
            }

            setFieldState(nameField);
            return true;
        };

        const validateEmail = () => {
            const value = emailField.value.trim();
            if (!value) {
                setFieldState(emailField, "Email is required.");
                return false;
            }

            if (!emailPattern.test(value)) {
                setFieldState(emailField, "Enter a valid email address.");
                return false;
            }

            setFieldState(emailField);
            return true;
        };

        const validateEvent = () => {
            if (!eventField.value) {
                setFieldState(eventField, "Choose an event to continue.");
                return false;
            }

            setFieldState(eventField);
            return true;
        };

        const validateTickets = () => {
            const ticketCount = Number(ticketsField.value);
            if (!ticketsField.value || Number.isNaN(ticketCount) || ticketCount < 1) {
                setFieldState(ticketsField, "Book at least 1 ticket.");
                return false;
            }

            if (ticketCount > 10) {
                setFieldState(ticketsField, "You can book up to 10 tickets.");
                return false;
            }

            setFieldState(ticketsField);
            return true;
        };

        const validateBookingForm = () => {
            const isNameValid = validateName();
            const isEmailValid = validateEmail();
            const isEventValid = validateEvent();
            const isTicketsValid = validateTickets();

            return isNameValid && isEmailValid && isEventValid && isTicketsValid;
        };

        [nameField, emailField, eventField, ticketsField].forEach((field) => {
            field.addEventListener("blur", () => {
                if (field === nameField) validateName();
                if (field === emailField) validateEmail();
                if (field === eventField) validateEvent();
                if (field === ticketsField) validateTickets();
            });

            field.addEventListener("input", () => {
                updateBookingSummary();
                if (bookingMessage) {
                    bookingMessage.textContent = "";
                    bookingMessage.className = "form-message";
                }

                if (field.classList.contains("is-invalid")) {
                    if (field === nameField) validateName();
                    if (field === emailField) validateEmail();
                    if (field === eventField) validateEvent();
                    if (field === ticketsField) validateTickets();
                }
            });
        });

        eventField.addEventListener("change", updateBookingSummary);
        ticketsField.addEventListener("input", updateBookingSummary);

        updateBookingSummary();

        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!validateBookingForm()) {
                setBannerMessage(bookingMessage, "Please fix the highlighted booking fields.", "is-error");
                return;
            }

            const option = eventField.selectedOptions[0];
            const count = Number(ticketsField.value);
            setBannerMessage(
                bookingMessage,
                `Booking confirmed for ${option.value} (${count} ticket${count === 1 ? "" : "s"}). A confirmation email will be sent shortly.`,
                "is-success"
            );

            bookingForm.reset();
            [nameField, emailField, eventField, ticketsField].forEach((field) => setFieldState(field));
            updateBookingSummary();
        });
    }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        const contactName = document.getElementById("contactName");
        const contactEmail = document.getElementById("contactEmail");
        const contactSubject = document.getElementById("contactSubject");
        const contactMessageField = document.getElementById("contactMessageField");
        const contactStatus = document.getElementById("contactStatus");

        const validateContactName = () => {
            const value = contactName.value.trim();
            if (!value) {
                setFieldState(contactName, "Please enter your name.");
                return false;
            }

            if (value.length < 2) {
                setFieldState(contactName, "Name should be at least 2 characters.");
                return false;
            }

            setFieldState(contactName);
            return true;
        };

        const validateContactEmail = () => {
            const value = contactEmail.value.trim();
            if (!value) {
                setFieldState(contactEmail, "Email is required.");
                return false;
            }

            if (!emailPattern.test(value)) {
                setFieldState(contactEmail, "Enter a valid email address.");
                return false;
            }

            setFieldState(contactEmail);
            return true;
        };

        const validateContactSubject = () => {
            if (!contactSubject.value) {
                setFieldState(contactSubject, "Select a subject.");
                return false;
            }

            setFieldState(contactSubject);
            return true;
        };

        const validateContactMessage = () => {
            const value = contactMessageField.value.trim();
            if (value.length < 10) {
                setFieldState(contactMessageField, "Message should be at least 10 characters.");
                return false;
            }

            setFieldState(contactMessageField);
            return true;
        };

        const validateContactForm = () => {
            const isNameValid = validateContactName();
            const isEmailValid = validateContactEmail();
            const isSubjectValid = validateContactSubject();
            const isMessageValid = validateContactMessage();

            return isNameValid && isEmailValid && isSubjectValid && isMessageValid;
        };

        [contactName, contactEmail, contactSubject, contactMessageField].forEach((field) => {
            field.addEventListener("blur", () => {
                if (field === contactName) validateContactName();
                if (field === contactEmail) validateContactEmail();
                if (field === contactSubject) validateContactSubject();
                if (field === contactMessageField) validateContactMessage();
            });

            field.addEventListener("input", () => {
                if (contactStatus) {
                    contactStatus.textContent = "";
                    contactStatus.className = "form-message";
                }

                if (field.classList.contains("is-invalid")) {
                    if (field === contactName) validateContactName();
                    if (field === contactEmail) validateContactEmail();
                    if (field === contactSubject) validateContactSubject();
                    if (field === contactMessageField) validateContactMessage();
                }
            });
        });

        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!validateContactForm()) {
                setBannerMessage(contactStatus, "Please review the contact form fields.", "is-error");
                return;
            }

            const subjectText = contactSubject.options[contactSubject.selectedIndex].text;
            setBannerMessage(
                contactStatus,
                `Thanks, ${contactName.value.trim()}. We received your ${subjectText.toLowerCase()} message and will reply within one business day.`,
                "is-success"
            );

            contactForm.reset();
            [contactName, contactEmail, contactSubject, contactMessageField].forEach((field) => setFieldState(field));
        });
    }
});
