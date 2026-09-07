from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[2]
OUTPUT_PATH = ROOT / "output" / "pdf" / "zyene-reviews-five-prospect-emails.pdf"
OUTPUT = str(OUTPUT_PATH)

NAVY = colors.HexColor("#10233F")
BLUE = colors.HexColor("#2563EB")
TEAL = colors.HexColor("#0F766E")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#5D6B82")
PALE = colors.HexColor("#F3F7FC")
LINE = colors.HexColor("#DCE5F0")
WHITE = colors.white


def link(label: str, url: str) -> str:
    return f'<link href="{escape(url)}" color="#2563EB"><u>{escape(label)}</u></link>'


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverKicker", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=9, leading=12, textColor=TEAL, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=28, leading=32, textColor=NAVY, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="CoverSub", parent=styles["Normal"], fontName="Helvetica",
    fontSize=12, leading=18, textColor=MUTED, spaceAfter=16,
))
styles.add(ParagraphStyle(
    name="H1", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=18, leading=22, textColor=NAVY, spaceBefore=6, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="H2", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=11, leading=14, textColor=TEAL, spaceBefore=8, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="Body", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9.5, leading=14, textColor=INK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="Small", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=8, leading=11, textColor=MUTED, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="Email", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=10, leading=15, textColor=INK, leftIndent=12, rightIndent=12,
    spaceAfter=0,
))
styles.add(ParagraphStyle(
    name="Label", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=8, leading=10, textColor=MUTED, allCaps=True, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="Footer", parent=styles["Normal"], fontName="Helvetica",
    fontSize=7.5, leading=9, textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="RightSmall", parent=styles["Small"], alignment=TA_RIGHT,
))


