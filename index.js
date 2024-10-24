const fs = require("fs");
const forge = require("node-forge");
const pki = forge.pki;

const CERT_PATH = "./cert.pem";
const KEY_PATH = "./key.pem";

let certPem, privateKeyPem;

if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
  // Load existing key and cert from files
  certPem = fs.readFileSync(CERT_PATH, "utf8");
  privateKeyPem = fs.readFileSync(KEY_PATH, "utf8");
} else {
  // Generate new key and self-signed cert
  const keypair = pki.rsa.generateKeyPair(2048);
  privateKeyPem = pki.privateKeyToPem(keypair.privateKey);

  const cert = pki.createCertificate();
  cert.publicKey = keypair.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{ name: "commonName", value: "localhost" }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keypair.privateKey);

  certPem = pki.certificateToPem(cert);

  // Save to files
  fs.writeFileSync(CERT_PATH, certPem);
  fs.writeFileSync(KEY_PATH, privateKeyPem);
}

// Use in Express HTTPS server
const httpsOptions = {
  key: privateKeyPem,
  cert: certPem,
};

const express = require("express");
const https = require("https");

const app = express();
app.get("/", (req, res) => res.send("Hello HTTPS!"));

https.createServer(httpsOptions, app).listen(3000, () => {
  console.log("HTTPS server running on https://localhost:3000/");
});
