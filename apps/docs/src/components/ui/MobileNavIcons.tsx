import { Menu, X, Phone } from "lucide-react";

export function MenuIcon() {
  return <Menu size={24} strokeWidth={2} />;
}

export function CloseIcon() {
  return <X size={20} strokeWidth={2} />;
}

export function MobilePhoneIcon() {
  return <Phone size={16} strokeWidth={2} fill="white" stroke="white" />;
}
