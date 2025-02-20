import os
import sys


def process_file(filepath, output_file):
    """Processes a single file, writing its relative path and content to the output file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:  # added encoding
            content = f.read()
        relative_path = os.path.relpath(filepath, os.getcwd())  # Get relative path
        output_file.write(f"File: {relative_path}\n")
        output_file.write("-" * 40 + "\n")
        output_file.write(content + "\n")
        output_file.write("-" * 40 + "\n")
    except Exception as e:
        print(f"Error processing file {filepath}: {e}")


def process_directory(dirpath, output_file):
    """Processes all files in a directory (recursively), writing their info to the output file."""
    for root, _, files in os.walk(dirpath):
        for file in files:
            filepath = os.path.join(root, file)
            process_file(filepath, output_file)


def main():
    """Main function to handle command-line arguments and create the output file."""
    if len(sys.argv) < 2:
        print(
            "Usage: python script.py <file1> <file2> ... <directory1> <directory2> ..."
        )
        return

    output_filename = "file_contents.txt"
    try:
        with open(
            output_filename, "w", encoding="utf-8"
        ) as output_file:  # added encoding
            for arg in sys.argv[1:]:
                if os.path.isfile(arg):
                    process_file(arg, output_file)
                elif os.path.isdir(arg):
                    process_directory(arg, output_file)
                else:
                    print(f"Warning: {arg} is not a valid file or directory.")

        print(f"Successfully processed files and wrote output to {output_filename}")

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()
