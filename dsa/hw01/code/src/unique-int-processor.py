import os
import sys

class UniqueIntProcessor:
    def process_line(self, line):
        """Process a single line from the input file."""
        potential_ints = line.split()
        valid_ints = []
        for item in potential_ints:
            if self.is_valid_integer(item):
                num = int(item)
                if -1023 <= num <= 1023:
                    valid_ints.append(num)
        return valid_ints

    def is_valid_integer(self, item):
        """Check if the item is a valid integer."""
        try:
            int(item)
            return True
        except ValueError:
            return False

    def quick_sort(self, arr):
        """Custom implementation of Quick Sort."""
        if len(arr) <= 1:
            return arr
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        return self.quick_sort(left) + middle + self.quick_sort(right)

    def process_file(self, input_file, out_file):
        """Main method to read the file, process integers, and write the sorted unique output."""
        if not os.path.exists(input_file):
            print(f"Input file '{input_file}' does not exist.")
            return
        
        unique_integers = set()
        
        # add _results.txt to the output file
        output_file = out_file[:-4] + "_results.txt"

        # Read the input file and process each line
        with open(input_file, 'r') as infile:
            for line in infile:
                valid_ints = self.process_line(line)
                unique_integers.update(valid_ints)

        # Sort the unique integers using Quick Sort
        sorted_unique_integers = self.quick_sort(list(unique_integers))

        # Write the sorted unique integers to the output file
        with open(output_file, 'w') as outfile:
            for num in sorted_unique_integers:
                outfile.write(f"{num}\n")

        print(f"Processed: {input_file} -> {output_file}")
    
    def process_directory(self, input_directory, output_directory):
        """Process all files in the input directory."""
        for filename in os.listdir(input_directory):
            if filename.endswith('.txt'):
                input_file = os.path.join(input_directory, filename)
                output_file = os.path.join(output_directory, filename)
                self.process_file(input_file, output_file)

# Main function to handle command-line arguments and initiate file processing
def main():
    # Get the directory of the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define relative paths
    input_directory = os.path.join(script_dir, '../../sample_inputs/')
    output_directory = os.path.join(script_dir, '../../sample_results/')

    # Convert to absolute paths
    input_directory = os.path.abspath(input_directory)
    output_directory = os.path.abspath(output_directory)

    # Debug information
    print(f"Input Directory: {input_directory}")
    print(f"Output Directory: {output_directory}")

    if not os.path.exists(input_directory):
        print(f"Error: The input directory '{input_directory}' does not exist.")
        sys.exit(1)  # Exit with error code

    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    processor = UniqueIntProcessor()
    processor.process_directory(input_directory, output_directory)

# Entry point for the script
if __name__ == "__main__":
    main()