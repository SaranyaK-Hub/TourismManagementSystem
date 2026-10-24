const API_URL = "http://localhost:8080/api/destinations";

const destinationGrid = document.getElementById("destinationGrid");
const searchInput = document.getElementById("searchInput");
const statusMessage = document.getElementById("statusMessage");

// Load destinations from Spring Boot
async function loadDestinations() {
    try {
        statusMessage.textContent = "Loading destinations...";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load destinations");
        }

        const destinations = await response.json();

        displayDestinations(destinations);

    } catch (error) {
        console.error("Error:", error);

        statusMessage.textContent =
            "Unable to connect to the server. Please check whether Spring Boot is running.";

        destinationGrid.innerHTML = "";
    }
}

// Display destination cards
function displayDestinations(destinations) {
    destinationGrid.innerHTML = "";

    if (destinations.length === 0) {
        statusMessage.textContent = "No destinations found. Add destinations to explore!";
        return;
    }

    statusMessage.textContent =
        `Discover ${destinations.length} beautiful destination(s).`;

    destinations.forEach((destination) => {
        const card = document.createElement("article");
        card.className = "destination-card";

        const imageUrl = getDestinationImage(destination);

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "card-image";

        const image = document.createElement("img");
        image.src = imageUrl;
        image.alt = destination.name || "Tourism destination";
        image.loading = "lazy";

        image.onerror = function () {
            this.onerror = null;
            this.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80";
        };

        const priceTag = document.createElement("span");
        priceTag.className = "price-tag";
        priceTag.textContent = `₹${destination.price ?? 0}`;

        imageWrapper.append(image, priceTag);

        const content = document.createElement("div");
        content.className = "card-content";

        const title = document.createElement("h3");
        title.textContent = destination.name || "Beautiful Destination";

        const location = document.createElement("p");
        location.className = "card-location";
        location.textContent = `📍 ${destination.location || "India"}`;

        const description = document.createElement("p");
        description.className = "card-description";
        description.textContent =
            destination.description || "Discover this wonderful place.";

        const bookButton = document.createElement("button");
        bookButton.className = "card-btn";
        bookButton.textContent = "Explore Now";
        bookButton.type = "button";

        bookButton.addEventListener("click", () => {
            alert(
                `You selected ${destination.name}!\n\n` +
                `Location: ${destination.location || "Not specified"}\n` +
                `Price: ₹${destination.price ?? 0}\n\n` +
                "Booking functionality will be added next."
            );
        });

        content.append(title, location, description, bookButton);
        card.append(imageWrapper, content);
        destinationGrid.appendChild(card);
    });
}

// Choose a local image for each destination
function getDestinationImage(destination) {
    const name = (destination.name || "").toLowerCase();

    if (name.includes("ooty")) {
        return "images/ooty.jpg";
    }

    if (name.includes("kodaikanal")) {
        return "images/kodaikanal.jpg";
    }

    if (name.includes("goa")) {
        return "images/goa.jpg";
    }

    if (name.includes("munnar")) {
        return "images/kodaikanal.jpg";
    }

    // Default image when no destination matches
    return "images/ooty.jpg";
}

// Search destinations by name or location
searchInput.addEventListener("input", async function () {
    const keyword = this.value.trim().toLowerCase();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to search destinations");
        }

        const destinations = await response.json();

        const filteredDestinations = destinations.filter((destination) => {
            const name = (destination.name || "").toLowerCase();
            const location = (destination.location || "").toLowerCase();

            return name.includes(keyword) || location.includes(keyword);
        });

        displayDestinations(filteredDestinations);

    } catch (error) {
        statusMessage.textContent = "Unable to search. Check the server connection.";
    }
});

// Start the application
loadDestinations();
// BOOKING FORM FUNCTIONALITY

const bookingForm = document.getElementById("bookingForm");
const destinationSelect = document.getElementById("selectedDestination");
const bookingMessage = document.getElementById("bookingMessage");
const travelDateInput = document.getElementById("travelDate");

// Prevent selecting a past travel date
const today = new Date();
const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

travelDateInput.min = localToday;


// Load destinations into the booking dropdown
async function loadBookingDestinations() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load destinations");
        }

        const destinations = await response.json();

        destinationSelect.innerHTML =
            '<option value="">Choose a destination</option>';

        destinations.forEach((destination) => {
            const option = document.createElement("option");

            option.value = destination.id;
            option.textContent =
                `${destination.name} - ₹${destination.price ?? 0}`;

            destinationSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Booking destinations error:", error);

        bookingMessage.textContent =
            "Unable to load destinations. Please refresh the page.";
    }
}
// Handle booking form submission
bookingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const customerName =
        document.getElementById("customerName").value.trim();

    const customerEmail =
        document.getElementById("customerEmail").value.trim();

    const destinationId = destinationSelect.value;
    const travelDate = travelDateInput.value;

    if (!customerName || !customerEmail || !destinationId || !travelDate) {
        bookingMessage.textContent = "Please fill in all the fields.";
        return;
    }

    if (travelDate < localToday) {
        bookingMessage.textContent =
            "Please choose a future travel date.";
        return;
    }

    // Get the selected destination name from the dropdown
    const selectedOption =
        destinationSelect.options[destinationSelect.selectedIndex];

    const selectedDestinationName =
        selectedOption.text.split(" - ₹")[0];

    // Prepare booking details
    const bookingData = {
        customerName: customerName,
        customerEmail: customerEmail,
        destination: selectedDestinationName,
        travelDate: travelDate
    };

    bookingMessage.textContent = "Submitting your booking...";

    try {
        const response = await fetch("http://localhost:8080/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error("Booking failed");
        }

        const savedBooking = await response.json();

        bookingMessage.textContent =
            `Booking successful! Your booking ID is ${savedBooking.id}.`;

        bookingForm.reset();

    } catch (error) {
        console.error("Booking error:", error);

        bookingMessage.textContent =
            "Unable to submit booking. Please check the server connection.";
    }
});

// Initialize the booking dropdown
loadBookingDestinations();

// MY BOOKINGS FUNCTIONALITY

const viewBookingsBtn = document.getElementById("viewBookingsBtn");
const bookingsList = document.getElementById("bookingsList");

viewBookingsBtn.addEventListener("click", async function () {
    bookingsList.innerHTML = "<p>Loading your bookings...</p>";

    try {
        const response = await fetch("http://localhost:8080/api/bookings");

        if (!response.ok) {
            throw new Error("Unable to load bookings");
        }

        const bookings = await response.json();

        if (bookings.length === 0) {
            bookingsList.innerHTML = "<p>No bookings found.</p>";
            return;
        }

        bookingsList.innerHTML = "";

        bookings.forEach((booking) => {
            const card = document.createElement("div");
            card.className = "booking-card";

            const title = document.createElement("h3");
            title.textContent = `Booking #${booking.id}`;

            const name = document.createElement("p");
            name.textContent = `Name: ${booking.customerName}`;

            const email = document.createElement("p");
            email.textContent = `Email: ${booking.customerEmail}`;

            const destination = document.createElement("p");
            destination.textContent = `Destination: ${booking.destination}`;

            const date = document.createElement("p");
            date.textContent = `Travel Date: ${booking.travelDate}`;

            card.append(title, name, email, destination, date);
            bookingsList.appendChild(card);
        });

    } catch (error) {
        console.error("Bookings error:", error);
        bookingsList.innerHTML =
            "<p>Unable to load bookings. Please check the server.</p>";
    }
});