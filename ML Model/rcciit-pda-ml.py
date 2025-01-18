import os
import time
import pandas as pd
import numpy as np
import pickle
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

# Load the model and associated objects from the current directory
with open('./placement_model.pkl', 'rb') as f:
    data_dict = pickle.load(f)

model = data_dict["model"]
gender_encoder = data_dict["encoders"]["gender"]
stream_encoder = data_dict["encoders"]["stream"]
placed_encoder = data_dict["encoders"]["placed"]
scaler = data_dict["scaler"]

# Directories
input_dir = 'C:/Users/Administrator/Desktop/FILE_STORE/input/'
output_dir = 'C:/Users/Administrator/Desktop/FILE_STORE/output/'

# Infinite loop
while True:
    # Check if there are any files in the input directory
    input_files = [f for f in os.listdir(input_dir) if os.path.isfile(os.path.join(input_dir, f))]

    if input_files:
        for file_name in input_files:
            input_file_path = os.path.join(input_dir, file_name)

            try:
                # Determine the file extension
                file_extension = os.path.splitext(file_name)[1]

                # Convert Excel to DataFrame
                test_data = pd.read_excel(input_file_path)

                # Save original 'Sl No.' for re-adding later (exclude original 'DOB' to prevent duplication)
                original_columns = test_data[['Sl No.']] if 'Sl No.' in test_data.columns else None

                # Remove 'Sl No.' from test_data to prevent duplication after re-adding
                test_data = test_data.drop(['Sl No.'], axis=1, errors='ignore')

                if 'DOB' in test_data.columns:
                    # Check if 'DOB' column contains numeric data (likely Excel serial dates)
                    if pd.api.types.is_numeric_dtype(test_data['DOB']):
                        # Convert Excel serial date to datetime and format as 'd-m-Y'
                        test_data['DOB'] = pd.to_datetime(test_data['DOB'], unit='d', origin='1899-12-30')
                        test_data['DOB'] = test_data['DOB'].dt.strftime('%d-%m-%Y')
                    # If 'DOB' is already datetime, just reformat
                    elif pd.api.types.is_datetime64_dtype(test_data['DOB']):
                        test_data['DOB'] = test_data['DOB'].dt.strftime('%d-%m-%Y')

                # Data Preprocessing for test data
                test_data['Gender'] = gender_encoder.transform(test_data['Gender'])
                test_data['Stream'] = stream_encoder.transform(test_data['Stream'])

                # Impute missing values
                imputer = SimpleImputer(strategy='most_frequent')
                test_data = pd.DataFrame(imputer.fit_transform(test_data), columns=test_data.columns)

                # Feature Scaling
                test_data_scaled = scaler.transform(test_data.drop('DOB', axis=1, errors='ignore'))

                # Making predictions for test data
                predictions = model.predict(test_data_scaled)

                # Decode the predictions to original values and rename column to 'Placeability'
                test_data['Placeability'] = placed_encoder.inverse_transform(predictions.astype(int))
                test_data['Gender'] = gender_encoder.inverse_transform(test_data['Gender'].astype(int))
                test_data['Stream'] = stream_encoder.inverse_transform(test_data['Stream'].astype(int))

                # Convert values in 'Placeability' column
                test_data['Placeability'] = test_data['Placeability'].replace({
                    'Placed': 'Placeable',
                    'Unplaced': 'Unplaceable'
                })

                # Re-add the original 'Sl No.' if it exists
                if original_columns is not None:
                    test_data = pd.concat([original_columns.reset_index(drop=True), test_data.reset_index(drop=True)], axis=1)

                # Save output as Excel file with the same extension as input
                output_file_path = os.path.join(output_dir, f'Analytics{file_extension}')
                test_data.to_excel(output_file_path, index=False)

                print(f"File saved successfully to: {output_file_path}")

            except Exception as e:
                print(f"An error occurred while processing {file_name}: {e}")

            finally:
                # Delete the processed input file
                os.remove(input_file_path)
                print(f"Deleted input file: {input_file_path}")

    # Wait before checking the directory again
    time.sleep(5)
