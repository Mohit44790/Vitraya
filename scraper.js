const googleIt = require("google-it");
const request = require("request-promise");
const LineByLineReader = require("line-by-line");
const fs = require("fs");

const userData = process.argv[2];

if (!userData) {
  console.error("Please provide a search query as an argument.");
  process.exit(1);
}

async function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
        return;
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

(async () => {
  try {
    // Delete message.txt if it exists (adapt for Windows)
    if (fs.existsSync("message.txt")) {
      fs.unlinkSync("message.txt");
    }

    // Use google-it to perform the search
    const results = await googleIt({ query: userData });

    // Dynamically import the ES module
    const { stripHtml } = await import("string-strip-html");

    // Process each result
    for (const result of results) {
      const body = await request({ uri: result.link });
      const strippedContent = stripHtml(body).result;
      console.log(strippedContent);
      fs.appendFileSync("message.txt", strippedContent + "\n");
    }

    console.log("Processing complete.");
  } catch (error) {
    console.error("Error:", error);
  }
})();
