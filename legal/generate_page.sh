#!/bin/bash

FOOTER='    <!-- UNIVERSAL FOOTER -->
    <footer class="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-16">
        <div class="max-w-7xl mx-auto px-4 py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-lg font-bold mb-4 text-green-400">Company</h3>
                    <ul class="space-y-2">
                        <li><a href="/about.html" class="text-gray-300 hover:text-green-400 transition">About Us</a></li>
                        <li><a href="/careers.html" class="text-gray-300 hover:text-green-400 transition">Careers</a></li>
                        <li><a href="/contact.html" class="text-gray-300 hover:text-green-400 transition">Contact Us</a></li>
                        <li><a href="/investor" class="text-gray-300 hover:text-green-400 transition">Investor Relations</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-4 text-green-400">Products & Services</h3>
                    <ul class="space-y-2">
                        <li><a href="/investor/star-ai-cloud.html" class="text-gray-300 hover:text-green-400 transition">Star AI Cloud</a></li>
                        <li><a href="/investor/star-ai-ediscovery.html" class="text-gray-300 hover:text-green-400 transition">Star AI eDiscovery</a></li>
                        <li><a href="/investor/star-ai-finance.html" class="text-gray-300 hover:text-green-400 transition">Star AI Finance</a></li>
                        <li><a href="/investor/star-automation.html" class="text-gray-300 hover:text-green-400 transition">Star Automation</a></li>
                        <li><a href="/investor/qr-feedback.html" class="text-gray-300 hover:text-green-400 transition">QR Feedback</a></li>
                        <li><a href="https://starworkforce.net" class="text-gray-300 hover:text-green-400 transition">Staffing Services</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-4 text-green-400">Legal & Compliance</h3>
                    <ul class="space-y-2">
                        <li><a href="/legal/privacy-policy.html" class="text-gray-300 hover:text-green-400 transition">Privacy Policy</a></li>
                        <li><a href="/legal/terms-of-service.html" class="text-gray-300 hover:text-green-400 transition">Terms of Service</a></li>
                        <li><a href="/legal/cookie-policy.html" class="text-gray-300 hover:text-green-400 transition">Cookie Policy</a></li>
                        <li><a href="/legal/do-not-sell.html" class="text-gray-300 hover:text-green-400 transition">Do Not Sell</a></li>
                        <li><a href="/legal/ai-policy.html" class="text-gray-300 hover:text-green-400 transition">AI Policy</a></li>
                        <li><a href="/legal/fraud-alert.html" class="text-gray-300 hover:text-green-400 transition">Fraud Alert</a></li>
                        <li><a href="/legal/accessibility.html" class="text-gray-300 hover:text-green-400 transition">Accessibility</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-4 text-green-400">Contact</h3>
                    <div class="space-y-3 text-gray-300 text-sm">
                        <p><strong>Phone:</strong><br><a href="tel:+14697133993" class="hover:text-green-400">(469) 713-3993</a></p>
                        <p><strong>Email:</strong><br><a href="mailto:info@startekk.net" class="hover:text-green-400">info@startekk.net</a></p>
                        <p><strong>Address:</strong><br>5465 Legacy Drive Suite 650<br>Plano, TX 75024</p>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-700 mt-8 pt-8">
                <div class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; 2025 StartTekk LLC & StarWorkforce Solutions. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>'

echo "$FOOTER" > /tmp/footer.html
echo "✅ Footer template ready"

