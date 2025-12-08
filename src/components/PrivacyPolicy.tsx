import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-[#EF7D00]" />
            <h1 className="text-gray-900">Privacy Policy</h1>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-gray-700">
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

              <section>
                <h2 className="text-gray-900 mb-3">1. Introduction</h2>
                <p>
                  Welcome to ZamLove. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data and tell you about your privacy rights.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">2. Information We Collect</h2>
                <p>We collect and process the following information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, age, city, and password.</li>
                  <li><strong>Profile Information:</strong> Bio, interests, photos, and personality test results.</li>
                  <li><strong>Usage Data:</strong> Information about how you use our Service, including matches, messages, and interactions.</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, and IP address.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">3. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain our Service</li>
                  <li>Match you with compatible users based on location, interests, and personality</li>
                  <li>Communicate with you about your account and Service updates</li>
                  <li>Improve and personalize your experience</li>
                  <li>Ensure safety and security on our platform</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">4. Information Sharing</h2>
                <p>We share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>With Other Users:</strong> Your profile information is visible to other users for matching purposes.</li>
                  <li><strong>Service Providers:</strong> We may share data with third-party service providers who assist us in operating our Service.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or to protect our rights.</li>
                  <li><strong>Business Transfers:</strong> Your information may be transferred if we are involved in a merger, acquisition, or sale of assets.</li>
                </ul>
                <p className="mt-3">
                  <strong>We do not sell your personal information to third parties.</strong>
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">6. Your Privacy Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Request restriction of processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">7. Data Retention</h2>
                <p>
                  We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. When you delete your account, we will delete or anonymize your personal data.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">8. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">9. Children's Privacy</h2>
                <p>
                  Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal data from children. If you become aware that a child has provided us with personal data, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">10. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and maintained on servers located outside of your jurisdiction. We will take appropriate measures to ensure your data is treated securely and in accordance with this policy.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">11. Changes to This Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">12. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <p className="mt-2">
                  Email: privacy@zamlove.com<br />
                  Address: Lusaka, Zambia
                </p>
              </section>

              <section className="bg-orange-50 p-4 rounded-lg">
                <h2 className="text-gray-900 mb-3">Your Consent</h2>
                <p>
                  By using ZamLove, you consent to our Privacy Policy and agree to its terms.
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
