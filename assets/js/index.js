// ^Today in Space

const apodImage = document.querySelector("#apod-image");
const apodLoading = document.querySelector("#apod-loading");
const apodTitle = document.querySelector("#apod-title");
const apodDate = document.querySelector("#apod-date");
const apodDateDetail = document.querySelector("#apod-date-detail");
const apodDateInfo = document.querySelector("#apod-date-info");
const apodExplanation = document.querySelector("#apod-explanation");
const apodCopyright = document.querySelector("#apod-copyright");
const apodMediaType = document.querySelector("#apod-media-type");
const apodDateInput = document.querySelector("#apod-date-input");
const loadDateBtn = document.querySelector("#load-date-btn");
const todayApodBtn = document.querySelector("#today-apod-btn");

const todayStr = new Date().toISOString().split("T")[0];
apodDateInput.max = todayStr;
const API_KEY = "yDd49m4XauyNwdEOvYGOYC7vDHhcQ0n8dIfa8ult";
const BASE_URL = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

function formatReadableDate(dateString) {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function updateCalendarInputLabel(dateString) {
  const dateSpan = apodDateInput.nextElementSibling;
  if (dateSpan?.tagName === "SPAN") {
    dateSpan.textContent = formatReadableDate(dateString);
  }
}

async function fetchAPOD(date = "") {
  apodLoading.classList.remove("hidden");
  apodImage.classList.add("hidden");

  let url = `${BASE_URL}`;
  if (date) {
    url += `&date=${date}`;
  }
  console.log(url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("فشل في جلب البيانات من الـ API");

    const data = await response.json();
    // ^ using Destructuring
    const { date } = data;
    console.log(data);

    apodDateInput.value = date;
    updateCalendarInputLabel(date);

    displayAPOD(data);
  } catch (error) {
    console.error("حدث خطأ:", error);
  } finally {
    apodLoading.classList.add("hidden");
  }
}

function displayAPOD(data) {
  // ^ using Destructuring
  const { title, explanation, date, media_type, url, hdurl, copyright } = data;
  apodTitle.textContent = title;
  apodExplanation.textContent = explanation;
  apodDate.textContent = `Astronomy Picture of the Day - ${date}`;
  apodDateDetail.innerHTML = `<i class="far fa-calendar mr-2"></i>${date}`;
  apodDateInfo.textContent = date;
  apodMediaType.textContent = media_type;

  if (data.copyright) {
    apodCopyright.textContent = `© ${data.copyright}`;
    apodCopyright.classList.remove("hidden");
  } else {
    apodCopyright.classList.add("hidden");
  }

  if (data.media_type === "image") {
    apodImage.src = data.url;
    apodImage.classList.remove("hidden");

    const fullResBtn = apodImage.nextElementSibling?.querySelector("button");
    if (fullResBtn) {
      fullResBtn.onclick = () => window.open(data.hdurl || data.url, "_blank");
    }
  } else if (data.media_type === "video") {
    apodImage.src = "./assets/images/placeholder.webp";
    apodImage.classList.remove("hidden");

    // ^ او ممكن ادي للزار id  q.querySelector("#button")
    const fullResBtn = apodImage.nextElementSibling?.querySelector("button");
    if (fullResBtn) {
      fullResBtn.onclick = () => window.open(data.url, "_blank");
    }
  }
}

apodDateInput.addEventListener("change", () => {
  const selectedDate = apodDateInput.value;
  if (selectedDate) {
    updateCalendarInputLabel(selectedDate);
    fetchAPOD(selectedDate);
  }
});

loadDateBtn.addEventListener("click", () => {
  const selectedDate = apodDateInput.value;
  if (selectedDate) {
    fetchAPOD(selectedDate);
  }
});

todayApodBtn.addEventListener("click", () => {
  apodDateInput.value = todayStr;
  updateCalendarInputLabel(todayStr);
  fetchAPOD(todayStr);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchAPOD();
});

// ^ Launches

const LAUNCHES_API_URL =
  "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10";

const featuredLaunchContainer = document.getElementById("featured-launch");
const launchesGrid = document.getElementById("launches-grid");
const navLinks = document.querySelectorAll(".nav-link");
const appSections = document.querySelectorAll(".app-section");

function switchSection(targetSectionId) {
  navLinks.forEach((link) => {
    if (link.getAttribute("data-section") === targetSectionId) {
      link.classList.add("bg-blue-500/10", "text-blue-400");
      link.classList.remove("text-slate-300");
    } else {
      link.classList.remove("bg-blue-500/10", "text-blue-400");
      link.classList.add("text-slate-300");
    }
  });

  appSections.forEach((section) => {
    if (section.id === targetSectionId) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });

  if (targetSectionId === "launches") {
    triggerLaunchesLoad();
  }
}

// ^تفعيل حدث الضغط على روابط القائمة الجانبية
document.addEventListener("click", function (event) {
  const clickedLink = event.target.closest(".nav-link");
  if (clickedLink) {
    event.preventDefault();
    const sectionId = clickedLink.getAttribute("data-section");
    if (sectionId) {
      switchSection(sectionId);
    }
  }
});

//^ جلب الاطلاقات من API
async function fetchUpcomingLaunches() {
  try {
    // ^ default 'GET' method
    const response = await fetch(LAUNCHES_API_URL);

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();

    const { results = [] } = data;
    console.log(results);

    if (results.length > 0) {
      displayFeaturedLaunch(results[0]);
      displayLaunchesGrid(results.slice(1));
    } else {
      if (launchesGrid) {
        launchesGrid.innerHTML = `<div class="text-center col-span-full py-10 text-slate-400">لا توجد إطلاقات قادمة حالياً.</div>`;
      }
    }
  } catch (error) {
    console.error("حدث خطأ أثناء جلب الإطلاقات:", error);
    if (launchesGrid) {
      launchesGrid.innerHTML = `<div class="text-center col-span-full py-10 text-red-400">فشل في تحميل البيانات بسبب قيود الاتصال أو السيرفر.</div>`;
    }
  }
}

// ^  لحساب الأيام المتبقية
function calculateDaysUntil(dateString) {
  const launchDate = new Date(dateString);
  const now = new Date();
  const timeDiff = launchDate - now;
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

//^ عرض الاطلاق المميز
function displayFeaturedLaunch(launch) {
  if (!featuredLaunchContainer) return;

  const {
    net,
    name = "Unknown Mission",
    image = "",
    url: detailsUrl = "#",
    status = {},
    launch_service_provider = {},
    rocket = {},
    pad = {},
    mission = {},
  } = launch;

  //^   (Nested Destructuring)
  const { abbrev = "TBD", id: statusId } = status;
  const { name: providerName = "Unknown" } = launch_service_provider;
  const { configuration = {} } = rocket;
  const { name: rocketName = "Rocket" } = configuration;
  const { name: padName = "Unknown Pad", location = {} } = pad;
  const { country_code = "Global" } = location;
  const { description = "No description provided for this upcoming mission." } =
    mission;

  const daysUntil = calculateDaysUntil(net);
  const dateFormatted = new Date(net).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatted =
    new Date(net).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " UTC";

  const imageHTML =
    image && typeof image === "string" // ^ ternary operator
      ? `<img src="${image}" class="w-full h-full object-cover" alt="${name}" />`
      : `<div class="flex items-center justify-center h-full min-h-[400px] bg-slate-800"><i class="fas fa-rocket text-9xl text-slate-700/50"></i></div>`;

  featuredLaunchContainer.innerHTML = `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-star"></i> Featured Launch
              </span>
              <span class="px-4 py-1.5 ${statusId === 1 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"} rounded-full text-sm font-semibold">
                ${abbrev}
              </span>
            </div>
            <h3 class="text-3xl font-bold mb-3 leading-tight">${name}</h3>
            <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
              <div class="flex items-center gap-2">
                <i class="fas fa-building"></i>
                <span>${providerName}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-rocket"></i>
                <span>${rocketName}</span>
              </div>
            </div>
            <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
              <i class="fas fa-clock text-2xl text-blue-400"></i>
              <div>
                <p class="text-2xl font-bold text-blue-400">${daysUntil}</p>
                <p class="text-xs text-slate-400">Days Until Launch</p>
              </div>
            </div>
            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-calendar"></i> Launch Date</p>
                <p class="font-semibold">${dateFormatted}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-clock"></i> Launch Time</p>
                <p class="font-semibold">${timeFormatted}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-map-marker-alt"></i> Location</p>
                <p class="font-semibold text-sm">${padName}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-globe"></i> Country</p>
                <p class="font-semibold">${country_code}</p>
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed mb-6">
              ${description}
            </p>
          </div>
          <div class="flex flex-col md:flex-row gap-3">
            <button onclick="window.open('${detailsUrl}', '_blank')" class="flex-1 px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
              <i class="fas fa-info-circle"></i> View Full Details
            </button>
          </div>
        </div>
        <div class="relative">
          <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
            ${imageHTML}
            <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

//^ عرض باقي الاطلاقات
function displayLaunchesGrid(launchesList) {
  if (!launchesGrid) return;
  launchesGrid.innerHTML = "";

  launchesList.forEach((launch) => {
    const {
      net,
      name = "Unknown Mission",
      image = "",
      url: cardDetailsUrl = "#",
      status = {},
      launch_service_provider = {},
      rocket = {},
      pad = {},
    } = launch;

    const { abbrev = "TBD" } = status;
    const { name: providerName = "Unknown Provider" } = launch_service_provider;
    const { name: rocketName = "Rocket" } = rocket.configuration || {};
    const { location = {} } = pad;
    const { name: locationName = "Global Pad" } = location;

    const dateFormatted = new Date(net).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeFormatted =
      new Date(net).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " UTC";

    const cardImageHTML =
      image && typeof image === "string"
        ? `<img src="${image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${name}" />`
        : `<div class="w-full h-full flex items-center justify-center bg-slate-800"><i class="fas fa-space-shuttle text-5xl text-slate-700"></i></div>`;

    const card = document.createElement("div");
    card.className =
      "bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer";

    card.innerHTML = `
      <div class="relative h-48 bg-slate-900/50 flex items-center justify-center overflow-hidden">
        ${cardImageHTML}
        <div class="absolute top-3 right-3">
          <span class="px-3 py-1 bg-blue-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
            ${abbrev}
          </span>
        </div>
      </div>
      <div class="p-5">
        <div class="mb-3">
          <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            ${name}
          </h4>
          <p class="text-sm text-slate-400 flex items-center gap-2">
            <i class="fas fa-building text-xs"></i>
            ${providerName}
          </p>
        </div>
        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-calendar text-slate-500 w-4"></i>
            <span class="text-slate-300">${dateFormatted}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-clock text-slate-500 w-4"></i>
            <span class="text-slate-300">${timeFormatted}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-rocket text-slate-500 w-4"></i>
            <span class="text-slate-300">${rocketName}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
            <span class="text-slate-300 line-clamp-1">${locationName}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
          <button onclick="window.open('${cardDetailsUrl}', '_blank')" class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">
            Details
          </button>
        </div>
      </div>
    `;
    // ^   اضافة ال كارد الي انا كريتة الي html
    launchesGrid.appendChild(card);
  });
}

//^ منع التحميل اكثر من مره

let isLaunchesFetched = false;

function triggerLaunchesLoad() {
  if (isLaunchesFetched) return; //^ اذ لم تكن هذه اول مره اخرج من الدالة

  if (featuredLaunchContainer && launchesGrid) {
    featuredLaunchContainer.innerHTML = `
      <div class="flex items-center justify-center py-20 w-full col-span-full">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    `;
    launchesGrid.innerHTML = `
      <div class="text-center col-span-full py-12">
        <i class="fas fa-spinner fa-spin text-2xl text-blue-500 mb-2"></i>
        <p class="text-slate-400 text-sm">Loading upcoming launches...</p>
      </div>
    `;

    fetchUpcomingLaunches().then(() => {
      isLaunchesFetched = true;
    });
  }
}

// ^ planets

const PLANETS_API_URL =
  "https://solar-system-opendata-proxy.vercel.app/api/planets";

//^ العناصر المستهدفة من الـ HTML
const planetCards = document.querySelectorAll(".planet-card");
const planetDetailImage = document.getElementById("planet-detail-image");
const planetDetailName = document.getElementById("planet-detail-name");
const planetDetailDescription = document.getElementById(
  "planet-detail-description",
);

//^ عناصر المواصفات (Specifications)
const planetDistance = document.getElementById("planet-distance");
const planetRadius = document.getElementById("planet-radius");
const planetMass = document.getElementById("planet-mass");
const planetDensity = document.getElementById("planet-density");
const planetOrbitalPeriod = document.getElementById("planet-orbital-period");
const planetRotation = document.getElementById("planet-rotation");
const planetMoons = document.getElementById("planet-moons");
const planetGravity = document.getElementById("planet-gravity");

//^ عناصر المعلومات الإضافية (Discovery & Characteristics)
const planetDiscoverer = document.getElementById("planet-discoverer");
const planetDiscoveryDate = document.getElementById("planet-discovery-date");
const planetBodyType = document.getElementById("planet-body-type");
const planetVolume = document.getElementById("planet-volume");
const planetPerihelion = document.getElementById("planet-perihelion");
const planetAphelion = document.getElementById("planet-aphelion");
const planetEccentricity = document.getElementById("planet-eccentricity");
const planetInclination = document.getElementById("planet-inclination");
const planetAxialTilt = document.getElementById("planet-axial-tilt");
const planetTemp = document.getElementById("planet-temp");
const planetEscape = document.getElementById("planet-escape");
const planetFactsList = document.getElementById("planet-facts");

// مصفوفة لتخزين الكواكب المسترجعة محلياً لسهولة التنقل بينها
let planetsData = [];

// 1. دالة جلب البيانات من الـ API
async function fetchPlanetsData() {
  try {
    const response = await fetch(PLANETS_API_URL);
    const data = await response.json();

    // تصفية البيانات للتأكد من جلب الكواكب الـ 8 الأساسية فقط وترتيبها حسب البعد عن الشمس
    const celestialBodies = data.bodies || data;
    const planetNamesEn = [
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ];
    // ^ بيغمل فلتره لكواكب لاختيار ال8 الكواكب الي انا عايزهم
    planetsData = celestialBodies.filter(
      (body) =>
        body.isPlanet && planetNamesEn.includes(body.englishName.toLowerCase()),
    );

    // ^ترتيب الكواكب تصاعدياً بناءً على المحور شبه الأكبر (البعد عن الشمس)
    planetsData.sort((a, b) => a.semimajorAxis - b.semimajorAxis);

    // ^عرض كوكب الأرض أول ما الصفحة تفتح
    const earthData = planetsData.find(
      (p) => p.englishName.toLowerCase() === "earth",
    );
    if (earthData) {
      updatePlanetDetails(earthData);
    }
  } catch (error) {
    console.error("حدث خطأ أثناء جلب بيانات الكواكب:", error);
  }
}

//^ 2. ربط بطاقات الكواكب (Cards) بالبيانات عند الضغط
function initPlanetCards() {
  planetCards.forEach((card) => {
    card.addEventListener("click", () => {
      const planetId = card.getAttribute("data-planet-id").toLowerCase();
      const selectedPlanet = planetsData.find(
        (p) => p.englishName.toLowerCase() === planetId,
      );

      if (selectedPlanet) {
        updatePlanetDetails(selectedPlanet);

        // ^سكرول خفيف للجزء الخاص بالتفاصيل ليراها المستخدم على الشاشات الصغيرة
        document
          .getElementById("planet-detail-name")
          .scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });
}

function updatePlanetDetails(planet) {
  const {
    englishName: name,
    semimajorAxis,
    meanRadius,
    density,
    sideralOrbit,
    sideralRotation,
    moons = [],
    gravity,
    discoveredBy = "Ancient / Antiquity",
    discoveryDate = "Ancient",
    perihelion,
    aphelion,
    eccentricity,
    inclination,
    axialTilt = 0,
    avgTemp,
    escape,
    mass = null,
    vol = null,
  } = planet;

  planetDetailImage.src = `./assets/images/${name.toLowerCase()}.png`;
  planetDetailImage.alt = `${name} detailed render`;
  planetDetailName.textContent = name;

  // ^حسابات القيم العلمية وتحويلها لنصوص مفهومة
  planetDistance.textContent = `${(semimajorAxis / 149597870.7).toFixed(2)} AU`; // تحويل إلى وحدة فلكية
  planetRadius.textContent = `${meanRadius.toLocaleString()} km`;

  // ^تفكيك كائن الكتلة وعرضه بصيغة الأسس الرياضية HTML
  if (mass) {
    const { massValue, massExponent } = mass;
    planetMass.innerHTML = `${massValue} × 10<sup>${massExponent}</sup> kg`;
  } else {
    planetMass.textContent = "N/A";
  }

  //^تفكيك كائن الحجم وعرضه بصيغة الأسس الرياضية HTML
  if (vol) {
    const { volValue, volExponent } = vol;
    planetVolume.innerHTML = `${volValue} × 10<sup>${volExponent}</sup> km³`;
  } else {
    planetVolume.textContent = "N/A";
  }

  planetDensity.textContent = `${density.toFixed(2)} g/cm³`;
  planetOrbitalPeriod.textContent = `${sideralOrbit.toFixed(1)} days`;

  // ^ تحويل فترة الدوران حول النفس لساعات أو أيام
  const rotationHours = Math.abs(sideralRotation);
  planetRotation.textContent =
    rotationHours > 24
      ? `${(rotationHours / 24).toFixed(1)} days`
      : `${rotationHours.toFixed(1)} hours`;

  // ^ عدد الأقمار والجاذبية
  planetMoons.textContent = moons ? moons.length : 0;
  planetGravity.textContent = `${gravity.toFixed(2)} m/s²`;

  //^ معلومات الاكتشاف
  planetDiscoverer.textContent = discoveredBy;
  planetDiscoveryDate.textContent = discoveryDate;
  planetBodyType.textContent = "Planet";

  // ^الخصائص المدارية الإضافية
  planetPerihelion.textContent = `${perihelion.toLocaleString()} km`;
  planetAphelion.textContent = `${aphelion.toLocaleString()} km`;
  planetEccentricity.textContent = eccentricity;
  planetInclination.textContent = `${inclination}°`;
  planetAxialTilt.textContent = `${axialTilt}°`;

  // ^درجة الحرارة (التحويل من كلفن إلى سيليزيوس)
  const tempInCelsius = avgTemp - 273.15;
  planetTemp.textContent = `${tempInCelsius.toFixed(0)}°C`;

  planetEscape.textContent = `${(escape / 1000).toFixed(1)} km/s`;

  // ^تحديث نبذة سريعة ديناميكية
  generateDynamicFacts(planet);
}

function generateDynamicFacts(planet) {
  const {
    englishName,
    semimajorAxis,
    gravity,
    avgTemp,
    moons = [],
    eccentricity,
    escape,
  } = planet;

  const moonsCount = moons ? moons.length : 0;
  const tempInCelsius = (avgTemp - 273.15).toFixed(0);

  // ^ تحديث فقرة الوصف باستخدام المتغيرات المفككة
  planetDetailDescription.textContent = `${englishName} is a magnificent planet in our solar system. It orbits the Sun at an average distance of ${semimajorAxis.toLocaleString()} km. It has a gravity of ${gravity} m/s² and experiences an average temperature of around ${tempInCelsius}°C.`;

  // ^ صياغة الحقائق السريعة
  let factsHTML = `
        <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
            <span class="text-slate-300">It has ${moonsCount} confirmed moon(s) orbiting it.</span>
        </li>
        <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
            <span class="text-slate-300">An orbital eccentricity of ${eccentricity}.</span>
        </li>
        <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
            <span class="text-slate-300">Escape velocity required to leave its atmosphere is ${(escape / 1000).toFixed(1)} km/s.</span>
        </li>
    `;

  planetFactsList.innerHTML = factsHTML;
}

document.addEventListener("DOMContentLoaded", fetchPlanetsData);