prospects = [
    {
        "name": "The Austin Dentist",
        "location": "Austin, TX - Circle C and Westlake offices",
        "email": "circlec@theaustindentist.com; admin@theaustindentist.com",
        "fit": "Two office locations and a full-service practice create a natural need for one review inbox, location-aware response coverage, and a consistent post-visit request flow.",
        "use_case": "After an appointment, send an SMS or email review request; route 1-3 star experiences to private resolution; give the office manager one dashboard for Google, Yelp, and Facebook; use privacy-aware reply drafts without putting patient details into public responses.",
        "subject": "A review workflow for both Austin Dentist offices",
        "email_body": [
            "Hi The Austin Dentist team,",
            "I saw that you serve patients from both Circle C and Westlake and offer comprehensive care across sedation, cosmetic, preventive, and restorative dentistry. With two offices, review follow-up can easily become one more task for the front desk.",
            "Zyene Reviews gives your team one inbox for Google, Yelp, and Facebook, then automates a simple SMS or email request after a visit. If a patient has a 1-3 star experience, the Negative Feedback Shield routes it to a private resolution path first. Happy patients still get a clear path to leave a public review, and your team gets reply drafts that stay professional and privacy-aware.",
            "Would it be useful if I sent a 10-minute workflow showing how this could work across Circle C and Westlake? Reply \"Austin\" and I will send it over.",
            "Best,\nAshish\nZyene Reviews",
        ],
        "sources": [
            ("Official contact page", "https://theaustindentist.com/contact/"),
            ("Zyene feature basis", "docs/PLATFORM_FEATURES.md"),
        ],
    },
    {
        "name": "Let's Meat KBBQ",
        "location": "Charlotte, NC - South End",
        "email": "letsmeatkbbq@gmail.com",
        "fit": "A waitlist-based, late-hours restaurant has many high-volume moments where asking for a review manually is easy to miss. The public listing also shows a strong review footprint, making response speed and review velocity worth protecting.",
        "use_case": "Send a post-dining SMS a short time after checkout; ask happy guests to share the experience; privately capture complaints about waits, parking, food quality, or service; monitor nearby restaurant review movement and keep the public inbox current.",
        "subject": "Turn the post-dinner moment into more reviews",
        "email_body": [
            "Hi Let's Meat team,",
            "Your South End location has a distinctive experience - Korean BBQ, late hours, and a walk-in waitlist. That is exactly the kind of busy service environment where a satisfied guest may love the meal but never remember to leave a review once they get home.",
            "Zyene Reviews can send a polite SMS shortly after checkout, when the experience is still fresh. Guests who are happy get a direct review path; guests with a 1-3 star experience can reach your team privately before the complaint becomes the next public review. The same inbox helps managers respond quickly and track review themes, while competitor monitoring shows how nearby restaurants are moving.",
            "Could I send you a one-page dinner-to-review workflow for a single Charlotte location? Reply \"KBBQ\" and I will send the outline.",
            "Best,\nAshish\nZyene Reviews",
        ],
        "sources": [
            ("Official contact page", "https://www.letsmeatkbbqclt.com/contact"),
            ("Public review snapshot", "https://wanderlog.com/place/details/768026"),
            ("Zyene feature basis", "docs/PLATFORM_FEATURES.md"),
        ],
    },
    {
        "name": "Neighbor-Le Heating & Cooling",
        "location": "Denver metro, CO",
        "email": "info@neighborlehvac.com",
        "fit": "The family-owned company serves a broad Denver metro footprint. For a service business, proof of trust, fast response to unhappy homeowners, and suburb-level visibility all directly support booked jobs.",
        "use_case": "Trigger a review request when a job closes; use private feedback routing for pricing, delays, or scheduling issues; draft service- and neighborhood-specific replies; watch competitors across the service area to identify local review gaps.",
        "subject": "A simple review system for every completed HVAC job",
        "email_body": [
            "Hi Neighbor-Le team,",
            "I noticed that you are family-owned, bonded and insured, and serve a wide Denver metro area - from Denver and Aurora to Lakewood, Littleton, Parker, and Westminster. That kind of service footprint makes consistent proof of trust especially important before a homeowner calls.",
            "Zyene Reviews can request a review by SMS as soon as a job is complete, so technicians do not have to remember to ask and the customer does not have to search for your listing. If a customer is unhappy about price, timing, or a scheduling issue, the Negative Feedback Shield gives them a private route to your team first. You can also monitor nearby HVAC competitors and draft faster replies that reference the service and area without starting from scratch.",
            "Would a quick 10-minute walkthrough of a post-job workflow be useful? Reply \"HVAC\" and I will send one tailored to your Denver service area.",
            "Best,\nAshish\nZyene Reviews",
        ],
        "sources": [
            ("Official homepage", "https://www.neighborlehvac.com/"),
            ("Zyene feature basis", "docs/PLATFORM_FEATURES.md"),
        ],
    },
    {
        "name": "First Crush Salon",
        "location": "Portland, OR - SE Division",
        "email": "hello@firstcrushsalon.com",
        "fit": "A stylist-led salon with personalized color and cuts, variable stylist hours, and online booking benefits from appointment-triggered follow-up and replies that recognize the specific service experience.",
        "use_case": "Send an SMS or email after an appointment; alert the owner when a review is below 4 stars; draft replies that mention the stylist or service; add a review carousel to the booking page so new guests see current social proof.",
        "subject": "Make every great appointment work harder for First Crush",
        "email_body": [
            "Hi First Crush team,",
            "I liked how clearly your site positions First Crush: intentional color and cuts, a calm experience, and gender-neutral pricing in an inclusive space. That kind of positioning is exactly what clients tend to describe in reviews - if they are prompted while the appointment is still fresh.",
            "Zyene Reviews can send a thoughtful SMS or email after each appointment, then help your team respond with a draft that reflects the stylist and service instead of sounding copied and pasted. Reviews under 4 stars can be surfaced immediately for follow-up, while a review carousel can bring your strongest recent feedback onto the booking journey.",
            "Would you like a sample post-appointment message and booking-page review flow for First Crush? Reply \"Salon\" and I will send it.",
            "Best,\nAshish\nZyene Reviews",
        ],
        "sources": [
            ("Official homepage", "https://www.firstcrushsalon.com/"),
            ("Zyene feature basis", "docs/PLATFORM_FEATURES.md"),
        ],
    },
    {
        "name": "The Auto Shop",
        "location": "Phoenix, AZ - Downtown",
        "email": "mickey@phoenixautoshop.com",
        "fit": "A family-owned shop operating since 1979 offers multiple customer touchpoints - pickup, shuttle, car rental, rewards, and warranty service. Those moments create natural triggers for review requests and private recovery when expectations are missed.",
        "use_case": "Send the request when the vehicle is picked up; route warranty or repair-timing concerns privately; draft replies tied to the service performed; benchmark nearby shops and deliver a monthly owner-ready reputation report.",
        "subject": "Protect the trust The Auto Shop has built since 1979",
        "email_body": [
            "Hi Mickey,",
            "I saw that The Auto Shop has been family-owned in Phoenix since 1979 and has built a very specific trust story around ASE-certified technicians, NAPA, BBB accreditation, shuttle service, and a 3-year / 36K-mile warranty. That is valuable proof - and the vehicle-pickup moment is a natural time to ask customers to share it.",
            "Zyene Reviews can trigger an SMS request when a vehicle is ready, route warranty or repair-timing concerns to a private feedback path, and give your team fast reply drafts tied to the actual service. It also tracks nearby competitors and can package the month into a simple owner-ready report, so reputation work does not depend on someone remembering to check Google.",
            "Would it be helpful if I sent a sample pickup-to-review flow for The Auto Shop? Reply \"Phoenix\" and I will send it over.",
            "Best,\nAshish\nZyene Reviews",
        ],
        "sources": [
            ("Official homepage", "https://phoenixautoshop.com/"),
            ("Official contact page", "https://phoenixautoshop.com/contact-the-auto-shop/"),
            ("Zyene feature basis", "docs/PLATFORM_FEATURES.md"),
        ],
    },
]


