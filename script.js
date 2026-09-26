/* =========================================================================
   NORTH SOC — script.js
   =========================================================================
   This file makes the buttons, forms, and pop-ups actually work.

   QUICK GUIDE:
     1. CONFIG            -> your WhatsApp number, email, and payment links
     2. THEME + MENU       -> dark/light toggle, mobile hamburger menu
     3. PLANS + PAYMENT    -> selecting a plan, starting a payment
     4. CONTACT FORM       -> sending the contact form to your email
     5. SCROLL ANIMATIONS  -> the fade-in-as-you-scroll effect
     6. PORTFOLIO          -> the 9 project cards + their pop-up details
     7. LEGAL POP-UPS      -> Terms of Service / Privacy / Cookie Settings
     8. COOKIE BANNER      -> the bar at the bottom of the screen
   ========================================================================= */


/* =========================================================================
   1. CONFIG — edit this section with YOUR real business details
   ========================================================================= */
const CONFIG = {

  // Your WhatsApp number in international format, digits only
  // (no "+", no spaces, no leading zero). This one is already filled in.
  whatsapp: '966502448486',

  // Your business email
  email: 'north.soc.info@gmail.com',

  // ---------------------------------------------------------------------
  // PAYMENT LINKS — replace these 3 placeholders with your real PayPal
  // links. See the "HOW TO SET UP REAL PAYMENTS" guide in the chat
  // reply for exact steps. Both the Card tab and the PayPal tab on the
  // website use these same 3 links — PayPal's own checkout page already
  // lets a customer choose "pay by card as a guest" OR "log in to PayPal",
  // so one link per plan is all you need.
  // ---------------------------------------------------------------------
  payments: {
    starter:      'https://www.paypal.com/ncp/payment/YOUR_STARTER_LINK',      // $150/mo
    professional: 'https://www.paypal.com/ncp/payment/YOUR_PROFESSIONAL_LINK', // $350/mo
    enterprise:   'https://www.paypal.com/ncp/payment/YOUR_ENTERPRISE_LINK',   // $700/mo
  },

  // Formspree endpoint for the contact form (sign up free at formspree.io,
  // create a form, and paste the link it gives you here)
  formspree: 'https://formspree.io/f/YOUR_FORM_ID',
};



/* =========================================================================
   2. THEME TOGGLE + MOBILE MENU
   ========================================================================= */

// Switch between dark and light theme when the round button is clicked
document.getElementById('themeToggleButton').addEventListener('click', function () {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

// Open / close the mobile hamburger menu
const mobileMenu = document.getElementById('mobileMenu');

document.getElementById('menuButton').addEventListener('click', function () {
  mobileMenu.classList.toggle('open');
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
}



/* =========================================================================
   3. PLANS + PAYMENT
   ========================================================================= */

// Called when a "Select Plan" button is clicked on the Plans section.
// It fills in the payment box and scrolls down to it.
function selectPlan(planText) {
  document.getElementById('selectedPlanField').value = planText;
  document.getElementById('payment').scrollIntoView({ behavior: 'smooth' });
  showToast('Plan selected: ' + planText);
}

// Switches between the "Card" tab and the "PayPal" tab in the payment box
function switchPaymentTab(tabName, clickedButton) {
  document.querySelectorAll('.payment-panel').forEach(function (panel) {
    panel.classList.remove('active');
  });
  document.querySelectorAll('.payment-tab').forEach(function (button) {
    button.classList.remove('active');
  });

  document.getElementById('panel-' + tabName).classList.add('active');
  clickedButton.classList.add('active');
}

// Called when "Continue to Secure Checkout" or "Continue with PayPal" is
// clicked. Works out which plan is selected, opens the matching PayPal
// link in a new tab, then opens WhatsApp so the client can confirm the
// payment with you directly.
function startPayment() {
  const selectedPlan = document.getElementById('selectedPlanField').value;

  let paymentLink = CONFIG.payments.professional; // fallback if nothing matches
  if (selectedPlan.indexOf('Starter') !== -1)      paymentLink = CONFIG.payments.starter;
  if (selectedPlan.indexOf('Professional') !== -1) paymentLink = CONFIG.payments.professional;
  if (selectedPlan.indexOf('Enterprise') !== -1)   paymentLink = CONFIG.payments.enterprise;

  showToast('Redirecting to secure checkout...');
  window.open(paymentLink, '_blank');

  // Give the customer a moment to see the checkout open, then invite them
  // to confirm payment with you on WhatsApp
  setTimeout(function () {
    const message = 'Hello North SOC! I just completed payment for the ' + selectedPlan + '. Please confirm my subscription and let me know the next steps.';
    const whatsappLink = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(message);
    window.open(whatsappLink, '_blank');
  }, 2500);
}



/* =========================================================================
   4. CONTACT FORM
   ========================================================================= */

// Called when the contact form is submitted. Sends the message to your
// email via Formspree, and if that fails for any reason, falls back to
// opening a pre-filled Gmail compose window instead.
async function sendContactForm() {
  const name    = document.getElementById('contactName').value.trim();
  const email   = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all fields.');
    return;
  }

  const submitButton = document.getElementById('contactSubmitButton');
  submitButton.textContent = 'Sending...';
  submitButton.disabled = true;

  try {
    const response = await fetch(CONFIG.formspree, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        subject: subject,
        message: message,
        _subject: 'North SOC — ' + subject + ' from ' + name,
      }),
    });

    if (response.ok) {
      showToast("Message sent! We'll reply within 2 business days.");
      document.getElementById('contactForm').reset();

      // Also open WhatsApp so the client has a second, faster way to reach you
      setTimeout(function () {
        const waMessage = 'Hi North SOC! I just sent a contact form message. Subject: ' + subject + '. Name: ' + name;
        openWhatsAppChat(waMessage);
      }, 2000);

    } else {
      throw new Error('Form submission failed');
    }

  } catch (error) {
    // Formspree didn't work (maybe not set up yet) — fall back to Gmail
    const gmailBody = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
    const gmailLink = 'https://mail.google.com/mail/?view=cm&to=' + CONFIG.email +
                       '&su=' + encodeURIComponent('North SOC — ' + subject) +
                       '&body=' + encodeURIComponent(gmailBody);
    window.open(gmailLink, '_blank');
    showToast('Opening Gmail as a backup...');

  } finally {
    submitButton.textContent = 'Send Message →';
    submitButton.disabled = false;
  }
}

