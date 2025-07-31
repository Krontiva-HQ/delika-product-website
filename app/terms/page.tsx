"use client";

import { FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              TERMS OF USE
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AGREEMENT TO OUR LEGAL TERMS</h2>
                <p className="text-gray-600 mb-4">
                  We are Krontiva Africa Ltd ("Company," "we," "us," or "our"), a company registered in Ghana with our address at Floor 7, The Octagon, Independence Avenue, Barnes Rd, Accra-Ghana.
                </p>
                <p className="text-gray-600 mb-4">
                  We operate the platform Delika (the "Platform"), as well as any other related products and services, including mobile applications, websites, software, hardware, and other products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
                </p>
                <p className="text-gray-600 mb-4">
                  Delika provides a technology platform for restaurants (and, in the future, individual customers) to manage and streamline delivery services. We leverage a proprietary in-house software system exclusively owned by Krontiva Africa Ltd to connect businesses with delivery riders and enable smooth delivery operations. Perjuma Ghana supplies outsourced riders and delivery bikes under a partnership agreement.
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Delika Account</strong> is the account you open or sign-in on delika to use the Services and we reserve the right to suspend or terminate your Account by reason of inaccurate, untrue, or incomplete information, or failure to comply with the account registration requirements.
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Delika Audit Log</strong> is a summary of account usage activities which may include transactions and statements on your account.
                </p>
                <p className="text-gray-600 mb-4">
                  The purpose of this document is to clearly outline the terms and conditions governing your use of Delika. This includes your rights and responsibilities as a user, the scope of services provided, and the legal guidelines that must be followed while using Delika. Users can expect comprehensive information on how to interact with the platform and by understanding these terms, you can expect a transparent and secure experience while using our platform.
                </p>
                <p className="text-gray-600 mb-4">
                  These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("you" or "User") and Krontiva Africa Ltd, governing your use of Delika. By accessing or using the Platform, you agree that you have read, understood, and consented to these Terms, including any supplemental agreements or third-party terms referenced herein, such as those of Perjuma Ghana.
                </p>
                <p className="text-gray-600 mb-4 font-bold">
                  IF YOU DO NOT AGREE WITH THESE TERMS, YOU MUST IMMEDIATELY DISCONTINUE USING THE PLATFORM.
                </p>
                <p className="text-gray-600 mb-4">
                  Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. These include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Data Protection and Privacy Policies: Detailing how we collect, use, and protect user data.</li>
                  <li>User Guidelines: Outlining acceptable use and conduct while using the Services.</li>
                  <li>Service Level Agreements (SLAs): Defining our commitments regarding service availability and performance.</li>
                  <li>Refund Policy: Explaining the conditions under which refunds are processed.</li>
                  <li>Consumer Protection Policy: Explaining the rights and interests of customers who use our services.</li>
                </ul>
                <p className="text-gray-600 mb-4">
                  We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms from time to time. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.
                </p>
                <p className="text-gray-600 mb-4">
                  You must be at least 18 years old to use our Services (or the greater age required in your country or territory for you to be authorized to register for and use our Services without parental approval). All users who are minors, as defined by applicable law in their jurisdiction, must have the permission of and be directly supervised by their parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms prior to using the Services.
                </p>
                <p className="text-gray-600 mb-8">
                  We recommend that you print a copy of these Legal Terms for your records.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">TABLE OF CONTENTS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p>1. OUR SERVICES</p>
                    <p>2. INTELLECTUAL PROPERTY RIGHTS</p>
                    <p>3. USER REPRESENTATIONS</p>
                    <p>4. REGISTRATION AND ACCOUNT SECURITY</p>
                    <p>5. THIRD-PARTY WEBSITES, CONTENT AND PARTNERSHIPS</p>
                    <p>6. PAYMENTS AND FEES</p>
                    <p>7. SOFTWARE</p>
                    <p>8. PROHIBITED ACTIVITIES</p>
                    <p>9. DATA PRIVACY AND SECURITY</p>
                    <p>10. MOBILE APPLICATION LICENSE</p>
                    <p>11. SERVICES AND PLATFORM MANAGEMENT</p>
                    <p>12. COPYRIGHT INFRINGEMENTS</p>
                  </div>
                  <div className="space-y-1">
                    <p>13. DISCLAIMERS</p>
                    <p>14. LIMITATIONS OF LIABILITY</p>
                    <p>15. MODIFICATIONS AND INTERRUPTIONS</p>
                    <p>16. INDEMNIFICATION</p>
                    <p>17. GOVERNING LAW</p>
                    <p>18. DISPUTE RESOLUTION</p>
                    <p>19. TERMINATION</p>
                    <p>20. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</p>
                    <p>21. CONTACT US</p>
                  </div>
                </div>
              </div>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. OUR SERVICES</h2>
                <div className="text-gray-600 space-y-4">
                  <p>
                    Delika is an advanced technology platform developed to streamline delivery operations for restaurants and, in the future, individual customers. Designed to offer quick and efficient delivery services, Delika enables restaurants to manage orders, inventory, and deliveries seamlessly. Restaurants can use the platform for real-time rider tracking, customer order updates, inventory management to monitor stock levels, and comprehensive analytics to track sales and inventory trends. For riders, Delika provides a structured order management system, allowing them to view, accept, and organize deliveries based on location and time. The platform optimizes delivery routes using GPS and offers performance analytics to track rider earnings and working hours. With its seamless integration, data-driven insights, and scalable capabilities, Delika ensures restaurants and riders can deliver exceptional service while enhancing operational efficiency.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. INTELLECTUAL PROPERTY RIGHTS</h2>
                <div className="text-gray-600 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Our intellectual property</h3>
                    <p>
                      We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
                    </p>
                    <p>
                      Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties in Ghana.
                    </p>
                    <p>
                      The Content and Marks are provided in or through the Services "AS IS" for your internal business purpose only.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Your use of our Services</h3>
                    <p>
                      Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>access the Services; and</li>
                      <li>download or print a copy of any portion of the Content to which you have properly gained access, solely for your internal business purpose.</li>
                    </ul>
                    <p>
                      Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any purpose whatsoever, without our express prior written permission.
                    </p>
                    <p>
                      If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: support@krontiva.africa. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.
                    </p>
                    <p>
                      We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Breach of Intellectual Property Rights and Consequences</h3>
                    <p>Any unauthorized use, reproduction, distribution, or exploitation of our Services, Content, or Marks that violates these Legal Terms will constitute a breach of our intellectual property rights. Such actions may include, but are not limited to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Copying, reproducing, or distributing any part of our Services, Content, or Marks without our express prior written permission.</li>
                      <li>Using our Content, Marks, or Services for any purpose other than your internal business purposes as permitted under the granted license.</li>
                      <li>Failing to properly attribute us as the owners or licensors when reproducing or publicly displaying any part of our Services, Content, or Marks with granted permission.</li>
                    </ul>
                    <p><strong>Consequences of Breach:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Immediate Termination of Access:</strong> Upon any breach of these intellectual property rights, your right to access and use our Services will be immediately terminated without notice.</li>
                      <li><strong>Legal Action:</strong> We reserve the right to pursue any and all legal remedies available under applicable law, including but not limited to seeking injunctive relief, damages, and attorney's fees, to protect and enforce our intellectual property rights.</li>
                      <li><strong>Account Suspension or Deactivation:</strong> In addition to the immediate termination of access, we may also suspend or deactivate your account and restrict further access to our Services.</li>
                      <li><strong>Reporting to Authorities:</strong> In cases where the breach involves illegal activities, we may report the incident to the appropriate authorities for further action.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. USER REPRESENTATIONS</h2>
                <div className="text-gray-600 space-y-4">
                  <p>By using Delika, you represent and warrant that:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>all registration information you submit will be true, accurate, current, and complete;</li>
                    <li>you will maintain the accuracy of such information and promptly update such registration information as necessary;</li>
                    <li>you have the legal capacity and you agree to comply with these Legal Terms;</li>
                    <li>you are not under the age of 18;</li>
                    <li>you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Services;</li>
                    <li>you will not access the Services through automated or non-human means, whether through a bot, script, or otherwise;</li>
                    <li>you will not use the Services for any illegal or unauthorized purpose; and</li>
                    <li>your use of the Services will not violate any applicable law or regulation.</li>
                  </ul>
                  <p>If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. USER REGISTRATION AND ACCOUNT SECURITY</h2>
                <div className="text-gray-600 space-y-4">
                  <p>Users must register for an account to access Delika's services. By registering, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Keep your credentials secure and confidential.</li>
                    <li>Notify us immediately of unauthorized account access.</li>
                    <li>Krontiva reserves the right to suspend remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable and for any suspicious activity.</li>
                    <li>We have implemented robust technical and organizational measures to protect your personal information from accidental loss, unauthorized access, misuse, alteration, or disclosure. While these measures are designed to provide maximum security, we cannot fully guarantee that unauthorized third parties will never circumvent them or misuse your personal information. By using our services, you acknowledge that providing personal information is at your own risk.</li>
                    <li>You are responsible for maintaining the confidentiality of your password and restricting access to the platform through your mobile device or computer. Any unauthorized use of your password or account, or any breach of security, must be reported to us immediately.</li>
                    <li>In the event of a dispute over account ownership between two or more parties, Delika reserves the right to act as the sole arbiter of such disputes at its discretion. This may include suspending or terminating the account in question. Our decision will be final and binding.</li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. THIRD-PARTY WEBSITES, CONTENT AND PARTNERSHIPS</h2>
                <div className="text-gray-600 space-y-4">
                  <p>
                    The Services may contain (or you may be sent via the SMS, Platform or App,) links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content"). Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third- Party Websites accessed through the Services or any Third-Party Content posted on, available through, or installed from the Services, including the content, accuracy, offensiveness, opinions, reliability, privacy practices, or other policies of or contained in the Third-Party Websites or the Third-Party Content. Inclusion of, linking to, or permitting the use or installation of any Third-Party Websites or any Third-Party Content does not imply approval or endorsement thereof by us. If you decide to leave the Services and access the Third-Party Websites or to use or install any Third-Party Content, you do so at your own risk, and you should be aware these Legal Terms no longer govern. You should review the applicable terms and policies, including privacy and data gathering practices, of any website to which you navigate from the Services or relating to any applications you use or install from the Services. Any purchases you make through Third-Party Websites will be through other websites and from other companies, and we take no responsibility whatsoever in relation to such purchases which are exclusively between you and the applicable third party. You agree and acknowledge that we do not endorse the products or services offered on Third-Party Websites and you shall hold us blameless from any harm caused by your purchase of such products or services. Additionally, you shall hold us blameless from any losses sustained by you or harm caused to you relating to or resulting in any way from any Third-Party Content or any contact with Third-Party Websites.
                  </p>
                  <p>
                    Delika operates in collaboration with Perjuma Ghana to ensure efficient rider outsourcing and logistics support for its delivery services. This partnership leverages Perjuma Ghana's resources to provide professional delivery riders and well-maintained logistics infrastructure, ensuring a seamless and reliable delivery experience for all users of the platform.
                  </p>
                  <p>By utilizing Delika's platform, users expressly acknowledge and agree to the following:</p>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Governance of Rider Services:</h3>
                    <p>All delivery services carried out by riders sourced through Perjuma Ghana are governed by Perjuma Ghana's terms and conditions. These terms outline the standards for rider conduct, service quality, and operational protocols. Users are advised to familiarize themselves with these terms to fully understand the scope of services provided by Perjuma Ghana.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Liability and Dispute Resolution:</h3>
                    <p>Any disputes, claims, or liability issues arising directly from the execution of delivery services—such as delays, damage to goods, or incidents involving riders—will be addressed in accordance with Perjuma Ghana's operational policies and dispute resolution procedures. Delika will facilitate communication between users and Perjuma Ghana but is not liable for the resolution of such disputes, as they fall under Perjuma Ghana's jurisdiction which can be found here.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Shared Commitment to Service Excellence:</h3>
                    <p>Delika and Perjuma Ghana are committed to maintaining high standards in delivery operations. While Perjuma Ghana oversees the management of riders and delivery logistics, Delika ensures the integration of advanced technology and real-time updates to provide users with an exceptional delivery experience.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Operational Oversight:</h3>
                    <p>Perjuma Ghana retains full responsibility for the recruitment, training, and operational oversight of their riders. This includes adherence to safety protocols, compliance with local laws, and ensuring professional conduct during delivery operations.</p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. PAYMENTS AND FEES</h2>
                <div className="text-gray-600 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Structure</h3>
                    <p>Restaurants and other businesses using Delika's platform are subject to subscription fees and transaction-based charges, as detailed during onboarding.</p>
                    <p>Payments are processed electronically, and all transactions are in Ghanaian Cedis.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Policy</h3>
                    <p>Refunds for fees or charges are processed on a case-by-case basis and may be subject to additional terms communicated during the transaction.</p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. SOFTWARE</h2>
                <div className="text-gray-600 space-y-4">
                  <p>
                    We may include software for use in connection with our Services. If such software is accompanied by an end user license agreement ("EULA"), the terms of the EULA will govern your use of the software. If such software is not accompanied by a EULA, then we grant to you a non-exclusive, revocable, personal, and non-transferable license to use such software solely in connection with our services and in accordance with these Legal Terms. Any software and any related documentation is provided "AS IS" without warranty of any kind, either express or implied, including, without limitation, the implied warranties of merchantability, fitness for a particular purpose, or non-infringement. You accept any and all risk arising out of use or performance of any software. You may not reproduce or redistribute any software except in accordance with the EULA or these Legal Terms.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. PROHIBITED ACTIVITIES</h2>
                <div className="text-gray-600 space-y-4">
                  <p>You may not access or use the Platform for any purpose other than that for which we make the Services available. The Platform may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
                  <p>As a user of the Services, you agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Systematically retrieve data or other content from the Platform to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                    <li>Make any unauthorized use of the Platform, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
                    <li>Use a buying agent or purchasing agent to make purchases on the Platform.</li>
                    <li>Circumvent, disable, or otherwise interfere with security-related features of the Platform, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</li>
                    <li>Engage in unauthorized framing of or linking to the Platform.</li>
                    <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                    <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                    <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
                    <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Platform.</li>
                    <li>Attempt to impersonate another user or person or use the username of another user.</li>
                    <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
                    <li>Use the Platform as part of any effort to compete with us or otherwise use the Platform and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
                    <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Platform.</li>
                    <li>Attempt to bypass any measures of the Platform designed to prevent or restrict access to the Platform, or any portion of the Platform.</li>
                    <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
                    <li>Delete the copyright or other proprietary rights notice from any Content.</li>
                    <li>Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
                    <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party's uninterrupted use and enjoyment of the Platform or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Platform.</li>
                    <li>Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats ("gifs"), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as "spyware" or "passive collection mechanisms" or "pcms").</li>
                    <li>Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or using or launching any unauthorized script or other software.</li>
                    <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Platform & Services.</li>
                    <li>Use the Platform in a manner inconsistent with any applicable laws or regulations, including those of Ghana, such as:</li>
                    <ul className="list-disc list-inside space-y-2 ml-8">
                      <li>Data protection and privacy laws.</li>
                      <li>Intellectual property laws.</li>
                      <li>Cybersecurity laws.</li>
                      <li>Anti-fraud and anti-corruption regulations.</li>
                    </ul>
                    <li>Sell or otherwise transfer your profile.</li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. DATA PRIVACY AND SECURITY</h2>
                <div className="text-gray-600 space-y-4">
                  <p>We are committed to protecting your personal and business data. Our Privacy Policy, incorporated into these Terms, outlines how we collect, use, and protect information. By using Delika, you agree to the terms of our Privacy Policy.</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">10. MOBILE APPLICATION LICENSE</h2>
                <div className="text-gray-600 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Use License</h3>
                    <p>If you access the Services via the App, then we grant you a revocable, non-transferable, non-exclusive, limited right to install and use the App on wireless electronic devices owned or controlled by you, and to access and use the App on such devices strictly in accordance with the terms and conditions of this mobile application license contained in these Legal Terms. You shall not:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Except as permitted by applicable law, decompile, reverse engineer, disassemble, attempt to derive the source code of, or decrypt the App;</li>
                      <li>Make any modification, adaptation, improvement, enhancement, translation, or derivative work from the App;</li>
                      <li>Violate any applicable laws, rules, or regulations in connection with your access or use of the App;</li>
                      <li>Remove, alter, or obscure any proprietary notice (including any notice of copyright or trademark) posted by us or the licensors of the App;</li>
                      <li>Use the App for any revenue-generating endeavor, commercial enterprise, or other purpose for which it is not designed or intended;</li>
                      <li>Make the App available over a network or other environment permitting access or use by multiple devices or users at the same time;</li>
                      <li>Use the App for creating a product, service, or software that is, directly or indirectly, competitive with or in any way a substitute for the App;</li>
                      <li>Use the App to send automated queries to any website or to send any unsolicited commercial email; or</li>
                      <li>Use any proprietary information or any of our interfaces or our other intellectual property in the design, development, manufacture, licensing, or distribution of any applications, accessories, or devices for use with the App.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Apple and Android Devices</h3>
                    <p>The following terms apply when you use the App obtained from either the Apple Store or Google Play (each an "App Distributor") to access the Services:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>The license granted to you for our App is limited to a non-transferable license to use the application on a device that utilizes the Apple iOS or Android operating systems, as applicable, and in accordance with the usage rules set forth in the applicable App Distributor's terms of service;</li>
                      <li>We are responsible for providing any maintenance and support services with respect to the App as specified in the terms and conditions of this mobile application license contained in these Legal Terms or as otherwise required under applicable law, and you acknowledge that each App Distributor has no obligation whatsoever to furnish any maintenance and support services with respect to the App;</li>
                      <li>In the event of any failure of the App to conform to any applicable warranty, you may notify the applicable App Distributor, and the App Distributor, in accordance with its terms and policies, may refund the purchase price, if any, paid for the App, and to the maximum extent permitted by applicable law, the App Distributor will have no other warranty obligation whatsoever with respect to the App;</li>
                      <li>You represent and warrant that (i) you are not located in a country that is subject to a US government embargo, or that has been designated by the US government as a "terrorist supporting" country and (ii) you are not listed on any US government list of prohibited or restricted parties;</li>
                      <li>You must comply with applicable third-party terms of agreement when using the App, e.g., if you have a VoIP application, then you must not be in violation of their wireless data service agreement when using the App; and</li>
                      <li>You acknowledge and agree that the App Distributors are third-party beneficiaries of the terms and conditions in this mobile application license contained in these Legal Terms, and that each App Distributor will have the right (and will be deemed to have accepted the right) to enforce the terms and conditions in this mobile application license contained in these Legal Terms against you as a third-party beneficiary thereof.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">11. SERVICES AND PLATFORM MANAGEMENT</h2>
                <div className="text-gray-600 space-y-4">
                  <p>We reserve the right, but not the obligation, to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Monitor the Services for violations of these Legal Terms;</li>
                    <li>Take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities;</li>
                    <li>In our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof;</li>
                    <li>In our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and</li>
                    <li>Otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.</li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">12. COPYRIGHT INFRINGEMENTS</h2>
                <div className="text-gray-600 space-y-4">
                  <p>We respect the intellectual property rights of others. If you believe that any material available on or through the Services or Platform infringes upon any copyright you own or control, please immediately notify us using the contact information provided below (a 'Notification'). A copy of your Notification will be sent to the person who posted or stored the material in the Notification. Please be advised that pursuant to applicable law you may be held liable for damages if you make material misrepresentations in a Notification. Thus, if you are not sure that material located on or linked to by the services infringes your copyright, you should consider first contacting an attorney.</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">13. DISCLAIMERS</h2>
                <div className="text-gray-600 space-y-4">
                  <p className="font-bold">THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS,</li>
                    <li>PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES,</li>
                    <li>ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN,</li>
                    <li>ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES,</li>
                    <li>ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR</li>
                    <li>ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.</li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">14. LIMITATIONS OF LIABILITY</h2>
                <div className="text-gray-600 space-y-4">
                  <p className="font-bold">IN NO EVENT WILL KRONTIVA OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM ERRORS IN ORDER PROCESSING CAUSED BY RESTAURANT USERS OR YOUR GENERAL USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE LESSER OF THE AMOUNT PAID, IF ANY, BY YOU TO US.</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">15. MODIFICATIONS AND INTERRUPTIONS</h2>
                <div className="text-gray-600 space-y-4">
                  <p>We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We also reserve the right to modify or discontinue all or part of the Services without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.</p>
                  <p>We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">16. INDEMNIFICATION</h2>
                <div className="text-gray-600 space-y-4">
                  <p>You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">17. GOVERNING LAW</h2>
                <div className="text-gray-600 space-y-4">
                  <p>These Legal Terms and your use of the Services are governed by and construed in accordance with the laws of Ghana. Krontiva Africa and Yourself irrevocably consent that the courts of Ghana shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">18. DISPUTE RESOLUTION</h2>
                <div className="text-gray-600 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informal Negotiations</h3>
                    <p>To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes") brought by either you or us (individually, a "Party" and collectively, the "Parties"), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least fifteen (15) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Binding Arbitration</h3>
                    <p>Any dispute, claim, or controversy arising out of or relating to this Agreement, or the breach, termination, enforcement, interpretation, or validity thereof, including the determination of the scope or applicability of this Agreement to arbitrate, shall be determined by arbitration in accordance with The Alternative Dispute Resolution Act, 2010 (Act 798) of the Ghana Association Of Certified Mediators & Arbitrator.</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>The arbitration shall be conducted by a single arbitrator appointed in accordance with The Alternative Dispute Resolution Act, 2010 (Act 798).</li>
                      <li>The arbitration shall be conducted in Accra, Ghana, unless otherwise agreed by the Parties.</li>
                      <li>The arbitrator's decision shall be final and binding on the Parties and may be enforced in any court of competent jurisdiction.</li>
                      <li>The Parties hereby waive any right to bring any dispute, claim, or controversy as a class, collective, or representative action, and agree to pursue any such dispute, claim, or controversy solely on an individual basis.</li>
                      <li>The arbitrator shall have the authority to grant any remedy or relief that would be available in court, provided that the arbitrator's decision shall be final and binding upon the Parties and enforceable in any court of competent jurisdiction.</li>
                      <li>Each Party shall bear its own costs and expenses incurred in connection with the arbitration, including attorneys' fees. The Parties shall share equally the costs and fees of the arbitrator. All arbitration proceedings, including any documents, evidence, or awards produced therein, shall be kept strictly confidential by the Parties and shall not be disclosed to any third party, except as may be required by law or for the purpose of enforcement of any arbitration award.</li>
                      <li>The Agreement may only be amended or modified in writing signed by both Parties. The Agreement constitutes the entire agreement between the Parties regarding the subject matter hereof and supersedes all prior or contemporaneous agreements, understandings, negotiations, and discussions, whether oral or written.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Restrictions</h3>
                    <p>The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Exceptions to Informal Negotiations and Arbitration</h3>
                    <p>The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations and binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.</p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">19. TERMINATION</h2>
                <div className="text-gray-600 space-y-4">
                  <p>These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.</p>
                  <p>If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">20. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
                <div className="text-gray-600 space-y-4">
                  <p>Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.</p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">21. CONTACT US</h2>
                <div className="text-gray-600 space-y-4">
                  <p>For questions or concerns about these Terms or the Platform, please contact:</p>
                  <div className="mt-4 space-y-2">
                    <p><strong>Krontiva Africa Ltd</strong></p>
                    <p>Floor 7, The Octagon</p>
                    <p>Independence Avenue, Barnes Rd,</p>
                    <p>Accra Central, Ghana</p>
                    <p><strong>Email:</strong> support@krontiva.africa</p>
                    <p><strong>Phone:</strong> 030-395-5169 / 025-689-9200</p>
                  </div>
                </div>
              </section>

              <div className="bg-gray-50 rounded-lg p-6 mt-12">
                <p className="text-sm text-gray-600 text-center">
                  These Terms of Service are effective as of the date listed above and apply to all users of Delika's services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 