import os
import zipfile
import datetime
import shutil

def create_backup_zip(parent_folder='./', backup_folder='./backup'):
    # Delete the backup folder if it exists
    if os.path.exists(backup_folder):
        shutil.rmtree(backup_folder)

    # Recreate the backup folder
    os.makedirs(backup_folder)

    # Generate the current date and time for the filename
    now = datetime.datetime.now()
    zip_filename = now.strftime("%d-%B-%Y----Time_%H-%M") + ".zip"
    zip_filepath = os.path.join(backup_folder, zip_filename)

    # Create a ZipFile object
    with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as backup_zip:
        total_size = 0
        compressed_size = 0
        num_files = 0

        # Walk through the parent folder and add files to the zip (ignore backup folder)
        for foldername, subfolders, filenames in os.walk(parent_folder):
            if foldername.startswith(os.path.abspath(backup_folder)):
                continue  # Skip the backup folder

            for filename in filenames:
                file_path = os.path.join(foldername, filename)
                arcname = os.path.relpath(file_path, parent_folder)

                # Add file to the zip
                backup_zip.write(file_path, arcname)
                
                # Get file sizes
                file_size = os.path.getsize(file_path)
                total_size += file_size

                compressed_size += backup_zip.fp.tell() - compressed_size  # Approximate compressed size
                num_files += 1

                # Display compression percentage for the current file
                print(f"Added {filename} ({file_size/1024:.2f} KB) - "
                      f"Total Progress: {(compressed_size / total_size) * 100:.2f}%")
        
        # Final summary
        print("\nBackup completed.")
        print(f"Number of files: {num_files}")
        print(f"Original size: {total_size / (1024 * 1024):.2f} MB")
        print(f"Compressed size: {compressed_size / (1024 * 1024):.2f} MB")
        print(f"Backup saved as: {zip_filepath}")

if __name__ == "__main__":
    create_backup_zip()
