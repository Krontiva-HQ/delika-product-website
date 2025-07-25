"use client";

import React, { useEffect, useRef, useState } from "react";

const toc = [
  { id: "about", label: "1. About this Privacy Notice" },
  { id: "who", label: "2. Who Does This Notice Apply To?" },
  { id: "definitions", label: "3. Key Definitions to Help You Understand This Privacy Notice" },
  { id: "dataprocess", label: "4. What personal data do we process?" },
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
  { id: "sharing", label: "5. Who do we share your personal data with?" },
  { id: "safety", label: "6. How do we keep your personal data safe?" },
  { id: "breaches", label: "7. How does Krontiva Africa handle Personal Data Breaches?" },
  { id: "retention", label: "8. How long do we retain your personal data for?" },
  { id: "retentionperiods", label: "8.1. Specific retention periods" },
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
                ) : item.id === "purposes" ? (
                  <>
                    <p className="text-gray-600 mb-4">
                      The table below sets out:
                    </p>
                    <ul className="list-disc list-inside ml-4 text-gray-600 mb-4">
                      <li>our purpose for processing your personal data;</li>
                      <li>our legal grounds (known as a 'legal basis') under data protection law, for each purpose; and</li>
                      <li>the categories of personal data we use for each purpose.</li>
                    </ul>
                    <p className="text-gray-600 mb-2">
                      Here is a general explanation of each 'legal basis' that Krontiva relies on to process your personal data to help you understand the table below:
                    </p>
                    <ul className="list-disc list-inside ml-4 text-gray-600 mb-4">
                      <li>
                        <span className="font-semibold">Performance of a Contract:</span> When it is necessary for Krontiva (or a third party) to process your personal data to provide you with the Delika services we promised you and meet our obligations under the Terms and Conditions for Clients. Where the legal basis for processing your personal data is performance of a contract, and you choose not to provide the information, you may be unable to use the Delika services.
                      </li>
                      <li>
                        <span className="font-semibold">Legitimate Interests:</span> When we process your personal data relying on legitimate interest grounds. This includes our commercial and non-commercial interests in providing an innovative, personalized and safe service to you, other Clients, and other third parties (including Delivery Partners or Restaurants). Where the table below states that we rely on legitimate interests, we have provided a brief description of the legitimate interest. If you would like more information about this, please contact us using the methods set out in Section 12 "How do you contact us?" below. In countries where legitimate interest is not an available lawful basis for Krontiva's processing activities, we will instead rely on an alternative valid legal basis.
                      </li>
                      <li>
                        <span className="font-semibold">Consent:</span> When we ask you to actively indicate your agreement to our use of your personal data for a certain purpose of which you have been informed of. ​​Where we rely on consent to process your personal data, you can withdraw your consent to such activities at any time. Withdrawal of the consent does not affect the lawfulness of any processing which took place prior to you giving your consent to us.
                      </li>
                      <li>
                        <span className="font-semibold">Compliance with Legal Obligations:</span> When we must process your personal data because it is required by a law or regulation in the markets we operate in, such as to comply with our licensing conditions and our obligations under tax and accounting laws. Where the legal basis for processing your personal data is compliance with legal obligations, and you choose not to provide the information, you may be unable to use the Delika services.
                      </li>
                      <li>
                        <span className="font-semibold">Vital Interests:</span> When we process your personal data where it is necessary to protect your vital interests or those of others, for example in the event of an emergency or an imminent threat to life.
                      </li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      The table below sets out:
                    </p>
                    <ul className="list-disc list-inside ml-4 text-gray-600 mb-4">
                      <li>our purpose for processing your personal data;</li>
                      <li>our legal grounds (known as a 'legal basis') under data protection law, for each purpose; and</li>
                      <li>the categories of personal data we use for each purpose.</li>
                    </ul>
                    <p className="text-gray-600 mb-2">
                      Here is a general explanation of each 'legal basis' that Krontiva relies on to process your personal data to help you understand the table below:
                    </p>
                    <ul className="list-disc list-inside ml-4 text-gray-600 mb-4">
                      <li>
                        <span className="font-semibold">Performance of a Contract:</span> When it is necessary for Krontiva (or a third party) to process your personal data to provide you with the Delika services we promised you and meet our obligations under the Terms and Conditions for Clients. Where the legal basis for processing your personal data is performance of a contract, and you choose not to provide the information, you may be unable to use the Delika services.
                      </li>
                      <li>
                        <span className="font-semibold">Legitimate Interests:</span> When we process your personal data relying on legitimate interest grounds. This includes our commercial and non-commercial interests in providing an innovative, personalized and safe service to you, other Clients, and other third parties (including Delivery Partners or Restaurants). Where the table below states that we rely on legitimate interests, we have provided a brief description of the legitimate interest. If you would like more information about this, please contact us using the methods set out in Section 12 "How do you contact us?" below. In countries where legitimate interest is not an available lawful basis for Krontiva's processing activities, we will instead rely on an alternative valid legal basis.
                      </li>
                      <li>
                        <span className="font-semibold">Consent:</span> When we ask you to actively indicate your agreement to our use of your personal data for a certain purpose of which you have been informed of. ​​Where we rely on consent to process your personal data, you can withdraw your consent to such activities at any time. Withdrawal of the consent does not affect the lawfulness of any processing which took place prior to you giving your consent to us.
                      </li>
                      <li>
                        <span className="font-semibold">Compliance with Legal Obligations:</span> When we must process your personal data because it is required by a law or regulation in the markets we operate in, such as to comply with our licensing conditions and our obligations under tax and accounting laws. Where the legal basis for processing your personal data is compliance with legal obligations, and you choose not to provide the information, you may be unable to use the Delika services.
                      </li>
                      <li>
                        <span className="font-semibold">Vital Interests:</span> When we process your personal data where it is necessary to protect your vital interests or those of others, for example in the event of an emergency or an imminent threat to life.
                      </li>
                    </ul>
                  </>
                ) : item.id === "provision" ? (
                  <>
                    <div className="overflow-x-auto mb-6">
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
                              <span className="font-bold">To create, update and maintain your Delika account</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              Performance of a Contract
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Device Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To authenticate your account and verify your identity</span>
                              <p className="mt-2">We collect information to verify who you say you are and in certain circumstances to verify your age and eligibility for Delika services (such as purchasing age-restricted items), when required by local law. If we ask you to verify your identity (either upon registration or <a href="#" className="text-blue-600 underline">as a result</a> of unusual activity being detected on your Delika account) and <span className="text-red-600 font-semibold">you are not able to verify</span>, the Delika ordering services will be suspended to prevent fraud until the verification process is completed. As part of the verification process, you may be asked to submit a selfie and/or ID document to prove your identity.</p>
                              <p className="mt-2">To verify your identity quickly and securely, we use facial recognition technology to confirm that your selfie shows a clear face and matches the face on your identity document. This involves processing your facial measurements. Your biometric data may be shared with trusted verification providers to confirm your identity. You can withdraw <a href="#" className="text-blue-600 underline">consent</a> at any time by contacting our Customer Support. We retain your selfie and identity document as long as you have an active user account.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Consent - Your opt-in consent will be required <a href="#" className="text-blue-600 underline">in order</a> for us to proceed with biometric verification <a href="#" className="text-blue-600 underline">checks</a>.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top"></td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To make sure the Delika App works optimally</span>
                              <p className="mt-2">We use your Profile Data to notify you of updates to the <a href="#" className="text-blue-600 underline">Delika App</a> so you can keep using the <span className="font-semibold">Delika</span> services. We also use Device Data and App Usage Data to ensure you can connect to the <a href="#" className="text-blue-600 underline">Delika Platform</a> and to help keep your account safe through authentication and verification checks.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Performance of a Contract</li>
                                <li>Consent - Your opt-in consent is required for the use of Analytics, and Third-Party Technologies Data</li>
                                <li>Legitimate Interest</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Device data</li>
                                <li>App Usage Data</li>
                                <li>Identification / Verification data</li>
                                <li>Analytics, and Third-Party Technologies Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To improve our websites and apps</span>
                              <p className="mt-2">We collect and may use your App Usage Data to improve our websites and <span className="font-semibold">Delika App</span> (including their security features and user experience).</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Legitimate Interest</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>App Usage Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To calculate prices and process payments</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Performance of a Contract</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Payment Data</li>
                                <li>Geolocation Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To administer the use of and payment for the Delika services you are offered by a Delika Business Client or another Delika account owner</span>
                              <p className="mt-2">We collect your Contact Data if you use <a href="#" className="text-blue-600 underline">Delika</a> services through your employer who is a <a href="#" className="text-blue-600 underline">Delika</a> Business Client. In addition, if an organization or another <a href="#" className="text-blue-600 underline">Delika</a> account owner has made an order for you, we will collect from them your Contact Data, Order Data and Geolocation Data.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Performance of a contract</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Contact Data</li>
                                <li>Order Data</li>
                                <li>Geolocation Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To get your feedback on your level of satisfaction with <a href='#' className='text-blue-600 underline'>Delika</a> services through surveys and interviews</span>
                              <p className="mt-2">These surveys and interviews are designed to understand your feedback on our services, to measure customer satisfaction and enable us to take actions to improve the experience. The Survey and Interview Data may be shared with research partners we use to understand your feedback.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Consent - Your opt-in consent will be required.</li>
                                <li>Legitimate Interests - It is in our interest and in the interest of our <a href='#' className='text-blue-600 underline'>Clients</a> to provide a satisfying delivery experience.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Demographic Data</li>
                                <li>Survey/Interview Data</li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "support" ? (
                  <>
                    <div className="overflow-x-auto mb-6">
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
                              <span className="font-bold">To provide customer support services and receive and process feedback</span>
                              <p className="mt-2">We process your personal data to investigate and address your queries including reported safety incidents/alleged criminal acts and complaints (including resolving disputes between Clients and restaurants and Delivery Partners). We also use the data you share to address quality issues and to improve our services.<br /><br />
                              For safety related incidents, your Suspension Data will only be reviewed by <a href="#" className="text-blue-600 underline">Krontiva's</a> Customer Support and/or Safety Teams when investigating a safety/criminal incident on the <a href="#" className="text-blue-600 underline">Delika</a> Platform involving you. The teams will also review the circumstances surrounding potential safety incidents. We may use automated processes for complaint resolution purposes via our automated chat function. For further information regarding how to object to the above activities, please see Section 9 "What are your rights?" <a href="#" className="text-blue-600 underline">below</a>.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Performance of a Contract</li>
                                <li>Legitimate Interests - It is in our interest and in the interest of our <a href='#' className='text-blue-600 underline'>Clients</a> to support them throughout their use of the Delika Platform and continuously improve and develop the customer support we provide. In addition, it is in our interest and interest of our Clients and Delivery Partners to address threats and abuse and promote safety, integrity and security on the Delika Platform to ensure our services are used in accordance with the Terms and Conditions for Clients</li>
                                <li>Compliance with Legal Obligations - We process personal data to comply with our legal obligation to cooperate with law enforcement when there is a safety incident.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Order Data</li>
                                <li>Communication Data</li>
                                <li>User Generated Data</li>
                                <li>Suspension Data</li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "security" ? (
                  <>
                    <div className="overflow-x-auto mb-6">
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
                              <span className="font-bold">To prevent, detect and investigate fraudulent accounts, fraudulent payments or other unlawful use of the <a href='#' className='text-blue-600 underline'>Delika</a> Platform and apply suspensions and blocks as needed</span>
                              <p className="mt-2">Our automated anti-fraud system will identify fraudulent accounts, payments, abuse of <a href='#' className='text-blue-600 underline'>Delika's</a> services and other malicious activity on the <a href='#' className='text-blue-600 underline'>Delika</a> Platform, like, for example, when you top up your balance, request multiple refunds or go through authentication processes. To enable us to investigate, a temporary suspension may be applied to a <a href='#' className='text-blue-600 underline'>Delika</a> account. While the <a href='#' className='text-blue-600 underline'>Delika</a> Platform may use automated processes for fraud detection purposes, decisions to block a <a href='#' className='text-blue-600 underline'>Client</a> are taken following human review by our staff, and no account is blocked automatically without first undergoing a verification process. For further information regarding how to object to the above activities, please see Section 9 "What are your rights?" <a href='#' className='text-blue-600 underline'>below</a>.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Legitimate Interests - It is in our interest and in the interests of our <a href='#' className='text-blue-600 underline'>Clients</a> to detect, prevent and address fraud, unauthorized use of <a href='#' className='text-blue-600 underline'>Delika</a> accounts or other harmful or illegal activity and maintain the safety and security of our systems, by responding to suspected or actual criminal acts. It is also in our interest and in the interests of our <a href='#' className='text-blue-600 underline'>Clients</a> to prevent and address violations of our Terms and Conditions.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Identification / Verification Data</li>
                                <li>Device Data</li>
                                <li>Geolocation Data</li>
                                <li>App Usage Data</li>
                                <li>Payment Data</li>
                                <li>Communication Data</li>
                                <li>Order Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To issue temporary suspensions</span>
                              <p className="mt-2"> <a href="#" className="text-blue-600 underline">In order to</a> provide a safe and reliable marketplace, we monitor Clients' compliance with our Terms and Conditions for Clients and use App Usage Data to temporarily suspend access to any of the Delika Platforms:</p>
                              <ul className="list-disc ml-6 mt-2">
                                <li>If the Client causes any abuse or harm to the <a href="#" className="text-blue-600 underline">Delika</a> Platform,</li>
                                <li>If Krontiva has reasonable belief of fraudulent acts by the Client when using the <a href="#" className="text-blue-600 underline">Delika</a> Platform,</li>
                                <li>If the Client otherwise fails to comply with his/her obligations under the General Terms, or</li>
                                <li>If the Client creates any safety concerns or risks to the Delivery Partners.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Performance of a Contract</li>
                                <li>Legitimate interests - It is in our interest and in the interests of our Clients and Delivery Partners to ensure a reliable and trustworthy service and Platform sustainability. It is also in our interest to ensure and to <a href="#" className="text-blue-600 underline">enforce</a> our services are used in accordance with the Terms and Conditions for Clients.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Suspension Data</li>
                                <li>App Usage Data</li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "marketing" ? (
                  <>
                    <div className="overflow-x-auto mb-6">
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
                              <span className="font-bold">To market and advertise <a href='#' className='text-blue-600 underline'>Delika</a> services and those of partners according to your preferences and measure the effectiveness of ads</span>
                              <p className="mt-2">This includes using your personal data to send you targeted emails, text messages (including WhatsApp messages), push notifications, in-app messages and other communications marketing <a href='#' className='text-blue-600 underline'>Krontiva's</a> and its partners' products, services, features, offers, promotions, sweepstakes, news and events that could be of interest.</p>
                              <p className="mt-2">It also includes using your App Usage Data like order history, Device Data and Geolocation Data to show you targeted or personalized advertisements or.</p>
                              <p className="mt-2">...personalized recommendations through the <a href='#' className='text-blue-600 underline'>Delika</a> services. For example, we may display ads for restaurants or stores that are available on the <a href='#' className='text-blue-600 underline'>Delika</a> Platform. We may also display ads on the <a href='#' className='text-blue-600 underline'>Delika</a> App based on observed or inferred data such as location, interests and behaviors and ads for third party products that are not available on our Apps.</p>
                              <p className="mt-2">We will further display personalized ads about our products on third-<a href='#' className='text-blue-600 underline'>party</a> apps and collect data about your visits and actions on these third-party apps or websites.</p>
                              <p className="mt-2">We will use pixels and similar technologies to track which emails were opened and which links were clicked by you, to help us measure the results of our campaigns and we will also use data to measure the effectiveness of our ads, and of third parties' displayed in the Delika Platform or in connection with <a href='#' className='text-blue-600 underline'>Delika's</a> services.</p>
                              <p className="mt-2">In addition, we will <a href='#' className='text-blue-600 underline'>analyse</a>, aggregate your App Usage Data and provide it to you in a <a href='#' className='text-blue-600 underline'>summarised</a> way each year for the wrap-up marketing campaign connected to the End of Year campaign.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Legitimate Interests - It is in our interest and in the interest of our <a href='#' className='text-blue-600 underline'>Clients</a> to inform them about our services and features or those offered by Krontiva partners. It is also in our interest to promote and advertise our services, including engaging in contextual (non-data driven) and personalized advertising, analytics, and measurement of ad performance, <a href='#' className='text-blue-600 underline'>in order to</a> expand our user base by deepening relationships with existing Clients and developing new ones. You can opt out of these communications at any time by clicking the 'unsubscribe' link at the bottom of our emails, typing "STOP" for messages and SMS, or updating your preferences.</li>
                                <li>Consent - Your opt-in consent will be required for example, when the law requires consent for email marketing and for certain tracking technologies.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Contact Data</li>
                                <li>Profile Data</li>
                                <li>Order Data</li>
                                <li>App Usage Data</li>
                                <li>Device Data</li>
                                <li>Geolocation Data</li>
                                <li>Analytics, and Third-Party Technologies Data</li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "servicecomms" ? (
                  <>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of <a href='#' className='text-blue-600 underline'>Personal Data</a></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To communicate with you, including sending you service-related communications and to keep you informed</span>
                              <p className="mt-2">Your name, phone number and email address will be used to communicate with you to send you order confirmation emails and receipts, to provide you with delivery updates, to let you know that your order has been completed, and to inform you about important service updates.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Performance of a Contract</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Contact Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top" colSpan={3}>
                              For guest users, if you share your email address, we will use it just to send you a cost summary
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "research" ? (
                  <>
                    <div className="overflow-x-auto mb-6">
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
                              <span className="font-bold">To perform research, testing, and analytics to better understand and improve our business and services</span>
                              <p className="mt-2">For example, we use Geolocation Data, Order Data, Communication Data and App Usage Data to conduct research to develop or improve our products, services, technology, algorithms, machine learning, and other modelling.<br />We use Communication Data related to incidents to monitor our security practices and improve our operations and processes.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Legitimate Interests - It is in our interest to measure the use of our services <a href='#' className='text-blue-600 underline'>in order to</a> inform business decisions and to enable <a href='#' className='text-blue-600 underline'>provision</a> of accurate and reliable reporting and to continuously improve and develop the services we provide.</li>
                                <li>Consent - For certain analytics we may require your consent. If so, you'll be prompted to provide consent for specific purposes and processing activities, with details on how to withdraw consent, including through your profile settings.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Geolocation Data</li>
                                <li>Order Data</li>
                                <li>App Usage Data</li>
                                <li>Communication Data</li>
                                <li>User Generated Content</li>
                                <li>Device Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To develop new products, features, partnerships and services</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Legitimate Interests - It is in our interest and in the interest of our <a href='#' className='text-blue-600 underline'>Clients</a> to develop and adopt new features to improve the <a href='#' className='text-blue-600 underline'>Delika</a> Platform.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Geolocation Data</li>
                                <li>App Usage Data</li>
                                <li>Communication Data</li>
                                <li>User Generated Content</li>
                                <li>Device Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To prevent, find, and resolve software or hardware bugs and issues</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Legitimate Interests - It is in our interest and in the interest of our <a href='#' className='text-blue-600 underline'>Clients</a> to provide a <a href='#' className='text-blue-600 underline'>hassle free</a> and reliable service.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Geolocation Data</li>
                                <li>User Generated Content</li>
                                <li>Communication Data</li>
                                <li>Device Data</li>
                                <li>App Usage Data</li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "legal" ? (
                  <>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Purpose of processing</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Legal Basis</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Categories of <a href='#' className='text-blue-600 underline'>Personal_Data</a></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To investigate and respond to claims and disputes relating to the use of <a href='#' className='text-blue-600 underline'>Delika</a> services, and/or necessary for compliance with</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Compliance with Legal Obligations - We process personal data to comply with an obligation, when</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>All Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To comply with applicable legal requirements or with requests from government/law enforcement bodies</span>
                              <p className="mt-2">Depending on the claim, All Data may be processed for establishing, exercising or <a href='#' className='text-blue-600 underline'>defence</a> of legal claims, including:</p>
                              <ul className="list-disc ml-6 mt-2">
                                <li>supporting our own internal investigations;</li>
                                <li>the assignment of claims and the use of debt collecting agencies; and</li>
                                <li>the use of legal advisors.</li>
                              </ul>
                              <p className="mt-2">In some circumstances, we are legally obliged to share information with external recipients. For example, under a Court Order or where we cooperate with a data protection supervisory authority in handling complaints or investigations. We also respond to requests, such as those from law enforcement agencies, when the response is required by law or <a href='#' className='text-blue-600 underline'>furthers</a> a public interest task such as <a href='#' className='text-blue-600 underline'>an emergency situation</a> or where someone's life is at risk. We will take steps to ensure that we have a lawful basis on which to share the information, and we'll make sure that we document our decision.</p>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Compliance with Legal Obligations - We process personal data to comply with legal obligations, including when there is a request from a regulator, law enforcement or other governmental body.</li>
                                <li>Legitimate Interests - In the context of litigation or other disputes, it is in our interest to protect our interests and rights, our <a href='#' className='text-blue-600 underline'>Clients</a> or others, including as part of investigations, regulatory inquiries or litigation.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top"></td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To fulfill our tax obligations and comply with tax legislation</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Compliance with a Legal Obligation</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Profile Data</li>
                                <li>Payment Data</li>
                                <li>App Usage Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To reorganize or make changes to our business</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Legitimate Interests - It is in our interest to process personal data for organizational and business planning purposes.</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>All Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To ensure the security of the <a href='#' className='text-blue-600 underline'>Delika</a> services (including the <a href='#' className='text-blue-600 underline'>Delika</a> Web Platform and <a href='#' className='text-blue-600 underline'>Delika</a> App)</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Legitimate Interests - It is in our interest and in the interest of our <a href='#' className='text-blue-600 underline'>Clients</a> to protect, guard and maintain</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>All Data</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <span className="font-bold">To investigate and respond to claims and disputes relating to the use of <a href='#' className='text-blue-600 underline'>Delika</a> services, and/or necessary for compliance with</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>Compliance with Legal Obligations - We process personal data to comply with an obligation, when</li>
                              </ul>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              <ul className="list-disc ml-4">
                                <li>All Data</li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "sharing" ? (
                  <>
                    <p className="mb-4">We may share your personal data with the following categories of recipients.</p>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category of Recipients</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Restaurants and stores</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              Your personal data is only disclosed to <a href='#' className='text-blue-600 underline'>the restaurants</a> and stores when you place an order on the <a href='#' className='text-blue-600 underline'>Delika</a> Platform.<br /><br />
                              In such a case, the restaurant or store will see:
                              <ul className="list-disc ml-6 mt-2">
                                <li>Your first name and last name</li>
                                <li>Contact phone number</li>
                                <li>Your delivery address (in case the restaurant or store uses their own delivery method and do not leverage Delivery Partners partnering with <a href='#' className='text-blue-600 underline'>Delika</a>)</li>
                                <li>Order Data, together with any information submitted by you together with Order Data (for example information about food preference, cooking preferences, information about any allergies if such information is disclosed by you <a href='#' className='text-blue-600 underline'>in the course of</a> submitting the order)</li>
                                <li>Once the order is completed and to the extent you leave feedback on the restaurant or store, we share it with the restaurant or store</li>
                                <li>After fulfilling the order, your first name and the <a href='#' className='text-blue-600 underline'>telephone</a> number will remain visible to the <a href='#' className='text-blue-600 underline'>Partner</a> such as restaurants or stores for 24-48 hours. This is necessary to resolve any issues with you regarding your order, such as issuing an electronic receipt for your order, or contacting you about availability of items you ordered.</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top"></td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              Clients may also opt-in to share their contact and order details with a specific restaurant or store to receive marketing communications from such restaurant or store.<br />
                              To the extent you use Dine-in service as the registered user, your personal data will be shared with the restaurant such as your table number and ID, your order details, your status of payment and any feedback you submit to rate the food and service
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Delivery Partners</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              Your delivery address, first name and the letter of the last name and contact phone number (to the extent the Delivery Partner reaches out to you using the <a href='#' className='text-blue-600 underline'>Delika</a> button "Call" during the active order) will be shared for the order delivery with the Delivery Partner.<br />
                              After fulfilling the order, your first name and <a href='#' className='text-blue-600 underline'>the telephone number is not</a> visible to the Delivery Partner.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Promotional, marketing and strategic partners</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We may share limited data like your email address with our promotional, marketing and strategic partners so that they can inform you about promotional events and provide you with information and marketing messages about products or services that may interest you.<br />
                              In addition, we may share your personal data with marketing platform providers, including social media advertising services, advertising networks, third-party data providers, to reach or better understand our users and measure the effectiveness of our ads on other platforms and with social media platforms, including <a href='#' className='text-blue-600 underline'>Facebook</a> and <a href='#' className='text-blue-600 underline'>Google</a>, for sign-in purposes.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Third-party service providers</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              Our third-party vendors and other service providers and contractors have access to your personal data to help carry out the services they are performing for us or on behalf of <a href='#' className='text-blue-600 underline'>us</a>. This may include vendors and providers who provide email or moreover electronic communication services, tax, legal and accounting services, product fulfilment, identity/verification processes, payment processing, customer support, fraud prevention and detection, data enhancement, web hosting and cloud storage, research, including surveys, analytics, crash reporting, performance monitoring and artificial intelligence, machine learning and statistical services. In addition, we will share data like your geolocation with Google in connection with the use of Google maps in our apps.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Other third parties</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              In the event of a likely change of control of the business (or a part of the business) such as negotiations for a sale, an actual sell, a merger, and acquisition, or any transaction, or reorganization, we may share your personal data with interested parties, including as part of any due diligence process with new or prospective business owners and their respective professional advisers. We may also need to transfer your personal data to that third party or re-organized entity after the sale or reorganization for them to use for the same purposes as set out in this Notice.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Law Enforcement</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">
                              We may disclose information under a court order or where we cooperate with a data protection supervisory authority in handling complaints or investigations. For example, we may also share your personal data with law enforcement or other public authorities, including responding to requests when the information is required by law or <a href='#' className='text-blue-600 underline'>furthers</a> a public interest task. In any scenario, we will take steps to ensure that we have a lawful basis on which to share the information, and we'll make sure that we document our decision.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4 text-gray-700">
                      Please <a href='#' className='text-blue-600 underline'>note</a>, that our websites and apps may contain links to other third-party websites. If you follow a link to any of those third-party websites, please be aware that those websites may have their own privacy notices and that we do not accept any responsibility or liability for their notices or their processing of your personal data. Please check these notices before you submit any personal data to <a href='#' className='text-blue-600 underline'>such</a> third-party websites.
                    </p>
                  </>
                ) : item.id === "safety" ? (
                  <>
                    <p className="mb-4">
                      The security of your personal data is very important to us, and we have implemented appropriate technical and organizational controls to protect your personal data against unauthorized processing and against accidental loss, <a href='#' className='text-blue-600 underline'>damage</a> or destruction. We have implemented data encryption in transit and at rest, data privacy and security training, information security policies and controls around the confidentiality, integrity and availability of our data/systems.
                    </p>
                    <p className="mb-4">
                      Any personal data collected in the course of providing Delika's services is transferred to and stored in our data centers which are in the cloud. Only authorized employees of Krontiva Africa LTD and partners have access to the personal <a href='#' className='text-blue-600 underline'>data</a> and they may access the data only for the purpose of resolving issues associated with the use of the services (including disputes regarding delivery services and customer support services).
                    </p>
                    <p className="mb-4">
                      For our research and scientific purposes, all data, like bulk Geolocation Data, is anonymized so you can never be identified from it. Regarding anonymized data, we will not attempt to re-identify your personal data that has been de-identified, <a href='#' className='text-blue-600 underline'>in the course of</a> sharing your data with other organizations.
                    </p>
                    <p className="mb-4">
                      You are responsible though for choosing a secure password when we ask you to set up a password to access parts of our sites or apps. You should keep this password <a href='#' className='text-blue-600 underline'>confidential</a> and you should choose a password that you do not use on any other site.
                    </p>
                  </>
                ) : item.id === "breaches" ? (
                  <>
                    <p className="mb-4">
                      If Krontiva becomes aware of or reasonably suspects a Personal Data Breach has occurred or that the integrity or confidentiality of Personal Data has been compromised, Krontiva will activate its incident management Policies, Procedures and supporting actions governing the handling and reporting of Personal Data Breaches.
                    </p>
                  </>
                ) : item.id === "retention" ? (
                  <>
                    <p className="mb-4">
                      We keep your personal data only as long as necessary to provide you with our services and for the purposes described above in Section 4 "What purposes do we use your personal data for and what is our legal basis for processing?".
                    </p>
                    <p className="mb-4">
                      This means that the retention periods will vary according to the type, the amount and sensitivity of your personal data, the potential risk of harm from <a href='#' className='text-blue-600 underline'>unauthorised</a> use or disclosure of your personal data and the reason that we have collected the personal data in the first place.
                    </p>
                    <p className="mb-4 font-bold">
                      Here are the key criteria we use for determining our retention periods:
                    </p>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Retention Periods Criteria</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Personal data retained until you remove/delete it</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">It's your right to request that we delete certain of your personal data. See Section 9 "What are your rights?" below for more information</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Personal data that expires after a specific <a href='#' className='text-blue-600 underline'>period of time</a></td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">We have set certain retention periods so that some data is not retained after a specific <a href='#' className='text-blue-600 underline'>period of time</a>. See <a href='#' className='text-blue-600 underline'>table</a> below for further details.<br /><br />After a retention period has lapsed, the personal data is securely deleted, unless it is necessary for the establishment, exercise or <a href='#' className='text-blue-600 underline'>defence</a> of legal claims.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Personal data retained until your <a href='#' className='text-blue-600 underline'>Delika</a> Account is deleted</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">We <a href='#' className='text-blue-600 underline'>keep</a> your data until your <a href='#' className='text-blue-600 underline'>Delika</a> account is deleted unless further retention of certain personal data is required for the purposes described in the second table below.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : item.id === "rights" ? (
                  <>
                    <p className="mb-4">As a data subject you have following rights:</p>
                    <ul className="list-disc list-inside ml-4 text-gray-600 mb-4">
                      <li>
                        <a href="#" className="font-bold text-blue-600 underline">Access your personal data (known as "Right of Access"):</a> You have the right to access and to request copies of your personal data by contacting our Customer Support Team.
                      </li>
                      <li>
                        <a href="#" className="font-bold text-blue-600 underline">Update/correct your personal data (known as "Right of Rectification"):</a> You have the right to request us to correct personal data that is inaccurate or incomplete. You can change and correct certain personal data yourself within the Delika Platform or by contacting our Customer Support Team.
                      </li>
                      <li>
                        <a href="#" className="font-bold text-blue-600 underline">Delete your personal data (known as "Right of Erasure"):</a> You have the right to request that we erase your personal data, under certain conditions (e.g., we are processing your personal data <a href="#" className="text-blue-600 underline">under consent</a>). Personal data that is processed pursuant to a legal obligation or where we have an overriding legitimate interest may not be deleted upon request. You can request <a href="#" className="text-blue-600 underline">erasure</a> of your personal data by contacting our Customer Support Team.
                      </li>
                      <li>
                        <a href="#" className="font-bold text-blue-600 underline">Restrict use of your personal data (known as "Right to Restrict Processing"):</a> You have the right to request that we restrict the processing of your personal data, under certain conditions (e.g., we are processing your personal data <a href="#" className="text-blue-600 underline">under consent</a>). You can request <a href="#" className="text-blue-600 underline">restriction</a> of the use of your personal data by contacting our Customer Support Team.
                      </li>
                    </ul>
                    <ul className="list-disc list-inside ml-4 text-gray-600 mb-4">
                      <li>
                        <a href="#" className="font-bold text-blue-600 underline">Object to solely automated decisions being made about you which has legal or similarly significant effect on you (known as "Right to object to automated decision making")</a> - You have the right, under certain circumstances, to object to any solely automated decisions we have made which have a legal effect or similarly significant effect which does not involve human review. You can ask that a person review the decision, obtain an explanation of the decision reached after such assessment and challenge the decision by contacting our Customer Support Team. Please note that certain exceptions and limitations may apply to your right to object to automated decision-making, as permitted by applicable laws and regulations. We will provide you with clear information regarding the implications of exercising your rights and the processes involved in objecting to solely automated decision-making.
                      </li>
                      <li>
                        <a href="#" className="font-bold text-blue-600 underline">Port your personal data (known as "Right to Data Portability"):</a> You have the right to request that we transfer the personal data that you have given us to another <a href="#" className="text-blue-600 underline">organisation</a>, or directly to you, under certain conditions. This only applies to <a href="#" className="text-blue-600 underline">information</a> you have given us. You can <a href="#" className="text-blue-600 underline">request</a> for your personal data to be ported by contacting our Customer Support Team.
                      </li>
                      <li>
                        <a href="#" className="font-bold text-blue-600 underline">Withdraw your consent:</a> If we process your personal data using consent as legal basis, then you have the right to withdraw your consent at any time (e.g., by unsubscribing from marketing communications or by updating your communication preferences on the Delika Platform). Withdrawing your consent won't change the legality of <a href="#" className="text-blue-600 underline">processing</a> undertaken by Krontiva Africa before you withdraw your consent.
                      </li>
                      <li>
                        <a href="#" className="font-bold text-blue-600 underline">File a complaint:</a> If you have any concerns regarding the processing of your personal data, you have the right to lodge a complaint with the Ghana Data Protection Commission who is the lead supervisory authority. You may also have a right to seek a judicial remedy.
                      </li>
                    </ul>
                    <p className="mb-4">
                      To exercise any of the above rights, you can contact us via the Privacy Web Form available at <a href="https://bolt.eu/en/privacy/data-subject/" className="text-blue-600 underline">https://bolt.eu/en/privacy/data-subject/</a>; the Customer Support Team will then forward the issue internally to <a href="#" className="text-blue-600 underline">Krontiva's</a> Privacy Legal Team.
                    </p>
                  </>
                ) : item.id === "directmarketing" ? (
                  <>
                    <p className="mb-4">Please be aware that you may from time to time receive updates about special offers and promotions related to our services. We send these communications based on our legitimate interests (soft opt-in) in providing you with information about opportunities that could be beneficial to you.</p>
                    <p className="mb-4">You have complete control over these communications, and if you decide at any time that you do not wish to receive them, you can stop them by clicking the "unsubscribe" link at the bottom of our emails, typing "STOP" for messages and SMS.</p>
                    <p className="mb-4">Additionally, we may seek your opt-in consent for specific direct marketing activities where this is required by law. For example, we might request your consent to send you information regarding third-party promotions and offers that we think might be of interest to you. We also personalize direct marketing messages using information about how you use the Delika services (for example, how often you use the Delika App).</p>
                  </>
                ) : item.id === "changes" ? (
                  <>
                    <p className="mb-4">We may make changes to this Notice from time to time. If we make significant changes, we will notify you (as required) via the Delika App, <a href="#" className="text-blue-600 underline">website</a> or via another method such as email.</p>
                  </>
                ) : item.id === "contact" ? (
                  <>
                    <p className="mb-2">For questions or privacy concerns, please contact:</p>
                    <p className="mb-1">Privacy Officer<br />Krontiva Africa Ltd<br />Email: <a href="mailto:info@krontiva.africa" className="text-blue-600 underline">info@krontiva.africa</a></p>
                    <p className="mb-4">Address:<br />The Octagon<br />Floor 7<br />Independence Avenue - Barnes Rd<br />Accra Central</p>
                    <p>Thank you for trusting Delika with your personal information. We are committed to protecting your privacy and ensuring transparency in how we handle your data.</p>
                  </>
                ) : item.id === "retentionperiods" ? (
                  <>
                    <p className="mb-4 font-bold">
                      8.1 We have listed below the specific retention periods that apply to the personal data we process about you:
                    </p>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Category of Retention Periods</th>
                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-300">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Tax, accounting and financial reporting purposes</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">We retain your financial data for up to 5 years after the last order if your personal data is necessary for tax, <a href='#' className='text-blue-600 underline'>accounting</a> and financial reporting purposes.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Provision of services purposes</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">We retain your data as long as you have an active account. If your account is deleted, personal data will be deleted (according to our retention schedule and rules), unless such data is still required to meet any legal obligation, or for accounting, dispute resolution or fraud prevention purposes.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top"></td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">You may request deletion of your account at any time through the Krontiva Website. See Section 9 "What are your rights?" <a href='#' className='text-blue-600 underline'>below</a> for more information.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Formal investigations of a criminal offence, fraud or false information</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">We retain data for as long as necessary for the purposes of investigating and detecting fraudulent, criminal or unlawful activities, or false <a href='#' className='text-blue-600 underline'>information</a> having been provided.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Disputes</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">We retain data for the purpose of exercising or defending legal claims, including supporting our own internal investigations, including claims related to the unlawful processing or collection of user's <a href='#' className='text-blue-600 underline'>consent</a> until the claim is satisfied or the expiry date of such claims.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Instant Messages</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">We retain data about instant messages between you and the Customer Support Team directly in the Delika App for 60 days from the last communication and in <a href='#' className='text-blue-600 underline'>Krontiva's</a> databases for 3 years from the last communication.<br />Instant messages between Clients and Delivery Partners are kept in the Delika App only until the order is completed and for 30 days after in our systems.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">Customer Support</td>
                            <td className="px-4 py-3 border-b border-gray-200 align-top">We retain data in relation to support tickets submitted via instant messages, phone calls, web forms, and emails for 3 years from the last communication.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4 text-gray-700">
                      Please note that the deinstallation of Delika App <a href='#' className='text-blue-600 underline'>in</a> your device does not cause the deletion of your personal data. See Section 9 "What are your rights?" to exercise your Right of Erasure.
                    </p>
                  </>
                ) : (
                  <></>
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