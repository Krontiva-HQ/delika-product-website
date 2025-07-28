"use client";

import React, { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";

const toc = [
  { id: "about", label: "1. About this Privacy Notice" },
  { id: "who", label: "2. Who Does This Notice Apply To?" },
  { id: "definitions", label: "3. Key Definitions to Help You Understand This Privacy Notice" },
  {
    id: "dataprocess",
    label: "4. What personal data do we process?",
    children: [
      { id: "collect", label: "4.1. Where does Krontiva Africa collect my Personal Data from?" },
      { id: "provided", label: "4.2. Personal data provided by you to Krontiva Africa" },
      { id: "collected", label: "4.3. Personal data we collect about you when you use the Delika App and Web Platform" },
      { id: "purposes", label: "4.4. What purposes do we use your personal data for and what is our legal basis for processing?" },
      { id: "provision", label: "4.5. For the provision of the Delika services" },
      { id: "support", label: "4.6. For Customer Support" },
      { id: "security", label: "4.7. For safety and security" },
      { id: "marketing", label: "4.8. For marketing and advertising" },
      { id: "servicecomms", label: "4.9. For Service Communications" },
      { id: "research", label: "4.10. For research and improvement of the Delika Platform" },
      { id: "legal", label: "4.11. For legal proceedings and compliance with the law" },
    ],
  },
  { id: "sharing", label: "5. Who do we share your personal data with?" },
  { id: "safety", label: "6. How do we keep your personal data safe?" },
  { id: "breaches", label: "7. How does Krontiva Africa handle Personal Data Breaches?" },
  {
    id: "retention",
    label: "8. How long do we retain your personal data for?",
    children: [
      { id: "retentionperiods", label: "8.1. Specific retention periods" },
    ],
  },
  { id: "rights", label: "9. What are your rights?" },
  { id: "directmarketing", label: "10. How do we use your personal data for direct marketing?" },
  { id: "changes", label: "11. How do we notify you of changes to this Notice?" },
  { id: "contact", label: "12. How do you contact us?" },
];

type CollapsibleSectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

// ChevronDownIcon SVG
function ChevronDownIcon({ className = "" }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CollapsibleSection({ id, title, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false);
  // Expand if hash matches
  useEffect(() => {
    if (window.location.hash === `#${id}`) setOpen(true);
  }, [id]);
  return (
    <section id={id} className="mb-4">
      <button
        className="w-full flex justify-between items-center py-3 px-4 text-left font-semibold text-base rounded-lg bg-white hover:bg-orange-50 focus:bg-orange-100 transition-colors shadow-sm focus:outline-none group"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id + '-content'}
        style={{ border: 'none' }}
      >
        <span>{title}</span>
        <ChevronDownIcon className={`ml-2 h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'} group-hover:text-orange-500`} />
      </button>
      <div
        id={id + '-content'}
        className={`transition-all duration-300 overflow-hidden bg-white rounded-b-lg shadow-inner ${open ? 'max-h-[4000px] opacity-100 py-2 px-4' : 'max-h-0 opacity-0 py-0 px-4'}`}
      >
        <div>{children}</div>
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Scroll and expand on TOC click
  const handleTocClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Expand the section
      const btn = el.querySelector("button");
      if (btn && btn.getAttribute("aria-expanded") === "false") (btn as HTMLButtonElement).click();
    }
  };

  // Track active section for TOC highlight
  useEffect(() => {
    const handleScroll = () => {
      const offsets = toc.map(item => {
        const el = document.getElementById(item.id);
        if (!el) return { id: item.id, top: Infinity };
        const rect = el.getBoundingClientRect();
        return { id: item.id, top: rect.top };
      });
      const active = offsets.filter(o => o.top <= 120).sort((a, b) => b.top - a.top)[0];
      setActiveId(active ? active.id : toc[0].id);
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Back to Top handler
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 py-12 relative">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Sidebar TOC */}
        <aside className="md:w-1/4 w-full md:sticky md:top-24 mb-8 md:mb-0">
          <nav className="bg-white rounded-xl shadow p-6 md:p-4">
            <h2 className="text-lg font-bold mb-4 text-orange-600">Table of Contents</h2>
            <ul className="space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block px-3 py-2 rounded transition-colors cursor-pointer ${
                      activeId === item.id
                        ? "bg-orange-50 border-l-4 border-orange-500 text-orange-600 font-semibold"
                        : "hover:bg-orange-50"
                    }`}
                    aria-current={activeId === item.id ? "page" : undefined}
                    onClick={e => {
                      e.preventDefault();
                      handleTocClick(item.id);
                    }}
                  >
                    {item.label}
                  </a>
                  {item.children && (
                    <ul className="ml-4 mt-1 space-y-1 border-l border-orange-100 pl-2">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <a
                            href={`#${child.id}`}
                            className={`block px-3 py-1 rounded transition-colors cursor-pointer text-xs ${
                              activeId === child.id
                                ? "bg-orange-50 border-l-4 border-orange-500 text-orange-600 font-semibold"
                                : "hover:bg-orange-50"
                            }`}
                            aria-current={activeId === child.id ? "page" : undefined}
                            onClick={e => {
                              e.preventDefault();
                              handleTocClick(child.id);
                            }}
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        {/* Main Content */}
        <main ref={mainRef} className="flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-12 overflow-y-auto">
          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-500 text-lg">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </header>
          <div className="prose prose-lg max-w-none">
            {toc.map((item) => (
              <CollapsibleSection id={item.id} title={item.label} key={item.id}>
                {item.id === "about" ? (
                  <>
                    <p className="text-gray-600 mb-4">
                      This Privacy Notice ("Notice") describes how Krontiva Africa Ltd ("Krontiva", "we", or "us") collects, processes, stores, and protects your personal data when you access and use the Delika platform ("Delika", "Delika App", or "Delika Web Platform"). Delika is Krontiva's digital food and retail ordering service that allows users ("you" or "your") to browse, order, and receive deliveries of food and retail items from restaurants and merchants listed on the platform.
                    </p>
                    <p className="text-gray-600 mb-4">
                      This Notice applies to all individuals using the Delika platform within Ghana and other regions where the service is made available. It outlines our commitment to protecting your privacy in accordance with the Data Protection Act, 2012 (Act 843) of Ghana and other applicable data protection laws and standards.
                    </p>
                    <p className="text-gray-600">
                      This Notice should be read alongside Delika's Terms of Use and any other policies or guidelines provided through our digital platforms or communicated directly by Krontiva. It aims to provide transparency on what personal information we collect, why we collect it, how it is used, your rights as a data subject, and how you can exercise those rights.
                    </p>
                  </>
                ) : item.id === "who" ? (
                  <>
                    <p className="text-gray-600 mb-6">
                      This Privacy Notice applies to the following categories of individual:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Customers and Users</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Individuals who use the <span className="font-semibold">Delika</span> mobile application or web platform to browse, order, and pay for food and retail items from listed restaurants, vendors, or stores.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Restaurant Partners and Retail</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Businesses and merchants who register and operate on the <span className="font-semibold">Delika</span> platform to receive, process, and fulfill customer orders.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Riders and Delivery Agents</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Independent contractors or delivery personnel (including pedestrian riders) who use the <span className="font-semibold">Delika Rider App</span> or platform to receive, accept, and fulfill delivery requests.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Third-Party Service Providers and Contractors</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Entities or individuals engaged by Krontiva Africa to support, manage, or improve platform-related services, including customer service, logistics, payment facilitation, marketing, or analytics.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Website and App Visitors</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Any individuals who visit <span className="font-semibold">Delika's</span> website or access any of its digital channels, regardless of whether they are registered users.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Prospective Partners or Clients</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Individuals or businesses who engage with Krontiva or express interest in joining the <span className="font-semibold">Delika</span> platform in any of the roles above.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "definitions" ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                      <tbody>
                        <tr>
                          <td className="px-4 py-3 border-b border-gray-200 align-top font-medium w-1/4">Data Subject</td>
                          <td className="px-4 py-3 border-b border-gray-200 align-top">
                            Means an identified or identifiable natural person. An identifiable natural person is one who can be identified, directly or indirectly, <span className="underline">in particular</span> by reference to an identifier or one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person. It shall also include any additional persons afforded data privacy rights and protection of Personal Data in terms of the Data Protection Act, 2012 (Act 843) and any other Applicable Data Privacy Law.
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Local Regulatory Requirements</td>
                          <td className="px-4 py-3 border-b border-gray-200 align-top">
                            Legal, statutory, regulatory, license conditions, rules, guidelines, Ministerial/National Security orders or directives, and Directives relating to <span className="underline">Public</span> safety (where applicable) and Data Sovereignty -related requirements with which Krontiva Africa is required to comply.<br /><br />
                            Data Sovereignty relates to the laws, restrictions, governance structures a country may impose on Personal Data that is processed within its <span className="underline">jurisdictions</span>.
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Personal Data</td>
                          <td className="px-4 py-3 border-b border-gray-200 align-top">
                            <span className="font-semibold">"<a href="#" className="text-blue-600 underline">personal</a> data"</span> means data about an individual who can be identified, from the data, or from the data or other information in the possession of, or likely to come into the possession of the data controller;
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Processing</td>
                          <td className="px-4 py-3 border-b border-gray-200 align-top">
                            Any operation or set of operations which is performed on Personal Data or on sets of Personal Data, whether or not by automated means, including collection, receipt, recording, <span className="underline">organisation</span>, structuring, collation, storage; adaptation or alteration, updating, retrieval, consultation, use, dissemination, disclosure by means of transmission; or otherwise making available, alignment or combination, merging, restriction, erasure, destruction, and/or degradation.
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Special Personal Data</td>
                          <td className="px-4 py-3 border-b border-gray-200 align-top">
                            <span className="font-semibold">"special personal data"</span> means personal data which consists of information that relates to the race, <span className="underline">colour</span>, ethnic or tribal origin of the data subject; the political opinion of the data subject; the religious beliefs or other beliefs of a similar nature, of the data subject; the physical, medical, mental health or mental condition or DNA of the data subject; the sexual orientation of the data subject;  the commission or alleged commission of an offence by the individual; or  proceedings for an offence committed or alleged to have been committed by the individual, the disposal of such proceedings or the sentence of any court in the proceedings;
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : item.id === "contact" ? (
                  <>
                    <p className="mb-2">For questions or privacy concerns, please contact:</p>
                    <p className="mb-1">Privacy Officer<br />Krontiva Africa Ltd<br />Email: <a href="mailto:info@krontiva.africa" className="text-blue-600 underline">info@krontiva.africa</a></p>
                    <p className="mb-4">Address:<br />The Octagon<br />Floor 7<br />Independence Avenue - Barnes Rd<br />Accra Central</p>
                    <p>Thank you for trusting Delika with your personal information. We are committed to protecting your privacy and ensuring transparency in how we handle your data.</p>
                  </>
                ) : (
                  <p className="text-gray-600">Content for {item.label} will be added here.</p>
                )}
              </CollapsibleSection>
            ))}
          </div>
        </main>
        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={handleBackToTop}
            className="fixed bottom-8 right-8 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg p-4 transition-colors focus:outline-none"
            aria-label="Back to top"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 