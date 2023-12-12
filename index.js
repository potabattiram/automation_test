const { chromium } = require("playwright");
const path = require("path");

async function test() {
  const userDataDir = path.join(__dirname, "user-data");

  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://storyset.com/bro");

  await page.waitForSelector(
    ".absolute.p-4.inset-0.flex.justify-center.visible-vector"
  );

  await page.click('.download-button:has([alt="download icon"])');
  
  // Wait for the modal with SVG and PNG buttons to be visible
  await page.waitForSelector(".absolute.inset-0.z-10.bg-black-50.rounded.flex");
  await page.waitForTimeout(3000);

  // Use page.evaluate to interact with the DOM
  await page.evaluate(() => {
    // Find the button with the text 'Svg' and click it
    const buttons = Array.from(document.querySelectorAll("button"));
    const svgButton = buttons.find((button) =>
      button.textContent.includes("Svg")
    );
    if (svgButton) {
      svgButton.click();
    }
  });

  const download = await page.waitForEvent('download');

  // Get the suggested filename from the download response headers
  const suggestedFilename = download.suggestedFilename();

  // Append ".svg" extension to the filename
  const fileNameWithExtension = suggestedFilename ? suggestedFilename + '.svg' : 'downloaded_file.svg';

  // Specify the file path to save the download
  const downloadPath = path.join(__dirname, 'downloaded_files', fileNameWithExtension);
  
  await download.saveAs(downloadPath);

  console.log("File downloaded to", downloadPath);

  // Close the persistent context
  await browser.close();
}

test();
