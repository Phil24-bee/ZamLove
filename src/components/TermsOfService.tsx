import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
            <Heart className="w-8 h-8 text-[#EF7D00] fill-[#EF7D00]" />
            <h1 className="text-gray-900">Terms of Service</h1>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-gray-700">
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

              <section>
                <h2 className="text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using ZamLove ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these Terms of Service, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">2. Eligibility</h2>
                <p>
                  You must be at least 18 years old to use ZamLove. By using the Service, you represent and warrant that you have the right, authority, and capacity to enter into this agreement and to abide by all terms and conditions.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">3. User Accounts</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You are responsible for maintaining the confidentiality of your account and password.</li>
                  <li>You agree to accept responsibility for all activities that occur under your account.</li>
                  <li>You must provide accurate and complete information when creating your profile.</li>
                  <li>You must not impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">4. User Conduct</h2>
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
                  <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                  <li>Engage in any form of harassment, abuse, or harm to other users.</li>
                  <li>Upload or distribute any files that contain viruses, corrupted files, or any other similar software that may damage the operation of another's computer.</li>
                  <li>Solicit passwords or personal information from other users.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">5. Content</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You retain all rights to the content you upload to ZamLove.</li>
                  <li>By uploading content, you grant ZamLove a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content on the Service.</li>
                  <li>We reserve the right to remove any content that violates these Terms or is otherwise objectionable.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">6. Privacy</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">7. Safety and Reporting</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>ZamLove provides tools to block and report users who violate these Terms.</li>
                  <li>We take safety seriously and will investigate all reports of misconduct.</li>
                  <li>Users found to be in violation may have their accounts suspended or terminated.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">8. Disclaimers</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>ZamLove is provided "as is" without warranties of any kind.</li>
                  <li>We do not guarantee the accuracy, completeness, or usefulness of any information on the Service.</li>
                  <li>We are not responsible for the conduct of any user on or off the Service.</li>
                  <li>You acknowledge that ZamLove is not responsible for any damages resulting from your use of the Service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">9. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, ZamLove shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">10. Termination</h2>
                <p>
                  We reserve the right to terminate or suspend your account at any time, with or without cause or notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of any changes by posting the new Terms on this page. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">12. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Zambia, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-gray-900 mb-3">13. Contact</h2>
                <p>
                  If you have any questions about these Terms, please contact us at support@zamlove.com
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
