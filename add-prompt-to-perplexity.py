from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import os

# Set the path to the Brave browser executable
brave_path = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"

# Create Chrome options and set the binary location to Brave
options = Options()
options.binary_location = brave_path

# Optional: Add arguments for better stability
options.add_argument("--disable-extensions")  # Disable extensions
options.add_argument("--enable-logging")  # Enable logging
options.add_argument("--v=1")  # Set verbosity level

# Initialize the ChromeDriver service (make sure chromedriver is installed)
service = Service("/opt/homebrew/bin/chromedriver")  # Adjust this path if necessary

# Create a new instance of the Brave browser
driver = webdriver.Chrome(service=service, options=options)

# Navigate to Perplexity AI
driver.get("https://www.perplexity.ai")

# Get the directory containing text files from user input
directory = "context_files"
# directory = input("Enter the directory containing the text files: ")

# List all files in the directory
files = os.listdir(directory)

# Filter and sort the files to ensure they match the naming convention
txt_files = sorted(
    [
        os.path.join(directory, f)
        for f in files
        if f.endswith(".txt") and f[:-4].isdigit() and len(f[:-4]) == 3
    ]
)
# Loop through each text file and input its contents into the search field
for txt_file in txt_files:
    with open(txt_file, "r") as file:
        content = file.read()

    # Find the search field element on Perplexity AI (adjust selector if necessary)
    search_field = driver.find_element(
        "xpath", '//textarea[@placeholder="Ask anything..."]'
    )

    print("SEARCHFIELD")
    print(search_field)

    # Clear the search field before entering new content
    search_field.clear()

    # Input the content into the search field
    search_field.send_keys(content)

    # Submit the form (if necessary)
    search_field.submit()

    # Wait for results to load (you may need to adjust this wait time)
    driver.implicitly_wait(10)

    # Optionally navigate back to the main page if needed for next input
#     driver.get("https://www.perplexity.ai")

# # Keep the browser open for observation or further actions
# input("Press Enter to close the browser...")  # Wait for user input

# # Close the driver after your tasks are complete
# driver.quit()
