"use client";

import React, { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

const toc = [
  { id: "about", label: "1. About this Privacy Notice" },
  { id: "who", label: "2. Who Does This Notice Apply To?" },
  { id: "definitions", label: "3. Key Definitions to Help You Understand This Privacy Notice" },
  {
    id: "dataprocess",
    label: "4. What personal data do we process?",
  },
  { id: "sharing", label: "5. Who do we share your personal data with?" },
  { id: "safety", label: "6. How do we keep your personal data safe?" },
  { id: "breaches", label: "7. How does Krontiva Africa handle Personal Data Breaches?" },
  {
    id: "retention",
    label: "8. How long do we retain your personal data for?",
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

function CollapsibleSection({ id, title, children, openSection, onToggle }: CollapsibleSectionProps & { openSection: string | null; onToggle: (id: string) => void }) {
  const isOpen = openSection === id;
  
  // Expand if hash matches on mount
  useEffect(() => {
    if (window.location.hash === `#${id}` && !isOpen) {
      onToggle(id);
    }
  }, [id, isOpen, onToggle]);
  
  return (
    <section id={id} className="mb-4">
      <button
        className="w-full flex justify-between items-center py-3 px-4 text-left font-semibold text-base rounded-lg bg-white hover:bg-orange-50 focus:bg-orange-100 transition-colors shadow-sm focus:outline-none group"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        aria-controls={id + '-content'}
        style={{ border: 'none' }}
      >
        <span>{title}</span>
        <ChevronDownIcon className={`ml-2 h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} group-hover:text-orange-500`} />
      </button>
      <div
        id={id + '-content'}
        className={`transition-all duration-300 overflow-hidden bg-white rounded-b-lg shadow-inner ${isOpen ? 'max-h-[4000px] opacity-100 py-2 px-4' : 'max-h-0 opacity-0 py-0 px-4'}`}
      >
        <div>{children}</div>
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Handle section toggle for single accordion
  const handleSectionToggle = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  // Scroll and expand on TOC click
  const handleTocClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Open the section
      setOpenSection(id);
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
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
      <SiteHeader />
      <div className="py-12 relative">
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
                <CollapsibleSection
                  id={item.id}
                  title={item.label}
                  key={item.id}
                  openSection={openSection}
                  onToggle={(id) => handleSectionToggle(id)}
                >
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
                  ) : item.id === "dataprocess" ? (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        We collect and process personal data:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>provided by you to Krontiva Africa;</li>
                        <li>when you use the Delika Platforms; and</li>
                        <li>from other sources such as authorised third parties who administer services on behalf of Krontiva Africa, and in some countries, governmental or public databases.</li>
                      </ul>
                    </div>
                  ) : item.id === "collect" ? (
                    <div className="space-y-4">
                      <p className="text-gray-600 mb-4">
                        In most circumstances we collect Personal Data directly from you when you:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Buy from any businesses signed onto the Delika platform</li>
                        <li>Use our platforms</li>
                        <li>Subscribe to newsletters, alerts or other services from us</li>
                        <li>Contact us through various channels, or ask for information about a product or service</li>
                        <li>Take part in a competition, draw, event or survey</li>
                        <li>Visit or browse our website</li>
                        <li>Have given permission to other companies to share information about you</li>
                        <li>Where your information is publicly available</li>
                        <li>Are the customer of a subsidiary or a business that we acquire</li>
                      </ul>
                      <p className="text-gray-600 mt-4">
                        We may also collect information from certain organizations, where appropriate and to the extent we have legal grounds to do so. These include:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Credit check or vetting agencies;</li>
                        <li>Fraud-prevention agencies</li>
                        <li>Social media platforms;</li>
                        <li>Marketing agencies;</li>
                        <li>Resellers in respect of the Personal Data of customers, users and suppliers;</li>
                        <li>Third parties providing supplier and reseller references.</li>
                      </ul>
                    </div>
                  ) : item.id === "provided" ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category of Personal Data</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Description of Personal Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Profile Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect personal data about you when you register to access the various Delika Platforms and/or use the Delika App including:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                                <li>Saved favorite delivery addresses (optional)</li>
                                <li>Preferences and settings related to the account, such as language preferences, communication preferences and notification settings</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Payment Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect details of your payment methods including payment card type, bank name, bank account number, bank account sort code, Momo numbers, related payment verification information and transaction history on the Delika Platform.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Identification / Verification Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect identification documents including government-issued or national identity documents (such as passports, driver's licenses or national ID cards) and photographs/pictures (such as a selfie). This data is submitted by you when you are required by Krontiva to verify your age and identity when ordering age-restricted goods.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Demographic Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect demographic data such as your age when you are required to verify your age by Krontiva.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Survey / Interview Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect the content of your replies or attachments you may send us, during the course of surveys and interviews that we conduct.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : item.id === "collected" ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category of personal data</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Description of personal data</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Geolocation Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect data about your precise and/or approximate geolocation (including GPS and IP addresses) from your mobile device depending on your app settings and device permissions, when you log in to, open, and use the Delika Platform.
                              <br /><br />
                              You may use the Delika App without enabling collection of Geolocation Data from your mobile device. This may affect some features on the Delika App, and you may have, for example, to enter your delivery address.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Order Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect personal data via the Delika Platform about your use of the Delika's services. This includes:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Details of orders or order history (including date and time of the order, delivery addresses and geolocation data, details of the food or other delivery items ordered, your special instructions or preferences, the restaurant or store name and location, order price, currency and your delivery notes)</li>
                                <li>Loyalty card information (including whether you used any coupons, loyalty cards or promotional codes)</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">App Usage Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect personal data via the Delika App about your use of the Delika Platform. This includes:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Log-in history (dates and times you log-in and log-off the Delika Platform); and</li>
                                <li>Interaction with the Delika Platform (features or pages viewed or proposed to be viewed, time spent interacting with a page, browser type and other system activity).</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Communication Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect communication and correspondence data when you:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Engage with our Customer Support Team via the in-app chat function;</li>
                                <li>Report an incident;</li>
                                <li>Communicate via emails, web forms, or speak with our Customer Support agents;</li>
                                <li>Communicate with Delivery Partners via the Delika Platform using the in-app chat function or via internet calls (where available).</li>
                              </ul>
                              <br />
                              We record the date and time of the communications and its content and your phone number (where you use the call feature).
                              <br /><br />
                              We will record calls, only where you are notified in advance that the call may be recorded.
                              <br /><br />
                              In the markets where we facilitate phone calls and text messages between Clients and Delivery Partners without sharing either party's actual phone number with the other, we protect your personal data by using a masked numbers application.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">User Generated Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect personal data when you use certain features. This includes:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Content like pictures, videos, files in connection with a Customer Support request.</li>
                                <li>Ratings and feedback about:
                                  <ul className="list-disc pl-6 mt-1 space-y-1">
                                    <li>the Partners by evaluating the order on a scale from 1 (poor) to 10 (excellent), and optional comments, when your order is delivered.</li>
                                    <li>the delivery experience inside the Delika App by evaluating the Delivery Partners with thumbs up or thumbs down, and optional comments, when your order is delivered.</li>
                                  </ul>
                                </li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Warning and Suspension Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect details of warnings and suspensions that have been issued to a client. This includes:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Date(s) on which warnings or suspensions have been issued.</li>
                                <li>Date of expiry of a suspension.</li>
                                <li>Reason for the warning or suspension</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Device Data</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We collect data about the devices you use to access the Delika Platforms, including:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Hardware model</li>
                                <li>Device IP address</li>
                                <li>Other unique device identifiers (such as your UUID and advertising identifiers)</li>
                                <li>Device operating system</li>
                                <li>Browser version</li>
                                <li>Device vendor name</li>
                                <li>App version</li>
                                <li>Identity of carrier and manufacturer and preferred languages.</li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : item.id === "purposes" ? (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        The table below sets out:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>our purpose for processing your personal data;</li>
                        <li>our legal grounds (known as a 'legal basis') under data protection law, for each purpose; and</li>
                        <li>the categories of personal data we use for each purpose.</li>
                      </ul>
                      <p className="text-gray-600 mt-4">
                        Here is a general explanation of each 'legal basis' that Krontiva relies on to process your personal data to help you understand the table below:
                      </p>
                      <div className="bg-orange-50 rounded-lg p-4 space-y-3">
                        <div>
                          <strong>Performance of a Contract:</strong> When it is necessary for Krontiva (or a third party) to process your personal data to provide you with the Delika services we promised you and meet our obligations under the Terms and Conditions for Clients. Where the legal basis for processing your personal data is performance of a contract, and you choose not to provide the information, you may be unable to use the Delika services.
                        </div>
                        <div>
                          <strong>Legitimate Interests:</strong> When we process your personal data relying on legitimate interest grounds. This includes our commercial and non-commercial interests in providing an innovative, personalized and safe service to you, other Clients, and other third parties (including Delivery Partners or Restaurants). Where the table below states that we rely on legitimate interests, we have provided a brief description of the legitimate interest. If you would like more information about this, please contact us using the methods set out in Section 12 "How do you contact us?" below. In countries where legitimate interest is not an available lawful basis for Krontiva's processing activities, we will instead rely on an alternative valid legal basis.
                        </div>
                        <div>
                          <strong>Consent:</strong> When we ask you to actively indicate your agreement to our use of your personal data for a certain purpose of which you have been informed of. Where we rely on consent to process your personal data, you can withdraw your consent to such activities at any time. Withdrawal of the consent does not affect the lawfulness of any processing which took place prior to you giving your consent to us.
                        </div>
                        <div>
                          <strong>Compliance with Legal Obligations:</strong> When we must process your personal data because it is required by a law or regulation in the markets we operate in, such as to comply with our licensing conditions and our obligations under tax and accounting laws. Where the legal basis for processing your personal data is compliance with legal obligations, and you choose not to provide the information, you may be unable to use the Delika services.
                        </div>
                        <div>
                          <strong>Vital Interests:</strong> When we process your personal data where it is necessary to protect your vital interests or those of others, for example in the event of an emergency or an imminent threat to life.
                        </div>
                      </div>
                    </div>
                  ) : item.id === "sharing" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        We may share your personal data with:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Delivery Partners, who are independent contractors or employees of Krontiva Africa, who are responsible for delivering your orders.</li>
                        <li>Restaurant Partners, who are responsible for preparing and delivering your orders.</li>
                        <li>Third-party service providers and contractors, who assist us in providing the Delika services, including payment processing, fraud prevention, customer support, marketing, analytics, and infrastructure providers.</li>
                        <li>Businesses or individuals with whom you choose to share your personal data, such as when you make a purchase or request a service directly from them.</li>
                        <li>Law enforcement authorities, regulatory bodies, or other third parties where required by law or regulation, or where we believe it is necessary to protect our rights, property, or safety, or the rights, property, or safety of others.</li>
                      </ul>
                    </>
                  ) : item.id === "safety" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        We take appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage, using appropriate security measures such as encryption, pseudonymization, and hashing.
                      </p>
                      <p className="text-gray-600">
                        We regularly review and update our security measures to ensure they remain effective and appropriate.
                      </p>
                    </>
                  ) : item.id === "breaches" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        In the event of a Personal Data Breach, we will:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Identify the nature and scope of the breach as soon as reasonably practicable.</li>
                        <li>Assess the risk to your rights and freedoms and notify you and the relevant supervisory authority (where applicable) without undue delay.</li>
                        <li>Take steps to mitigate the risk to your rights and freedoms.</li>
                        <li>Keep records of the breach for a period of 5 years.</li>
                      </ul>
                    </>
                  ) : item.id === "retention" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        We retain your personal data for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                      </p>
                      <p className="text-gray-600">
                        The specific retention periods for different types of personal data are as follows:
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category of Personal Data</th>
                              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Retention Period</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Profile Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained until you request deletion of your account.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Payment Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for the duration of the transaction and for a period of 7 years for tax and accounting purposes.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Identification / Verification Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for the duration of the verification process and for a period of 5 years for tax and accounting purposes.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Order Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for a period of 7 years for tax and accounting purposes.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Communication Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for a period of 5 years for tax and accounting purposes.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">User Generated Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for a period of 5 years for tax and accounting purposes.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Warning and Suspension Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for a period of 5 years for tax and accounting purposes.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Device Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for a period of 5 years for tax and accounting purposes.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : item.id === "rights" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        You have the following rights regarding your personal data:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Access: You have the right to request access to your personal data.</li>
                        <li>Rectification: You have the right to request that we correct any inaccurate personal data we hold about you.</li>
                        <li>Erasure: You have the right to request that we delete your personal data, subject to certain exceptions.</li>
                        <li>Restriction of Processing: You have the right to request that we restrict the processing of your personal data.</li>
                        <li>Object to Processing: You have the right to object to the processing of your personal data.</li>
                        <li>Data Portability: You have the right to request that we transfer your personal data to another data controller.</li>
                        <li>Withdraw Consent: Where we rely on your consent to process your personal data, you have the right to withdraw your consent at any time.</li>
                      </ul>
                      <p className="text-gray-600 mt-4">
                        To exercise any of these rights, please contact us using the methods set out in Section 12 "How do you contact us?" below.
                      </p>
                    </>
                  ) : item.id === "directmarketing" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        We may use your personal data for direct marketing purposes, including sending you promotional communications about our services, provided that:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>You have given your explicit consent to receive such communications.</li>
                        <li>We have a legitimate interest in sending you such communications, such as to inform you about new features, promotions, or other news about the Delika services.</li>
                      </ul>
                      <p className="text-gray-600 mt-4">
                        You can opt out of receiving direct marketing communications at any time by clicking the unsubscribe link in any promotional email we send to you, or by contacting us using the methods set out in Section 12 "How do you contact us?" below.
                      </p>
                    </>
                  ) : item.id === "changes" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        We may update this Privacy Notice from time to time. We will notify you of any changes by posting the new Privacy Notice on the Delika website or through the App. You are advised to review this Privacy Notice periodically for any changes. Changes to this Privacy Notice are effective when they are posted on this page.
                      </p>
                    </>
                  ) : item.id === "contact" ? (
                    <>
                      <p className="mb-2">For questions or privacy concerns, please contact:</p>
                      <p className="mb-1">Privacy Officer<br />Krontiva Africa Ltd<br />Email: <a href="mailto:info@krontiva.africa" className="text-blue-600 underline">info@krontiva.africa</a></p>
                      <p className="mb-4">Address:<br />Barnes Rd, Accra<br />Independence avenue</p>
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
      <Footer />
    </div>
  );
} 