// Opens WhatsApp with a pre-filled message. Used by the "Chat on WhatsApp"
// button, and automatically after a payment or a contact form submission.
function openWhatsAppChat(customMessage) {
  const message = customMessage || 'Hi North SOC! I found your website and I have a question about your security services.';
  window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(message), '_blank');
}



/* =========================================================================
   5. TOAST NOTIFICATION (the small red pop-up bottom-right)
   ========================================================================= */

function showToast(message) {
  const toastElement = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;

  toastElement.classList.add('visible');
  setTimeout(function () {
    toastElement.classList.remove('visible');
  }, 3400);
}



/* =========================================================================
   6. SCROLL ANIMATIONS — sections fade in as you scroll down to them
   ========================================================================= */

const scrollObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in').forEach(function (element) {
  scrollObserver.observe(element);
});



/* =========================================================================
   7. PORTFOLIO — project data + the pop-up that shows project details
   ========================================================================= */

// One object per project card. The order here matches the numbers passed
// into openProjectModal(0) ... openProjectModal(8) in index.html.
const projects = [

  {
    number: '01',
    title: 'Home SOC Lab — Wazuh SIEM Deployment',
    tags: ['Wazuh', 'Ubuntu 22.04', 'Elasticsearch', 'Kibana', 'Linux', 'Firewall'],
    overview: 'Built a fully operational Security Operations Center on a DigitalOcean VPS. Deployed Wazuh SIEM, connected 3 agent machines, configured 40+ detection rules, and built real-time dashboards. This lab is the actual infrastructure used to monitor North SOC clients.',
    why: 'Every SOC analyst needs a real lab environment. I built this not for a course — I built it to run my actual business. That makes it real experience, not classroom theory.',
    steps: [
      'Provisioned Ubuntu 22.04 VPS on DigitalOcean with 4GB RAM and 80GB SSD',
      'Installed Wazuh 4.x server following the official quick-start guide',
      'Configured Filebeat and Elasticsearch for log ingestion and storage',
      'Deployed Wazuh agents on 3 test machines (1 Windows 11, 2 Ubuntu)',
      'Wrote 15 custom detection rules for common SMB attack patterns',
      'Built Kibana dashboards: Login Anomalies, Geographic Access Map, Failed Auth Trends',
      'Configured email alerting for High and Critical severity events',
      'Tuned rule thresholds to eliminate false positives over 2 weeks of testing',
    ],
    tools: ['Wazuh 4.x', 'Elasticsearch', 'Kibana', 'Filebeat', 'Ubuntu 22.04', 'DigitalOcean', 'UFW Firewall'],
    result: 'A fully operational SOC monitoring platform that now monitors real North SOC clients. Detects brute force, unusual logins, file integrity changes, and process anomalies in real time.',
    code: `# Install Wazuh server
curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh
sudo bash ./wazuh-install.sh -a

# Deploy agent on Ubuntu client
curl -so wazuh-agent.sh https://packages.wazuh.com/4.7/wazuh-agent.sh
sudo WAZUH_MANAGER="YOUR_IP" bash ./wazuh-agent.sh`,
  },

  {
    number: '02',
    title: 'Phishing Campaign Analysis — 50 Real Samples',
    tags: ['Email Headers', 'IOC Extraction', 'PhishTank', 'MXToolbox', 'CyberChef', 'Reporting'],
    overview: 'Collected 50 real phishing emails from PhishTank and OpenPhish. Analyzed each one — extracted headers, decoded base64 content, identified sender infrastructure, traced IPs, and categorized attack types. Produced a consolidated threat report with 120+ unique IOCs.',
    why: "Phishing analysis is the #1 service small businesses need. Being able to analyze any suspicious email and deliver a clear professional report is a core North SOC service.",
    steps: [
      'Downloaded 50 verified phishing samples from PhishTank.com and OpenPhish.com',
      'Set up isolated analysis environment using REMnux VM with no internet access',
      'Analyzed each email: headers, sender IP, SPF/DKIM/DMARC status, links, attachments',
      'Used MXToolbox to trace sender infrastructure and verify authentication failures',
      'Decoded all base64 encoded content and obfuscated URLs using CyberChef',
      'Submitted all links to VirusTotal and URLScan.io — logged detection rates',
      'Categorized attacks: credential harvesting (28), malware delivery (14), BEC (8)',
      'Extracted and formatted 120+ IOCs: IPs, domains, email addresses, hashes',
      'Produced a 12-page consolidated threat report with recommendations',
    ],
    tools: ['REMnux', 'MXToolbox', 'VirusTotal', 'URLScan.io', 'PhishTank', 'CyberChef', 'Email Header Analyzer'],
    result: '120+ documented IOCs. 50 phishing techniques categorized across 3 attack types. Methodology now used for all North SOC phishing triage work.',
    code: `import email, re

def analyze_headers(raw_email):
    msg = email.message_from_string(raw_email)
    print("From:", msg["From"])
    print("Reply-To:", msg["Reply-To"])

    # Extract IPs from Received headers
    received = msg.get_all("Received", [])
    ip_pattern = r"\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b"
    for line in received:
        ips = re.findall(ip_pattern, line)
        if ips:
            print("Relay IP:", ips[0])`,
  },

  {
    number: '03',
    title: 'Corporate Attack Surface Assessment — OSINT',
    tags: ['Maltego', 'Shodan', 'theHarvester', 'Sublist3r', 'WHOIS', 'Google Dorks'],
    overview: 'Performed a complete OSINT investigation on a fictional company to map its digital attack surface. Discovered exposed subdomains, leaked credentials, employee targets, and misconfigured services — all using free tools and legally available data.',
    why: 'OSINT assessment is something I offer to North SOC clients — it shows them what an attacker sees before launching a targeted attack. This project documents the exact methodology I use.',
    steps: [
      'Created fictional company AcmeCorp with realistic domain and email format',
      'Used theHarvester to enumerate emails, subdomains, and hosts from public sources',
      'Ran Sublist3r to find 23 subdomains — 4 were unprotected dev/staging servers',
      'Searched HaveIBeenPwned API — found 3 employee emails in data breaches',
      'Used Shodan to scan exposed IPs — found open RDP port (3389) on one server',
      'Ran Maltego CE to map relationships between domain, IPs, emails, and personnel',
      'Checked Google dorks for exposed documents, login pages, and sensitive files',
      'Documented LinkedIn employee list — identified finance and IT staff for BEC risk',
      'Produced 18-page OSINT report with risk ratings and remediation steps',
    ],
    tools: ['Maltego CE', 'theHarvester', 'Sublist3r', 'Shodan', 'HaveIBeenPwned', 'Recon-ng', 'Google Dorks'],
    result: '6 high-risk and 11 medium-risk findings in a fictional company with realistic infrastructure. Methodology is now the standard for all North SOC client OSINT reviews.',
    code: `# theHarvester — enumerate emails and subdomains
python3 theHarvester.py -d acmecorp.com -l 500 -b all

# Sublist3r — find subdomains
python3 sublist3r.py -d acmecorp.com -o subdomains.txt

# Shodan — find exposed services
shodan search "org:AcmeCorp" --fields ip_str,port,banner`,
  },

  {
    number: '04',
    title: 'Malware Analysis — Ransomware Dissection',
    tags: ['ANY.RUN', 'VirusTotal', 'PEStudio', 'MalwareBazaar', 'YARA', 'MITRE ATT&CK'],
    overview: 'Performed static and dynamic analysis of a publicly documented ransomware sample from MalwareBazaar. Documented behavior, network indicators, file operations, registry modifications, persistence mechanisms, and mapped 12 MITRE ATT&CK techniques. Wrote a custom YARA detection rule.',
    why: "When a client's antivirus catches something, they want to know what it was trying to do. Malware analysis turns a scary alert into a clear, actionable report.",
    steps: [
      'Downloaded sample from MalwareBazaar (legal repository for security researchers)',
      'Ran static analysis: file type, strings extraction, PE header analysis with PEStudio',
      'Checked file hash against VirusTotal — confirmed malicious, reviewed 60+ AV detections',
      'Submitted to ANY.RUN interactive sandbox — observed live behavior in browser',
      'Documented: file drops, registry keys, network connections, process tree',
      'Identified 12 MITRE ATT&CK techniques: T1059, T1547, T1486, T1071, and others',
      'Extracted network IOCs: C2 IP, beacon interval, HTTP User-Agent string',
      'Wrote custom YARA rule to detect this malware family',
      'Produced 10-page professional malware analysis report',
    ],
    tools: ['ANY.RUN', 'VirusTotal', 'PEStudio', 'MalwareBazaar', 'REMnux', 'YARA', 'Process Monitor', 'Wireshark'],
    result: 'Complete behavioral profile. 12 MITRE ATT&CK techniques documented. Custom YARA detection rule written. Professional analysis report produced in North SOC format.',
    code: `rule Ransomware_Generic_2025 {
    meta:
        author = "North SOC"
        date = "2025-05"
    strings:
        $s1 = "YOUR FILES ARE ENCRYPTED" nocase
        $s2 = "bitcoin" nocase
        $mutex = "Global\\\\XYZ_MUTEX_123"
        $ext = ".locked" ascii
    condition:
        2 of ($s*) or $mutex or $ext
}`,
  },

  {
    number: '05',
    title: 'Incident Response — Compromised Server Investigation',
    tags: ['Windows Event Logs', 'Autopsy', 'Volatility 3', 'Chainsaw', 'Timeline Analysis', 'DFIR'],
    overview: 'Investigated a simulated Windows Server 2019 compromise using a public DFIR dataset. Identified how the attacker got in, what they did, how long they had access, what data they touched, and how they tried to cover their tracks. Full incident report with 10-event timeline produced.',
    why: 'Incident response is the most valuable skill in cybersecurity. Clients who experience a breach need someone who can tell them exactly what happened. This proves I can work through a full investigation.',
    steps: [
      'Downloaded Windows Server compromise dataset from DFIR.training (legal forensic dataset)',
      'Mounted disk image in Autopsy — began file system analysis and artifact collection',
      'Extracted Windows Event Logs: Security events 4624, 4625, 4648, 4672, 4720',
      'Found initial access: RDP brute force from IP 185.220.x.x at 02:14 on Day 1',
      'Traced lateral movement: attacker created backdoor account svc_helper via net user',
      'Identified data staging: 4.2GB compressed to a temp folder before exfiltration',
      'Used Volatility 3 to analyze memory dump — found injected code in svchost.exe',
      'Reconstructed full 10-event attack timeline from access to containment',
      'Produced complete incident report with IOCs, timeline, impact, and remediation',
    ],
    tools: ['Autopsy', 'Volatility 3', 'Chainsaw', 'Windows Event Viewer', 'Log Parser', 'Timeline Explorer', 'FTK Imager'],
    result: 'Complete attacker timeline reconstructed from 47 hours of log data. Initial vector, persistence, lateral movement, and data staging all identified. Full incident report produced.',
    code: `# Volatility 3 — analyze running processes
python3 vol.py -f memory.raw windows.pstree

# Find code injection
python3 vol.py -f memory.raw windows.malfind

# Chainsaw — hunt Windows Event Logs fast
./chainsaw hunt ./Logs/ --rules rules/ --output findings.csv`,
  },

  {
    number: '06',
    title: 'IOC Checker — Python Automation Tool',
    tags: ['Python 3', 'VirusTotal API', 'AbuseIPDB', 'Shodan API', 'argparse', 'GitHub'],
    overview: 'Open-source Python CLI tool that takes a list of IPs, domains, or hashes and simultaneously queries VirusTotal, AbuseIPDB, and Shodan — returning a color-coded threat report in seconds. Reduces manual IOC triage from 30 minutes to under 60 seconds.',
    why: 'Manual IOC lookups waste 20-30 minutes per incident. This tool reduces it to 10 seconds. Every North SOC alert generates IOCs that need checking — automation makes the service faster.',
    steps: [
      'Planned requirements: support IP, domain, URL, hash inputs; query 3 APIs; color output',
      'Built VirusTotal API integration — returns detection score (e.g. 45/70)',
      'Added AbuseIPDB integration — returns abuse confidence score and recent reports',
      'Added Shodan integration — returns open ports and banners for IPs',
      'Built CSV export function — saves full report with timestamp',
      'Added rate limiting to respect free API tier limits (no paid tier required)',
      'Implemented argparse CLI with --file flag for bulk IOC list input',
      'Added color output with the rich library: red = malicious, yellow = suspicious, green = clean',
      'Published to GitHub with full README, setup guide, and example outputs',
    ],
    tools: ['Python 3', 'requests', 'rich library', 'argparse', 'VirusTotal API', 'AbuseIPDB API', 'Shodan API', 'GitHub'],
    result: 'Open-source tool on GitHub. Reduces IOC triage from 30 minutes to under 60 seconds. Used daily in North SOC operations to process client alert IOCs.',
    code: `# Usage
python3 ioc_checker.py --file iocs.txt --output report.csv

# Example iocs.txt
185.220.101.45
malicious-domain.net
a3f9c2e8b1d7f4c2a8e3f9b2

# Output
[!] 185.220.101.45 MALICIOUS (VT:45/70 | Abuse:97% | Ports:443,80,22)
[?] suspicious-site.net SUSPICIOUS (VT:3/70 | Age: 2 days)
[OK] clean-company.com CLEAN (VT:0/70 | Abuse:0%)`,
  },

  {
    number: '07',
    title: 'Network Traffic Threat Hunt — PCAP Analysis',
    tags: ['Wireshark', 'Zeek', 'tshark', 'NetworkMiner', 'C2 Detection', 'DNS Tunneling'],
    overview: 'Analyzed a 2GB network capture file from a public DFIR challenge. Used Wireshark filters and Zeek logs to identify three threats hidden in normal-looking traffic: C2 beaconing over HTTPS, DNS tunneling for data exfiltration, and an internal lateral movement scan.',
    why: 'Most attacks happen at the network layer and leave traces in packet captures. Finding malicious traffic inside gigabytes of normal data is a critical T2 analyst skill.',
    steps: [
      'Downloaded PCAP challenge dataset from DFIR.training (public legal dataset)',
      'Ran Zeek to convert PCAP to structured logs: conn.log, dns.log, http.log, ssl.log',
      'Used Wireshark statistics to identify unusual traffic volumes by IP and protocol',
      'Found C2 beaconing: HTTPS traffic to 185.220.x.x every 300 seconds — too regular',
      'Found 2,400 DNS queries to a malicious domain with unusually long subdomains',
      'Decoded subdomain data — confirmed DNS tunneling (base64 encoded in queries)',
      'Identified internal port scan: one host scanned 254 IPs on port 445 in 3 minutes',
      'Extracted all IOCs: C2 IPs, C2 domains, scanning host, DNS exfil domain',
      'Produced threat hunt report with methodology, findings, timeline, and IOCs',
    ],
    tools: ['Wireshark', 'Zeek', 'tshark', 'NetworkMiner', 'RITA', 'CapSa'],
    result: '3 distinct threats found in a 2GB dataset. 28 unique IOCs extracted. DNS tunneling methodology documented. Threat hunt report used as North SOC methodology reference.',
    code: `# Run Zeek on PCAP file
zeek -C -r capture.pcap local

# tshark: find regular beaconing
tshark -r capture.pcap -T fields -e ip.dst \\
  -e frame.time_delta -Y "ssl.handshake" \\
  | sort | uniq -c | sort -rn

# Find DNS tunneling (long subdomains)
tshark -r capture.pcap -T fields -e dns.qry.name \\
  -Y "dns" | awk "length(\\$0)>50"`,
  },

  {
    number: '08',
    title: 'TryHackMe SOC Level 1 — Full Completion',
    tags: ['MITRE ATT&CK', 'Splunk', 'ELK Stack', 'Zeek', 'Snort', 'Volatility', 'MISP'],
    overview: "Completed all 60+ rooms in TryHackMe's official SOC Level 1 learning path — the most comprehensive structured SOC training available. Covered every foundational SOC domain from threat intelligence to incident response. Official completion certificate earned.",
    why: 'SOC Level 1 is the recognized benchmark for entry-level SOC readiness. Completing it end-to-end proves structured, comprehensive training across all foundational competencies.',
    steps: [
      'Cyber Defence Frameworks: MITRE ATT&CK, Unified Kill Chain, Diamond Model',
      'Cyber Threat Intelligence: threat feeds, MISP, OpenCTI, threat actor profiling',
      'Network Security & Traffic Analysis: Zeek, Snort, NetworkMiner, Wireshark',
      'Endpoint Security Monitoring: Windows Event Logs, Sysmon, Osquery, Wazuh',
      'SIEM: Splunk and ELK Stack — investigation workflows and detection engineering',
      'Digital Forensics & Incident Response: disk forensics, memory analysis, artifacts',
      'Phishing Analysis: email headers, URL investigation, attachment triage workflows',
      'SOC operations: alert triage, escalation procedures, report writing',
      'Earned official TryHackMe SOC Level 1 completion certificate',
    ],
    tools: ['TryHackMe', 'Splunk', 'ELK/Elastic', 'Wireshark', 'Zeek', 'Snort', 'Sysmon', 'MISP', 'OpenCTI', 'Volatility'],
    result: 'Official SOC Level 1 certification. 60+ lab environments completed. Comprehensive notes across all SOC competencies. Foundation for all North SOC service delivery.',
    code: `# Key Splunk SPL queries from the path

# Find failed logins by source IP
index=security EventCode=4625
| stats count by src_ip, user
| where count > 5
| sort -count

# Detect process injection (Sysmon)
index=sysmon EventCode=8
| table _time, SourceImage, TargetImage`,
  },

  {
    number: '09',
    title: 'Splunk Dashboard — SMB Security Monitoring',
    tags: ['Splunk SPL', 'Dashboard XML', 'Alert Rules', 'SMB Security', 'KPI Panels'],
    overview: 'Designed and built a Splunk dashboard specifically for small business security monitoring. Built for non-technical business owners — plain language labels, color-coded status indicators, and executive summaries instead of raw log data.',
    why: 'North SOC clients are business owners, not security analysts. They need dashboards they understand at a glance. This proves I can build client-friendly security visibility tools.',
    steps: [
      'Identified 6 critical SMB security indicators based on SANS top attack vectors',
      'Built Login Anomaly panel: logins outside business hours and from new locations',
      'Built Geographic Access Map: plots login locations — flags unusual countries',
      'Built Failed Auth Trending: line chart of failed logins over 7 days with threshold',
      'Built Phishing Alert panel: counts phishing emails by sender domain with triage link',
      'Built Top Talkers panel: IPs generating unusual outbound traffic volume',
      'Built Critical Alerts panel: last 24h alerts sorted by severity with drill-down',
      'Added executive summary: plain-language status (All Clear / Attention / Critical)',
      'Exported dashboard XML for 30-minute deployment on any Splunk instance',
    ],
    tools: ['Splunk Enterprise', 'SPL (Search Processing Language)', 'Splunk Dashboard XML', 'Lookup Tables', 'Scheduled Alerts'],
    result: 'Complete Splunk dashboard template deployable in 30 minutes for any SMB client. Now the standard North SOC client-facing visibility tool. Saves 2+ hours per week of manual reporting.',
    code: `| tstats count WHERE index=wineventlog
    sourcetype=WinEventLog:Security
    EventCode=4625
    BY src_ip _time span=1h
| timechart span=1h sum(count) AS failed_logins
| where failed_logins > 10

// Alert: trigger when >10 failed logins in 1h from 1 IP`,
  },
];