def p(text: str, style: str = "Body") -> Paragraph:
    return Paragraph(text.replace("\n", "<br/>"), styles[style])


def footer(canvas, doc):
    canvas.saveState()
    width, _ = letter
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(0.65 * inch, 0.48 * inch, width - 0.65 * inch, 0.48 * inch)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.65 * inch, 0.3 * inch, "Zyene Reviews - prospecting draft pack")
    canvas.drawRightString(width - 0.65 * inch, 0.3 * inch, f"Page {doc.page}")
    canvas.restoreState()


OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

doc = BaseDocTemplate(
    OUTPUT,
    pagesize=letter,
    rightMargin=0.65 * inch,
    leftMargin=0.65 * inch,
    topMargin=0.62 * inch,
    bottomMargin=0.68 * inch,
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])

story = []
story.extend([
    Spacer(1, 0.35 * inch),
    p("SALES ENABLEMENT / RESEARCHED PROSPECTING", "CoverKicker"),
    p("Five ready-to-send\nprospecting emails", "CoverTitle"),
    p("Business-specific outreach for Zyene Reviews, built from public business pages and the product's shipped capabilities.", "CoverSub"),
    Spacer(1, 0.12 * inch),
    HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=18),
])

summary_rows = [[p("PROSPECT", "Label"), p("CATEGORY / FIT", "Label"), p("PUBLIC CONTACT", "Label")]]
for item in prospects:
    summary_rows.append([
        p(f"<b>{escape(item['name'])}</b><br/>{escape(item['location'])}", "Body"),
        p(escape(item["fit"]), "Small"),
        p(escape(item["email"]).replace("; ", ";<br/>"), "Small"),
    ])
table = Table(summary_rows, colWidths=[1.62 * inch, 3.55 * inch, 1.35 * inch], repeatRows=1)
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
    ("BACKGROUND", (0, 1), (-1, -1), PALE),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
]))
story.append(table)
story.extend([
    Spacer(1, 16),
    p("How to use this pack", "H2"),
    p("These are first-touch drafts, not claims about the prospects' internal operations. Verify the public email, add your signature and booking link, and personalize the first sentence before sending. The review counts and ratings of public listings change over time; only the Let's Meat review snapshot is mentioned in the research notes, and it is clearly identified as third-party data.", "Body"),
    p("Research snapshot: September 2, 2026. Product claims are limited to the shipped capability index in the Zyene Reviews repository.", "Small"),
    PageBreak(),
])

for index, item in enumerate(prospects, start=1):
    story.extend([
        p(f"{index:02d} / PROSPECT BRIEF", "CoverKicker"),
        p(escape(item["name"]), "H1"),
        p(escape(item["location"]), "Small"),
        HRFlowable(width="100%", thickness=1, color=LINE, spaceAfter=10),
        p("Public contact route", "Label"),
        p(escape(item["email"]), "Body"),
        p("Why this is a fit", "H2"),
        p(escape(item["fit"]), "Body"),
        p("Recommended Zyene angle", "H2"),
        p(escape(item["use_case"]), "Body"),
        p("Suggested subject", "H2"),
        p(f"<b>{escape(item['subject'])}</b>", "Body"),
        p("Email draft", "H2"),
    ])
    email_lines = "<br/><br/>".join(escape(line).replace("\n", "<br/>") for line in item["email_body"])
    email_table = Table([[Paragraph(email_lines, styles["Email"])]], colWidths=[doc.width])
    email_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFD")),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(KeepTogether(email_table))
    story.append(Spacer(1, 10))
    story.append(p("Public sources", "H2"))
    for label, url in item["sources"]:
        if url.startswith("http"):
            story.append(p(f"- {escape(label)}: {link(url, url)}", "Small"))
        else:
            story.append(p(f"- {escape(label)}: {escape(url)}", "Small"))
    if index != len(prospects):
        story.append(PageBreak())

doc.build(story)
print(OUTPUT)
