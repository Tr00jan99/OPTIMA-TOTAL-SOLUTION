# OPTIMA TOTAL SOLUTION — Corporate Website

![Static Website](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-17191c?style=flat-square)
![Hosting](https://img.shields.io/badge/Hosting-Cloudflare%20Pages%20Ready-f38020?style=flat-square&logo=cloudflare&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-2ea44f?style=flat-square)

Official corporate website for **OPTIMA TOTAL SOLUTION**, an electrical, plumbing, and networking & CCTV services contractor based in Johor Bahru, Johor, Malaysia.

---

## Overview

Built as a fast, zero-dependency static website with responsive desktop and mobile layouts, accessible navigation and lightbox controls, filterable project/photo galleries, and a client-side WhatsApp enquiry workflow.

### Pages

| Page | File | Purpose |
| :--- | :--- | :--- |
| **Home** | `index.html` | Hero showcase, company highlights, services summary, featured projects, and contact CTA |
| **About Us** | `about.html` | Company introduction, founder profile, vision, mission, core values, and 5-step work process |
| **Our Services** | `services.html` | Detailed breakdown of Electrical, Plumbing, and Networking & CCTV services |
| **Projects** | `projects.html` | Filterable project portfolio (`All`, `Electrical`, `Plumbing`, `Street Light`, `Door Lock`) with lightbox |
| **Gallery** | `gallery.html` | Full masonry photo gallery (119 photographs) with category filters and keyboard-accessible lightbox |
| **Company Profile** | `company-profile.html` | Corporate overview, business activities, capabilities, and leadership profile |
| **Contact Us** | `contact.html` | Direct phone, WhatsApp, Gmail, Google Maps embed, and validated WhatsApp enquiry form |
| **Welcome Splash** | `mainpage.html` | Optional animated welcome entry page redirecting to `index.html` |
| **404 Page** | `404.html` | Branded fallback page for missing routes (automatically served by Cloudflare Pages) |

---

## Technology Stack

* **Markup & Styling:** Semantic HTML5, custom CSS3 (`index.css`), Google Fonts (`Inter`, `Manrope`, `Outfit`), Font Awesome 6
* **JavaScript:** Dependency-free Vanilla JS (`js/optima-core.js` for pure state/validation logic, `script.js` for DOM wiring)
* **Assets:** Optimised JPEG thumbnails (`images/optimised/`), full-resolution lightbox photos, SVG concrete texture (`images/concrete-texture.svg`)
* **Hosting Config:** Cloudflare Pages security & caching rules (`_headers`), `robots.txt`, `sitemap.xml`, `404.html`

---

## Project Structure

```text
.
├── index.html               # Homepage
├── about.html               # About Us
├── services.html            # Our Services
├── projects.html            # Filterable Projects
├── gallery.html             # Full Photo Gallery
├── company-profile.html     # Company Profile
├── contact.html             # Contact & WhatsApp Enquiry Form
├── mainpage.html            # Animated Welcome Page
├── 404.html                 # Custom 404 Error Page
├── index.css                # Main stylesheet
├── script.js                # UI interactions (nav, filters, lightbox, form, counters)
├── js/
│   └── optima-core.js       # Pure validation, WhatsApp URL builder, and state reducers
├── images/
│   ├── concrete-texture.svg # Background texture
│   └── optimised/           # Optimised 800px thumbnails & web assets
├── page 1/ .. page 9/       # Full-resolution project photographs (lightbox targets)
├── optima.png               # Company logo & favicon
├── _headers                 # Cloudflare Pages security & Cache-Control headers
├── robots.txt               # Search engine crawl rules
├── sitemap.xml              # XML sitemap (update domain before submitting)
├── .gitignore               # Excluded local/OS/secret files
└── README.md                # Project documentation
```

---

## Local Preview

No build step or package installation is required. Serve the repository root with any static HTTP server:

```bash
# Option 1: Node.js (npx)
npx serve .

# Option 2: Python 3
python -m http.server 8080
```

Then open `http://localhost:8080` (or the URL printed by `serve`) in your browser.

---

## Cloudflare Pages Deployment

This project is structured for direct deployment on **Cloudflare Pages**:

1. In the Cloudflare Dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
2. Select the `Tr00jan99/OPTIMA-TOTAL-SOLUTION` repository and branch `main`.
3. Configure the build settings:
   * **Framework preset:** `None`
   * **Build command:** *(leave blank)*
   * **Build output directory:** `/` (root)
   * **Environment variables:** None required
4. Deploy. Cloudflare Pages will automatically apply `_headers` and serve `404.html` for unknown routes.

### Post-Domain Checklist

Once your custom `https://` domain is connected:

* Replace `https://yourdomain.com` in `sitemap.xml` with your live domain.
* Uncomment and update the `Sitemap:` line in `robots.txt`.
* Update `<meta property="og:image" content="optima.png">` across HTML pages to the full `https://yourdomain.com/optima.png` URL for social media / WhatsApp link previews.

---

## Contact

**OPTIMA TOTAL SOLUTION**  
No 33, Jalan Utama 27, Johor Bahru, Johor  
Phone / WhatsApp: `011-1223 4304`  
Email: `Optimats01@gmail.com`
