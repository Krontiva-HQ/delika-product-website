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
        className={`transition-all duration-300 bg-white rounded-b-lg shadow-inner ${isOpen ? 'opacity-100 py-2 px-4' : 'max-h-0 opacity-0 overflow-hidden py-0 px-4'}`}
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
          <main ref={mainRef} className="flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-12">
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
                    <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.1. Where does Krontiva Africa collect my Personal Data from?</h3>
                      <p className="text-gray-600">
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
                          <li>Credit check or vetting agencies</li>
                          <li>Fraud-prevention agencies</li>
                          <li>Social media platforms</li>
                          <li>Marketing agencies</li>
                          <li>Resellers in respect of the Personal Data of customers, users and suppliers</li>
                          <li>Third parties providing supplier and reseller references</li>
                      </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.2. Personal data provided by you to Krontiva Africa</h3>
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
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.3. Personal data we collect about you when you use the Delika App and Web Platform</h3>
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
                                    <li>Log-in history (dates and times you log-in and log-off the Delika Platform)</li>
                                    <li>Interaction with the Delika Platform (features or pages viewed or proposed to be viewed, time spent interacting with a page, browser type and other system activity)</li>
                                  </ul>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Communication Data</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  We collect communication and correspondence data when you:
                                  <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li>Engage with our Customer Support Team via the in-app chat function</li>
                                    <li>Report an incident</li>
                                    <li>Communicate via emails, web forms, or speak with our Customer Support agents</li>
                                    <li>Communicate with Delivery Partners via the Delika Platform using the in-app chat function or via internet calls (where available)</li>
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
                                    <li>Content like pictures, videos, files in connection with a Customer Support request</li>
                                    <li>Ratings and feedback about:
                                      <ul className="list-disc pl-6 mt-1 space-y-1">
                                        <li>the Partners by evaluating the order on a scale from 1 (poor) to 10 (excellent), and optional comments, when your order is delivered</li>
                                        <li>the delivery experience inside the Delika App by evaluating the Delivery Partners with thumbs up or thumbs down, and optional comments, when your order is delivered</li>
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
                                    <li>Date(s) on which warnings or suspensions have been issued</li>
                                    <li>Date of expiry of a suspension</li>
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
                                    <li>Identity of carrier and manufacturer and preferred languages</li>
                                  </ul>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.4. What purposes do we use your personal data for and what is our legal basis for processing?</h3>
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

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.5. For the provision of the Delika services</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of Personal Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">To create, update and maintain your Delika account</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Performance of a Contract</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Profile Data<br/>Device Data</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To authenticate your account and verify your identity<br/><br/>
                                  We collect information to verify who you say you are and in certain circumstances to verify your age and eligibility for Delika services (such as purchasing age-restricted items), when required by local law. If we ask you to verify your identity (either upon registration or as a result of unusual activity being detected on your Delika account) and you are not able to verify, the Delika ordering services will be suspended to prevent fraud until the verification process is completed. As part of the verification process, you may be asked to submit a selfie and/or ID document to prove your identity.<br/><br/>
                                  To verify your identity quickly and securely, we use facial recognition technology to confirm that your selfie shows a clear face and matches the face on your identity document. This involves processing your facial measurements.<br/><br/>
                                  Your biometric data may be shared with trusted verification providers to confirm your identity. You can withdraw consent at any time by contacting our Customer Support.<br/><br/>
                                  We retain your selfie and identity document as long as you have an active user account.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Compliance with Legal Obligations<br/><br/>
                                  Legitimate Interests - It is in our interest and in the interest of our clients to prevent and address unauthorized uses of Delika accounts and violations of our Terms and Conditions for Clients.<br/><br/>
                                  Consent - Your opt-in consent will be required in order for us to proceed with biometric verification checks.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Identification / Verification Data<br/>
                                  Demographic Data<br/>
                                  Device Data<br/>
                                  Geolocation Data<br/>
                                  App Usage Data<br/>
                                  Suspension Data
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To make sure the Delika App works optimally<br/><br/>
                                  We use your Profile Data to notify you of updates to the Delika App so you can keep using the Delika services. We also use Device Data and App Usage Data to ensure you can connect to the Delika Platform and to help keep your account safe through authentication and verification checks.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Performance of a Contract<br/><br/>
                                  Consent - Your opt-in consent is required for the use of Analytics, and Third-Party Technologies Data<br/><br/>
                                  Legitimate Interest
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Device data<br/>
                                  App Usage Data<br/>
                                  Identification / Verification data<br/>
                                  Analytics, and Third-Party Technologies Data
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To improve our websites and apps<br/><br/>
                                  We collect and may use your App Usage Data to improve our websites and Delika App (including their security features) by analyzing it to better understand our business and services.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Legitimate Interest</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">App Usage Data</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To calculate prices and process payments<br/><br/>
                                  We collect Payment Data to process and facilitate payment between Clients and restaurants and stores and Delivery Partners, and Geolocation Data to calculate prices based on the delivery address of the Clients taking into account distance, duration and other factors.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Performance of a Contract</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Payment Data<br/>
                                  Geolocation Data
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To administer the use of and payment for the Delika services you are offered by a Delika Business Client or another Delika account owner<br/><br/>
                                  We collect your Contact Data if you use Delika services through your employer who is a Delika Business Client.<br/><br/>
                                  In addition, if an organization or another Delika account owner has made an order for you, we will collect from them your Contact Data, Order Data and Geolocation Data.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Performance of a contract</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Contact Data<br/>
                                  Order Data<br/>
                                  Geolocation Data
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To get your feedback on your level of satisfaction with Delika services through surveys and interviews<br/><br/>
                                  These surveys and interviews are designed to understand your feedback on our services, to measure customer satisfaction and enable us to take actions to improve the experience. The Survey and Interview Data may be shared with research partners we use to understand your feedback.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Consent - Your opt-in consent will be required.<br/><br/>
                                  Legitimate Interests - It is in our interest and in the interest of our Clients to provide a satisfying delivery experience.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Demographic Data<br/>
                                  Survey/Interview Data
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.6. For Customer Support</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of Personal Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To provide customer support services and receive and process feedback<br/><br/>
                                  We process your personal data to investigate and address your queries including reported safety incidents/alleged criminal acts and complaints (including resolving disputes between Clients and restaurants and Delivery Partners). We also use the data you share to address quality issues and to improve our services.<br/><br/>
                                  For safety related incidents, your Suspension Data will only be reviewed by Krontiva's Customer Support and/or Safety Teams when investigating a safety/criminal incident on the Delika Platform involving you. The teams will also review the circumstances surrounding potential safety incidents.<br/><br/>
                                  We may use automated processes for complaint resolution purposes via our automated chat function. For further information regarding how to object to the above activities, please see Section 9 "What are your rights?" below.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Performance of a Contract<br/><br/>
                                  Legitimate Interests - It is in our interest and in the interest of our Clients to support them throughout their use of the Delika Platform and continuously improve and develop the customer support we provide. In addition, it is in our interest and interest of our Clients and Delivery Partners to address threats and abuse and promote safety, integrity and security on the Delika Platform to ensure our services are used in accordance with the Terms and Conditions for Clients<br/><br/>
                                  Compliance with Legal Obligations - We process personal data to comply with our legal obligation to cooperate with law enforcement when there is a safety incident.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Order Data<br/>
                                  Communication Data<br/>
                                  User Generated Data<br/>
                                  Suspension Data
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.7. For safety and security</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of Personal Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To prevent, detect and investigate fraudulent accounts, fraudulent payments or other unlawful use of the Delika Platform and apply suspensions and blocks as needed<br/><br/>
                                  Our automated anti-fraud system will identify fraudulent accounts, payments, abuse of Delika's services and other malicious activity on the Delika Platform, like, for example, when you top up your balance, request multiple refunds or go through authentication processes. To enable us to investigate, a temporary suspension may be applied to a Delika account.<br/><br/>
                                  While the Delika Platform may use automated processes for fraud detection purposes, decisions to block a Client are taken following human review by our staff, and no account is blocked automatically without first undergoing a verification process. For further information regarding how to object to the above activities, please see Section 9 "What are your rights?" below.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Legitimate Interests - It is in our interest and in the interests of our Clients to detect, prevent and address fraud, unauthorized use of Delika accounts or other harmful or illegal activity and maintain the safety and security of our systems, by responding to suspected or actual criminal acts. It is also in our interest and in the interests of our Clients to prevent and address violations of our Terms and Conditions.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Identification / Verification Data<br/>
                                  Device Data<br/>
                                  Geolocation Data<br/>
                                  App Usage Data<br/>
                                  Payment Data<br/>
                                  Communication Data<br/>
                                  Order Data
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To issue temporary suspensions<br/><br/>
                                  In order to provide a safe and reliable marketplace, we monitor Clients' compliance with our Terms and Conditions for Clients and use App Usage Data to temporarily suspend access to any of the Delika Platforms:<br/>
                                  - If the Client causes any abuse or harm to the Delika Platform<br/>
                                  - If Krontiva has reasonable belief of fraudulent acts by the Client when using the Delika Platform<br/>
                                  - If the Client otherwise fails to comply with his/her obligations under the General Terms<br/>
                                  - If the Client creates any safety concerns or risks to the Delivery Partners
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Performance of a Contract<br/><br/>
                                  Legitimate interests - It is in our interest and in the interests of our Clients and Delivery Partners to ensure a reliable and trustworthy service and Platform sustainability. It is also in our interest to ensure and to enforce our services are used in accordance with the Terms and Conditions for Clients.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Suspension Data<br/>
                                  App Usage Data
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.8. For marketing and advertising</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of Personal Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To market and advertise Delika services and those of partners according to your preferences and measure the effectiveness of ads<br/><br/>
                                  This includes using your personal data to send you targeted emails, text messages (including WhatsApp messages), push notifications, in-app messages and other communications marketing Krontiva's and its partners' products, services, features, offers, promotions, sweepstakes, news and events that could be of interest.<br/><br/>
                                  It also includes using your App Usage Data like order history, Device Data and Geolocation Data to show you targeted or personalized advertisements or personalized recommendations through the Delika services. For example, we may display ads for restaurants or stores that are available on the Delika Platform. We may also display ads on the Delika App based on observed or inferred data such as location, interests and behaviors and ads for third party products that are not available on our Apps.<br/><br/>
                                  We will further display personalized ads about our products on third- party apps and collect data about your visits and actions on these third-party apps or websites.<br/><br/>
                                  We will use pixels and similar technologies to track which emails were opened and which links were clicked by you, to help us measure the results of our campaigns and we will also use data to measure the effectiveness of our ads, and of third parties' displayed in the Delika Platform or in connection with Delika's services.<br/><br/>
                                  In addition, we will analyse, aggregate your App Usage Data and provide it to you in a summarised way each year for the wrap-up marketing campaign connected to the End of Year campaign.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Legitimate Interests - It is in our interest and in the interest of our Clients to inform them about our services and features or those offered by Krontiva partners. It is also in our interest to promote and advertise our services, including engaging in contextual (non-data driven) and personalized advertising, analytics, and measurement of ad performance, in order to expand our user base by deepening relationships with existing Clients and developing new ones. You can opt out of these communications at any time by clicking the 'unsubscribe' link at the bottom of our emails, typing "STOP" for messages and SMS, or updating your communication preferences in your account settings.<br/><br/>
                                  Consent - Your opt-in consent will be required for example, when the law requires consent for email marketing and for certain tracking technologies.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Contact Data<br/>
                                  Profile Data<br/>
                                  Order Data<br/>
                                  App Usage Data<br/>
                                  Device Data<br/>
                                  Geolocation Data<br/>
                                  Analytics, and Third-Party Technologies Data
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.9. For Service Communications</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of Personal Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To communicate with you, including sending you service-related communications and to keep you informed<br/><br/>
                                  Your name, phone number and email address will be used to communicate with you to send you order confirmation emails and receipts, to provide you with delivery updates, to let you know that your order has been completed, and to inform you about important service updates.<br/><br/>
                                  For guest users, if you share your email address, we will use it just to send you a cost summary
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Performance of a Contract</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Contact Data
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.10. For research and improvement of the Delika Platform</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of Personal Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To perform research, testing, and analytics to better understand and improve our business and services<br/><br/>
                                  For example, we use Geolocation Data, Order Data, Communication Data and App Usage Data to conduct research to develop or improve our products, services, technology, algorithms, machine learning, and other modelling.<br/><br/>
                                  We use Communication Data related to incidents to monitor our security practices and improve our operations and processes.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Legitimate Interests - It is in our interest to measure the use of our services in order to inform business decisions and to enable provision of accurate and reliable reporting and to continuously improve and develop the services we provide.<br/><br/>
                                  Consent - For certain analytics we may require your consent. If so, you'll be prompted to provide consent for specific purposes and processing activities, with details on how to withdraw consent, including through your profile settings.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Geolocation Data<br/>
                                  Order Data<br/>
                                  App Usage Data<br/>
                                  Communication Data<br/>
                                  User Generated Content<br/>
                                  Device Data
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">To develop new products, features, partnerships and services</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Legitimate Interests - It is in our interest and in the interest of our Clients to develop and adopt new features to improve the Delika Platform.</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Geolocation Data<br/>
                                  App Usage Data<br/>
                                  Communication Data<br/>
                                  User Generated Content<br/>
                                  Device Data
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">To prevent, find, and resolve software or hardware bugs and issues</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Legitimate Interests - It is in our interest and in the interest of our Clients to provide a hassle free and reliable service.</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Geolocation Data<br/>
                                  User Generated Content<br/>
                                  Communication Data<br/>
                                  Device Data<br/>
                                  App Usage Data
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">4.11. For legal proceedings and compliance with the law</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of Personal Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To investigate and respond to claims and disputes relating to the use of Delika services, and/or necessary for compliance with applicable legal requirements or with requests from government/law enforcement bodies<br/><br/>
                                  Depending on the claim, All Data may be processed for establishing, exercising or defending legal claims, including:<br/>
                                  - supporting our own internal investigations<br/>
                                  - the assignment of claims and the use of debt collecting agencies<br/>
                                  - the use of legal advisors<br/><br/>
                                  In some circumstances, we are legally obliged to share information with external recipients. For example, under a Court Order or where we cooperate with a data protection supervisory authority in handling complaints or investigations. We also respond to requests, such as those from law enforcement agencies, when the response is required by law or furthers a public interest task such as an emergency situation or where someone's life is at risk. We will take steps to ensure that we have a lawful basis on which to share the information, and we'll make sure that we document our decision.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Compliance with Legal Obligations - We process personal data to comply with an obligation, when there is a request from a regulator, law enforcement or other governmental body.<br/><br/>
                                  Legitimate Interests - In the context of litigation or other disputes, it is in our interest to protect our interests and rights, our Clients or others, including as part of investigations, regulatory inquiries or litigation.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">All Data</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">To fulfill our tax obligations and comply with tax legislation</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Compliance with a Legal Obligation</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  Profile Data<br/>
                                  Payment Data<br/>
                                  App Usage Data
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">To reorganize or make changes to our business</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Legitimate Interests - It is in our interest to process personal data for organizational and business planning purposes.</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">All Data</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">
                                  To ensure the security of the Delika services (including the Delika Web Platform and Delika App)<br/><br/>
                                  Depending on the issue, All Data may be used for technical and cyber security reasons: for example measures for combating piracy and ensuring the security of the service, website, Delika Platform for making and storing back-up copies and preventing/repairing technical issues.
                                </td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">Legitimate Interests - It is in our interest and in the interest of our Clients to protect, guard and maintain Delika's security systems, respond to suspected or actual criminal acts and repair any technical issues.</td>
                                <td className="px-4 py-3 border-b border-gray-200 align-top">All Data</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-gray-600">
                          When we process your personal data for a new purpose different from the purpose your personal data was originally collected for and we haven't asked for your consent, we will have to ensure that this new purpose is compatible with the initial purpose we collected it for. We will take into account any link between the two purposes and decide if the personal data can be used for this new purpose. Otherwise, we will take appropriate steps to ask for your consent or refrain from processing your personal data.
                        </p>
                      </div>
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
                        We may share your personal data with the following categories of recipients.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg bg-white mb-6">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category of Recipients</th>
                              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Restaurants and stores</td>
                              <td className="px-4 py-3 border-b border-gray-200">
                                <p className="mb-2">Your personal data is only disclosed to the restaurants and stores when you place an order on the Delika Platform.</p>
                                <p className="mb-2">In such a case, the restaurant or store will see:</p>
                                <ul className="list-disc pl-6 mb-2">
                                  <li>Your first name and last name</li>
                                  <li>Contact phone number</li>
                                  <li>Your delivery address (in case the restaurant or store uses their own delivery method and do not leverage Delivery Partners partnering with Delika)</li>
                                  <li>Order Data, together with any information submitted by you together with Order Data (for example information about food preference, cooking preferences, information about any allergies if such information is disclosed by you in the course of submitting the order)</li>
                      </ul>
                                <p className="mb-2">Once the order is completed and to the extent you leave feedback on the restaurant or store, we share it with the restaurant or store.</p>
                                <p className="mb-2">After fulfilling the order, your first name and the telephone number will remain visible to the Partner such as restaurants or stores for 24-48 hours. This is necessary to resolve any issues with you regarding your order, such as issuing an electronic receipt for your order, or contacting you about availability of items you ordered.</p>
                                <p className="mb-2">Clients may also opt-in to share their contact and order details with a specific restaurant or store to receive marketing communications from such restaurant or store.</p>
                                <p>To the extent you use Dine-in service as the registered user, your personal data will be shared with the restaurant such as your table number and ID, your order details, your status of payment and any feedback you submit to rate the food and service.</p>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Delivery Partners</td>
                              <td className="px-4 py-3 border-b border-gray-200">
                                <p className="mb-2">Your delivery address, first name and the letter of the last name and contact phone number (to the extent the Delivery Partner reaches out to you using the Delika button "Call" during the active order) will be shared for the order delivery with the Delivery Partner.</p>
                                <p>After fulfilling the order, your first name and the telephone number is not visible to the Delivery Partner.</p>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Promotional, marketing and strategic partners</td>
                              <td className="px-4 py-3 border-b border-gray-200">
                                <p className="mb-2">We may share limited data like your email address with our promotional, marketing and strategic partners so that they can inform you about promotional events and provide you with information and marketing messages about products or services that may interest you.</p>
                                <p>In addition, we may share your personal data with marketing platform providers, including social media advertising services, advertising networks, third-party data providers, to reach or better understand our users and measure the effectiveness of our ads on other platforms and with social media platforms, including Facebook and Google, for sign-in purposes.</p>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Third-party service providers</td>
                              <td className="px-4 py-3 border-b border-gray-200">
                                <p>Our third-party vendors and other service providers and contractors have access to your personal data to help carry out the services they are performing for us or on behalf of us. This may include vendors and providers who provide email or moreover electronic communication services, tax, legal and accounting services, product fulfilment, identity/verification processes, payment processing, customer support, fraud prevention and detection, data enhancement, web hosting and cloud storage, research, including surveys, analytics, crash reporting, performance monitoring and artificial intelligence, machine learning and statistical services. In addition, we will share data like your geolocation with Google in connection with the use of Google maps in our apps.</p>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Other third parties</td>
                              <td className="px-4 py-3 border-b border-gray-200">
                                <p>In the event of a likely change of control of the business (or a part of the business) such as negotiations for a sale, an actual sell, a merger, and acquisition, or any transaction, or reorganization, we may share your personal data with interested parties, including as part of any due diligence process with new or prospective business owners and their respective professional advisers. We may also need to transfer your personal data to that third party or re-organized entity after the sale or reorganization for them to use for the same purposes as set out in this Notice.</p>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Law Enforcement</td>
                              <td className="px-4 py-3 border-b border-gray-200">
                                <p>We may disclose information under a court order or where we cooperate with a data protection supervisory authority in handling complaints or investigations. For example, we may also share your personal data with law enforcement or other public authorities, including responding to requests when the information is required by law or furthers a public interest task. In any scenario, we will take steps to ensure that we have a lawful basis on which to share the information, and we'll make sure that we document our decision.</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-gray-600">
                        Please note, that our websites and apps may contain links to other third-party websites. If you follow a link to any of those third-party websites, please be aware that those websites may have their own privacy notices and that we do not accept any responsibility or liability for their notices or their processing of your personal data. Please check these notices before you submit any personal data to such third-party websites.
                      </p>
                    </>
                  ) : item.id === "safety" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        We take appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage, using appropriate security measures such as encryption, pseudonymization, and hashing.
                      </p>
                      <p className="text-gray-600 mb-4">
                        We regularly review and update our security measures to ensure they remain effective and appropriate.
                      </p>
                      <p className="text-gray-600 mb-4">
                        The security of your personal data is very important to us, and we have implemented appropriate technical and organizational controls to protect your personal data against unauthorized processing and against accidental loss, damage or destruction. We have implemented data encryption in transit and at rest, data privacy and security training, information security policies and controls around the confidentiality, integrity and availability of our data/systems.
                      </p>
                      <p className="text-gray-600 mb-4">
                        Any personal data collected in the course of providing Delika's services is transferred to and stored in our data centers which are in the cloud. Only authorized employees of Krontiva Africa LTD and partners have access to the personal data and they may access the data only for the purpose of resolving issues associated with the use of the services (including disputes regarding delivery services and customer support services).
                      </p>
                      <p className="text-gray-600 mb-4">
                        For our research and scientific purposes, all data, like bulk Geolocation Data, is anonymized so you can never be identified from it. Regarding anonymized data, we will not attempt to re-identify your personal data that has been de-identified, in the course of sharing your data with other organizations.
                      </p>
                      <p className="text-gray-600">
                        You are responsible though for choosing a secure password when we ask you to set up a password to access parts of our sites or apps. You should keep this password confidential and you should choose a password that you do not use on any other site.
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
                      <p className="text-gray-600 mb-4">
                        To determine the appropriate retention period for personal data, we consider:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                        <li>The amount, nature, and sensitivity of the personal data</li>
                        <li>The potential risk of harm from unauthorized use or disclosure of your personal data</li>
                        <li>The purposes for which we process your personal data and whether we can achieve those purposes through other means</li>
                        <li>The applicable legal, regulatory, tax, accounting, or other requirements</li>
                      </ul>
                      <div className="overflow-x-auto mb-8">
                        <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category</th>
                              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Retention Period</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Active Account Data</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for the duration of your active account plus any additional period required by law
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Transaction History</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for 5 years from the date of transaction for tax and accounting purposes
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Communication Records</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained for 2 years from the last interaction
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Marketing Preferences</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                Retained until you withdraw consent or request deletion
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">8.1 We have listed below the specific retention periods that apply to the personal data we process about you:</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category of Retention Periods</th>
                              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Tax, accounting and financial reporting purposes</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                We retain your financial data for up to 5 years after the last order if your personal data is necessary for tax, accounting and financial reporting purposes.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Provision of services purposes</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                We retain your data as long as you have an active account. If your account is deleted, personal data will be deleted (according to our retention schedule and rules), unless such data is still required to meet any legal obligation, or for accounting, dispute resolution or fraud prevention purposes.<br/><br/>
                                You may request deletion of your account at any time through the Krontiva Website. See Section 9 "What are your rights?" below for more information.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Formal investigations of a criminal offence, fraud or false information</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                We retain data for as long as necessary for the purposes of investigating and detecting fraudulent, criminal or unlawful activities, or false information having been provided.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Disputes</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                We retain data for the purpose of exercising or defending legal claims, including supporting our own internal investigations, including claims related to the unlawful processing or collection of user's consent, until the claim is satisfied or the expiry date of such claims.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Instant Messages</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                We retain data about instant messages between you and the Customer Support Team directly in the Delika App for 60 days from the last communication and in Krontiva's databases for 3 years from the last communication.<br/><br/>
                                Instant messages between Clients and Delivery Partners are kept in the Delika App only until the order is completed and for 30 days after in our systems.
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 border-b border-gray-200 align-top font-medium">Customer Support</td>
                              <td className="px-4 py-3 border-b border-gray-200 align-top">
                                We retain data in relation to support tickets submitted via instant messages, phone calls, web forms, and emails for 3 years from the last communication.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-gray-600 mt-4">
                        Please note that the deinstallation of Delika App in your device does not cause the deletion of your personal data. See Section 9 "What are your rights?" to exercise your Right of Erasure.
                      </p>
                    </>
                  ) : item.id === "rights" ? (
                    <>
                      <p className="text-gray-600 mb-6">As a data subject you have following rights:</p>
                      <div className="space-y-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Access your personal data (known as "Right of Access")</h3>
                          <p className="text-gray-600">You have the right to access and to request copies of your personal data by contacting our Customer Support Team.</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Update/correct your personal data (known as "Right of Rectification")</h3>
                          <p className="text-gray-600">You have the right to request us to correct personal data that is inaccurate or incomplete. You can change and correct certain personal data yourself within the Delika Platform or by contacting our Customer Support Team.</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Delete your personal data (known as "Right of Erasure")</h3>
                          <p className="text-gray-600">You have the right to request that we erase your personal data, under certain conditions (e.g., we are processing your personal data under your consent). Personal data that is processed pursuant to a legal obligation or where we have an overriding legitimate interest may not be deleted upon request. You can request erasure of your personal data by contacting our Customer Support Team.</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Restrict use of your personal data (known as "Right to Restrict Processing")</h3>
                          <p className="text-gray-600">You have the right to request that we restrict the processing of your personal data, under certain conditions (e.g., we are processing your personal data under consent). You can request restriction of the use of your personal data by contacting our Customer Support Team.</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Object to use of your personal data (known as "Right to Object")</h3>
                          <p className="text-gray-600">You have the right to object to our processing of your personal data, under certain conditions (e.g., if we are Processing your Personal Data on the basis that is necessary for purposes of our or a third party's legitimate interest or in the public interest. You may also object if you believe there is no legal basis for us to Process your Personal Data anymore). You may submit an objection to the use of your personal data by contacting our Customer Support Team.</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Object to solely automated decisions (known as "Right to object to automated decision making")</h3>
                          <p className="text-gray-600">You have the right, under certain circumstances, to object to any solely automated decisions we have made which have a legal effect or similarly significant effect which does not involve human review. You can ask that a person review the decision, obtain an explanation of the decision reached after such assessment and challenge the decision by contacting our Customer Support Team. Please note that certain exceptions and limitations may apply to your right to object to automated decision-making, as permitted by applicable laws and regulations. We will provide you with clear information regarding the implications of exercising your rights and the processes involved in objecting to solely automated decision-making.</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Port your personal data (known as "Right to Data Portability")</h3>
                          <p className="text-gray-600">You have the right to request that we transfer the personal data that you have given us to another organisation, or directly to you, under certain conditions. This only applies to information you have given us. You can request for your personal data to be ported by contacting our Customer Support Team.</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Withdraw your consent</h3>
                          <p className="text-gray-600">If we process your personal data using consent as legal basis, then you have the right to withdraw your consent at any time (e.g., by unsubscribing from marketing communications or by updating your communication preferences on the Delika Platform). Withdrawing your consent won't change the legality of processing undertaken by Krontiva Africa before you withdraw your consent.</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">File a complaint</h3>
                          <p className="text-gray-600">If you have any concerns regarding the processing of your personal data, you have the right to lodge a complaint with the Ghana Data Protection Commission who is the lead supervisory authority. You may also have a right to seek a judicial remedy.</p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 mt-6">
                          <p className="text-gray-700">To exercise any of the above rights, you can contact us via the Privacy Web Form available at <a href="https://delika.app/settings" className="text-orange-600 hover:text-orange-700">https://delika.app/settings</a>. The Customer Support Team will then forward the issue internally to Krontiva's Privacy Legal Team.</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-4">
                        To exercise any of these rights, please contact us using the methods set out in Section 12 "How do you contact us?" below.
                      </p>
                    </>
                  ) : item.id === "directmarketing" ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        Please be aware that you may from time to time receive updates about special offers and promotions related to our services. We send these communications based on our legitimate interests (soft opt-in) in providing you with information about opportunities that could be beneficial to you.
                      </p>
                      <p className="text-gray-600 mb-4">
                        You have complete control over these communications, and if you decide at any time that you do not wish to receive them, you can stop them by clicking the "unsubscribe" link at the bottom of our emails, typing "STOP" for messages and SMS.
                      </p>
                      <p className="text-gray-600">
                        Additionally, we may seek your opt-in consent for specific direct marketing activities where this is required by law. For example, we might request your consent to send you information regarding third-party promotions and offers that we think might be of interest to you. We also personalize direct marketing messages using information about how you use the Delika services (for example, how often you use the Delika App).
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