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


def split_file(input_filepath, output_dir, lines_per_file=125):
    """Splits a large text file into smaller files with a specified number of lines."""
    os.makedirs(output_dir, exist_ok=True)  # Create the directory if it doesn't exist
    file_count = 1
    line_count = 0

    with open(input_filepath, "r", encoding="utf-8") as infile:
        outfile = None  # Initialize outfile outside the loop
        try:
            for line in infile:
                if line_count % lines_per_file == 0:
                    if outfile:
                        outfile.close()  # Close the previous file

                    output_filename = os.path.join(
                        output_dir, f"{file_count:03d}.txt"
                    )  # Use leading zeros
                    outfile = open(
                        output_filename, "w", encoding="utf-8"
                    )  # Open new output file
                    file_count += 1

                outfile.write(line)
                line_count += 1
        finally:
            if outfile:  # Ensure the last file is closed, even if an error occurs
                outfile.close()


def main():
    """Main function to handle command-line arguments, create the output file, and split it."""
    if len(sys.argv) < 2:
        print(
            "Usage: python script.py <file1> <file2> ... <directory1> <directory2> ..."
        )
        return

    output_directory = "context_files"
    output_filename = os.path.join(
        output_directory, "file_contents.txt"
    )  # Filepath including the directory

    os.makedirs(
        output_directory, exist_ok=True
    )  # Create the directory if it doesnt exist

    try:
        with open(
            output_filename, "w", encoding="utf-8"
        ) as output_file:  # Create combined output file
            for arg in sys.argv[1:]:
                if os.path.isfile(arg):
                    process_file(arg, output_file)
                elif os.path.isdir(arg):
                    process_directory(arg, output_file)
                else:
                    print(f"Warning: {arg} is not a valid file or directory.")

        print(
            f"Successfully processed files and wrote combined output to {output_filename}"
        )

        split_file(
            output_filename, output_directory
        )  # Split the large file into smaller ones
        print(
            f"Successfully split {output_filename} into smaller files in {output_directory}"
        )

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()
