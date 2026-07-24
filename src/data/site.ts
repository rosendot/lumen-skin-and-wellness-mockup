/** Shared site content — nav and footer appear on every page, so they live
 *  here rather than being repeated per-page. */

export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Treatments", href: "/treatments/" },
  { label: "Results", href: "/results/" },
  { label: "Memberships", href: "/memberships/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

/** Clinic details, repeated in the footer and on the contact page. */
export const clinic = {
  addressLine1: "7120 E Camelback Rd, Suite 210",
  addressLine2: "Scottsdale, AZ 85251",
  phone: "480-555-0193",
  phoneHref: "tel:+14805550193",
  email: "hello@lumenskin.com",
  hoursShort: "Tue–Sat 9am–6pm",
  hoursClosed: "Closed Sun & Mon",
};