// Called when a portfolio card is clicked. Builds the pop-up content
// from the matching entry in the "projects" list above.
function openProjectModal(projectIndex) {
  const project = projects[projectIndex];

  document.getElementById('projectNumber').textContent = 'Project ' + project.number;
  document.getElementById('projectTitle').textContent = project.title;

  document.getElementById('projectTags').innerHTML =
    project.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join('');

  const stepsHtml = project.steps.map(function (stepText, index) {
    return '<div class="step-row">' +
             '<div class="step-number">' + (index + 1) + '</div>' +
             '<div class="step-text">' + stepText + '</div>' +
           '</div>';
  }).join('');

  const toolsHtml = project.tools.map(function (tool) { return '<span>' + tool + '</span>'; }).join('');

  document.getElementById('projectBody').innerHTML =
    '<div class="modal-section-title">Overview</div>' +
    '<p class="modal-text">' + project.overview + '</p>' +

    '<div class="modal-section-title">Why I Built This</div>' +
    '<div class="why-box">' + project.why + '</div>' +

    '<div class="modal-section-title">What I Did — Step by Step</div>' +
    stepsHtml +

    '<div class="modal-section-title">Tools Used</div>' +
    '<div class="tools-list">' + toolsHtml + '</div>' +

    '<div class="modal-section-title">Results</div>' +
    '<div class="result-box">' + project.result + '</div>' +

    '<div class="modal-section-title">Code Sample</div>' +
    '<div class="code-block">' + project.code + '</div>';

  document.getElementById('projectOverlay').style.display = 'block';
  document.getElementById('projectModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  document.getElementById('projectOverlay').style.display = 'none';
  document.getElementById('projectModal').style.display = 'none';
  document.body.style.overflow = '';
}

// Called by the filter buttons above the portfolio grid (All / SIEM / etc.)
function filterPortfolio(category, clickedButton) {
  document.querySelectorAll('.filter-btn').forEach(function (button) {
    button.classList.remove('active');
  });
  clickedButton.classList.add('active');

  document.querySelectorAll('.portfolio-card').forEach(function (card) {
    const matches = (category === 'all' || card.dataset.category === category);
    card.classList.toggle('hidden', !matches);
  });
}



/* =========================================================================
   8. LEGAL POP-UPS — Terms of Service, Privacy Policy, Cookie Settings
   ========================================================================= */

const legalPages = {

  tos: {
    title: 'Terms of Service',
    html: `
      <p class="modal-text" style="font-size:.72rem">Last updated: May 2025</p>

      <div class="modal-section-title">1. Acceptance of Terms</div>
      <p class="modal-text">By accessing the North SOC website, subscribing to any plan, or using any of our services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>

      <div class="modal-section-title">2. Services</div>
      <p class="modal-text">North Security Operations Center provides remote cybersecurity monitoring, threat detection, phishing analysis, OSINT investigations, incident reporting, and advisory services. Services currently available are listed on our website. Services marked "Coming Soon" are not yet available.</p>

      <div class="modal-section-title">3. Eligibility</div>
      <p class="modal-text">You must be at least 18 years old and legally capable of entering binding contracts. By subscribing, you confirm you have legal authority to enter this agreement.</p>

      <div class="modal-section-title">4. Acceptable Use</div>
      <p class="modal-text">You agree NOT to use our services to monitor systems you do not own or have written authorization to monitor, conduct illegal activity, misrepresent your identity, or violate applicable laws.</p>

      <div class="modal-section-title">5. Payment</div>
      <p class="modal-text">All plans are billed in advance in USD. Fees are non-refundable except as required by law. North reserves the right to change pricing with 30 days written notice.</p>

      <div class="modal-section-title">6. No Security Guarantee</div>
      <p class="modal-text"><strong>Important:</strong> No cybersecurity service can guarantee complete protection. North reduces risk but cannot guarantee all incidents will be prevented. The client remains ultimately responsible for the security of their own systems.</p>

      <div class="modal-section-title">7. Limitation of Liability</div>
      <p class="modal-text">North's total liability for any claim shall not exceed fees paid in the 3 months before the claim arose. North is not liable for indirect, incidental, or consequential damages.</p>

      <div class="modal-section-title">8. Governing Law</div>
      <p class="modal-text">These Terms are governed by the laws of the Kingdom of Morocco. Disputes shall be resolved through good-faith negotiation, and if unresolved, by the competent courts in Morocco.</p>

      <div class="modal-section-title">9. Contact</div>
      <p class="modal-text">For questions: <strong>north.soc.info@gmail.com</strong></p>
    `,
  },

  privacy: {
    title: 'Privacy Policy',
    html: `
      <p class="modal-text" style="font-size:.72rem">Last updated: May 2025</p>

      <div class="modal-section-title">1. Who We Are</div>
      <p class="modal-text">North Security Operations Center operates this website and provides cybersecurity services. Contact: <strong>north.soc.info@gmail.com</strong></p>

      <div class="modal-section-title">2. Data We Collect</div>
      <table class="modal-table">
        <tr><th>Type</th><th>Data</th><th>Purpose</th></tr>
        <tr><td>Contact</td><td>Name, email, company</td><td>To respond and deliver services</td></tr>
        <tr><td>Payment</td><td>Billing name, country</td><td>To process payments (card data handled by PayPal)</td></tr>
        <tr><td>Service</td><td>System logs, alerts</td><td>To deliver monitoring services</td></tr>
        <tr><td>Usage</td><td>IP, pages visited</td><td>Analytics (with consent only)</td></tr>
      </table>

      <div class="modal-section-title">3. How We Use Your Data</div>
      <p class="modal-text">To deliver services, process payments, send reports and alerts, respond to support, and comply with legal obligations. We <strong>never sell</strong> your data.</p>

      <div class="modal-section-title">4. Data Sharing</div>
      <p class="modal-text">We share data only with: PayPal (payments), cloud hosting providers (servers), and email providers (communications). All are bound by confidentiality agreements.</p>

      <div class="modal-section-title">5. Your Rights</div>
      <p class="modal-text">You have the right to access, correct, delete, and export your data. Email <strong>north.soc.info@gmail.com</strong> — we respond within 30 days.</p>

      <div class="modal-section-title">6. Data Retention</div>
      <p class="modal-text">Client data is retained for the duration of the contract plus 3 years for legal purposes. Contact form submissions are retained for 12 months.</p>

      <div class="modal-section-title">7. Contact</div>
      <p class="modal-text">Privacy inquiries: <strong>north.soc.info@gmail.com</strong></p>
    `,
  },

  cookies: {
    title: 'Cookie Settings',
    html: `
      <div class="modal-section-title">What Are Cookies?</div>
      <p class="modal-text">Cookies are small files stored on your device. We only use cookies that are necessary or that you explicitly consent to.</p>

      <div class="modal-section-title">Manage Your Preferences</div>

      <div class="cookie-row">
        <div>
          <div class="cookie-label">🔒 Essential Cookies
            <span style="background:var(--color-red);color:#fff;font-size:.65rem;padding:.1rem .4rem;border-radius:4px;margin-left:.3rem;font-weight:400">Required</span>
          </div>
          <div class="cookie-description">Required for the site to function. Cannot be disabled.</div>
        </div>
        <label class="switch"><input type="checkbox" checked disabled><span class="switch-slider"></span></label>
      </div>

      <div class="cookie-row">
        <div>
          <div class="cookie-label">📊 Analytics Cookies</div>
          <div class="cookie-description">Help us understand how visitors use the site. Data is anonymized.</div>
        </div>
        <label class="switch"><input type="checkbox" id="analyticsCookieToggle"><span class="switch-slider"></span></label>
      </div>

      <div class="cookie-row">
        <div>
          <div class="cookie-label">⚡ Functional Cookies</div>
          <div class="cookie-description">Remember your preferences like dark/light theme across sessions.</div>
        </div>
        <label class="switch"><input type="checkbox" id="functionalCookieToggle" checked><span class="switch-slider"></span></label>
      </div>

      <div class="cookie-row" style="border-bottom:none">
        <div>
          <div class="cookie-label">🎯 Marketing Cookies</div>
          <div class="cookie-description">We do not use marketing or advertising cookies. North is ad-free.</div>
        </div>
        <label class="switch"><input type="checkbox" disabled><span class="switch-slider"></span></label>
      </div>

      <div class="cookie-modal-buttons">
        <button class="cookie-btn-primary" onclick="saveCookiePreferences()">Save Preferences</button>
        <button class="cookie-btn-secondary" onclick="acceptCookies('all'); closeLegalModal()">Accept All</button>
      </div>
    `,
  },
};

function openLegalModal(pageKey) {
  const page = legalPages[pageKey];
  document.getElementById('legalTitle').textContent = page.title;
  document.getElementById('legalBody').innerHTML = page.html;

  document.getElementById('legalOverlay').style.display = 'block';
  document.getElementById('legalModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLegalModal() {
  document.getElementById('legalOverlay').style.display = 'none';
  document.getElementById('legalModal').style.display = 'none';
  document.body.style.overflow = '';
}

function saveCookiePreferences() {
  localStorage.setItem('northCookiePreference', 'custom');
  document.getElementById('cookieBanner').classList.add('hidden');
  showToast('Cookie preferences saved!');
  closeLegalModal();
}



/* =========================================================================
   9. COOKIE BANNER — the bar at the bottom of the screen on first visit
   ========================================================================= */

function acceptCookies(choice) {
  localStorage.setItem('northCookiePreference', choice);
  document.getElementById('cookieBanner').classList.add('hidden');
  showToast(choice === 'all' ? 'All cookies accepted. Thank you!' : 'Essential cookies only. Got it.');
}

// If the visitor already chose a cookie preference on a previous visit,
// don't show the banner again
if (localStorage.getItem('northCookiePreference')) {
  document.getElementById('cookieBanner').classList.add('hidden');
}



/* =========================================================================
   10. KEYBOARD SHORTCUT — Escape key closes any open pop-up
   ========================================================================= */

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeProjectModal();
    closeLegalModal();
  }
});
