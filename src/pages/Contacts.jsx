import { useState, useEffect, useRef } from "react";
import { Mail, Phone, MessageCircle, X, Send, Users, Activity } from "lucide-react";

function ContactCard({ contact, onOpen }) {
  const initials = `${contact.firstName?.charAt(0) || ""}${contact.lastName?.charAt(0) || ""}`.toUpperCase();
  
  return (
    <article
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? onOpen(contact) : null)}
      className="group relative flex flex-col h-full border border-sky-200 bg-gradient-to-br from-white to-sky-50/30 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
      aria-labelledby={`contact-${contact._id}-name`}
    >
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-sky-500 to-sky-600 font-bold text-white shadow-md shadow-sky-200">
            {initials || "?"}
          </div>

          {contact.service && (
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium ${getServiceBadgeStyle(contact.service)}`}>
              {contact.service}
            </span>
          )}
        </div>

        <div className="mt-3">
          <h3 id={`contact-${contact._id}-name`} className="text-base font-bold text-gray-900 truncate">
            {contact.firstName} {contact.lastName}
          </h3>
        </div>
      </div>

      <div className="relative mt-4 flex-1 space-y-2 border-t border-sky-100 pt-4 text-sm text-gray-600">
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2.5 px-2 py-2 text-xs font-medium text-gray-700 hover:bg-sky-50 transition-colors group"
            aria-label={`Email ${contact.firstName} ${contact.lastName}`}
          >
            <Mail className="h-4 w-4 text-sky-400 group-hover:text-sky-600 transition-colors" />
            <span className="truncate flex-1">{contact.email}</span>
          </a>
        )}

        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2.5 px-2 py-2 text-xs font-medium text-gray-700 hover:bg-sky-50 transition-colors group"
            aria-label={`Call ${contact.firstName} ${contact.lastName}`}
          >
            <Phone className="h-4 w-4 text-sky-400 group-hover:text-sky-600 transition-colors" />
            <span className="truncate flex-1">{contact.phone}</span>
          </a>
        )}

        {contact.message && (
          <button
            onClick={() => onOpen(contact)}
            className="w-full text-left bg-sky-50/70 px-3 py-3 border border-sky-100 hover:bg-sky-100 transition-colors group"
          >
            <div className="flex items-start gap-2.5">
              <MessageCircle className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">Message</p>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{contact.message}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-sky-600 group-hover:gap-2 transition-all">
                  Read More 
                  <Send className="h-3 w-3" />
                </span>
              </div>
            </div>
          </button>
        )}
      </div>
    </article>
  );
}

function getServiceBadgeStyle(service) {
  switch (service?.toLowerCase()) {
    case "consulting":
      return "bg-sky-50 text-sky-700 border border-sky-200";
    case "development":
      return "bg-sky-50 text-sky-700 border border-sky-200";
    case "design":
      return "bg-sky-50 text-sky-700 border border-sky-200";
    default:
      return "bg-sky-50 text-sky-700 border border-sky-200";
  }
}

function ContactModal({ contact, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const node = modalRef.current;
    if (node) {
      const button = node.querySelector("button, a, [tabindex]:not([tabindex='-1'])");
      button?.focus();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Contact details for ${contact.firstName} ${contact.lastName}`}
        className="relative w-full max-w-lg overflow-hidden border border-sky-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {contact.firstName} {contact.lastName}
            </h2>
            <p className="text-sm text-sky-600 mt-0.5 font-medium">{contact.service || "General Inquiry"}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-sky-50 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a 
              href={`mailto:${contact.email}`} 
              className="flex items-center gap-3 border border-sky-200 bg-sky-50/50 px-3 py-3 text-sm hover:bg-sky-100 transition-colors group"
            >
              <Mail className="h-5 w-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
              <span className="truncate text-sm font-medium text-gray-700">{contact.email}</span>
            </a>
            <a 
              href={`tel:${contact.phone}`} 
              className="flex items-center gap-3 border border-sky-200 bg-sky-50/50 px-3 py-3 text-sm hover:bg-sky-100 transition-colors group"
            >
              <Phone className="h-5 w-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
              <span className="truncate text-sm font-medium text-gray-700">{contact.phone}</span>
            </a>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Full Message
            </h4>
            <div className="border border-sky-200 bg-sky-50/50 p-4 text-sm text-gray-700 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {contact.message}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-sky-100 pt-4">
          <button 
            onClick={onClose} 
            className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-2.5 text-sm font-medium text-white hover:from-sky-700 hover:to-sky-800 transition-all shadow-md shadow-sky-200 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://kt-backend-1.onrender.com/api/contact"
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setContacts(result.data);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/30 via-white to-sky-100/20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Contact Messages
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all client inquiries
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 bg-white shadow-sm border border-sky-200 flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-500" />
                <span className="text-sm text-gray-600">Total: </span>
                <span className="font-semibold text-gray-900">{contacts.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200">
                <Activity className="h-4 w-4 text-emerald-600" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-700">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm border border-sky-200 overflow-hidden p-4 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((skeleton) => (
                <div key={skeleton} className="animate-pulse border border-sky-200 bg-white p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 bg-sky-200" />
                    <div className="h-6 w-20 bg-sky-200" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-sky-100" />
                    <div className="h-4 w-1/2 bg-sky-100" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-sky-100" />
                    <div className="h-4 w-full bg-sky-100" />
                    <div className="h-16 bg-sky-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="bg-sky-50 p-4 border border-sky-200">
                  <Mail className="h-8 w-8 text-sky-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Contact Records</h3>
              <p className="mt-1 text-sm text-gray-500">No client inquiries found in the system.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {contacts.map((contact) => (
                <ContactCard key={contact._id} contact={contact} onOpen={setSelectedContact} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedContact && (
        <ContactModal contact={selectedContact} onClose={() => setSelectedContact(null)} />
      )}
    </div>
  );
}