const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve all static files in the public directory
app.use(express.static(path.join(__dirname, "otp-auth-app")));

const accountSid = "ACdbafadf7b58094ddb1a86b47e140791b";
const authToken = "3af339fb6375e511095d51ebe59316c9";
const verifyServiceSid = "VAabe986175cea48346042662267a3a5f8";

const client = twilio(accountSid, authToken);

// ✅ API to send OTP
app.post("/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  client.verify
    .services(verifyServiceSid)
    .verifications.create({ to: `+91${phone}`, channel: "sms" })
    .then(() => res.status(200).json({ message: "OTP sent" }))
    .catch((err) => {
      console.error("Twilio Verify Error:", err);
      res.status(500).json({ message: "Failed to send OTP", error: err.message });
    });
});

// ✅ API to verify OTP
app.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: "Missing phone or OTP" });
  }

  client.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({ to: `+91${phone}`, code: otp })
    .then((verification_check) => {
      if (verification_check.status === "approved") {
        res.status(200).json({ message: "OTP verified!" });
      } else {
        res.status(400).json({ message: "Invalid OTP" });
      }
    })
    .catch((err) => {
      console.error("Twilio Verify Check Error:", err);
      res.status(500).json({ message: "OTP verification failed", error: err.message });
    });
});

// ✅ Serve index.html as default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,"otp-auth-app","index.html"));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
