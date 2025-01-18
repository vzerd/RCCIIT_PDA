# RCCIIT PDA (Project Data Analysis)

Welcome to the RCCIIT PDA repository! This project is focused on analyzing and processing academic and placement data, providing insights and visualizations to aid decision-making and enhance understanding.

## Overview

This project explores and processes data related to student placements and academic performance, utilizing data analysis and machine learning techniques. It aims to provide actionable insights and accurate placement predictions based on historical data.

## Features

- **Data Preprocessing:**
  - Handling missing values.
  - Encoding categorical variables.
  - Data normalization.

- **Statistical Analysis:**
  - Welch’s t-tests for feature selection.

- **Machine Learning Model:**
  - Implementation of an XGBoost classifier for placement prediction.
  - Hyperparameter tuning using GridSearchCV.
  - Performance evaluation through cross-validation and AUC-ROC metrics.

- **Imbalanced Data Handling:**
  - SMOTE (Synthetic Minority Over-sampling Technique) to balance classes.

- **Automated File Processing:**
  - Monitoring directories for input Excel files.
  - Processing and generating predictions.
  - Automated handling of file operations.

## Technologies Used

- **Frontend:** React.js
  - Provides a user-friendly interface for uploading data, performing analysis, and viewing results.

- **Backend:** Spring Boot
  - Manages API requests, user authentication, and communication with the ML model.

- **Machine Learning:** Python
  - Includes preprocessing, model training, and prediction using libraries such as Pandas, NumPy, Scikit-learn, and XGBoost.

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js and npm (for the frontend)
- JDK 11 or higher (for the backend)
- Python 3.8 or higher (for the machine learning model)
- MySQL Server

## Usage

1. Start the backend server using Spring Boot.
2. Start the frontend React application.
3. Use the interface to upload placement data, analyze trends, and view predictions.
4. The backend communicates with the Python ML model for predictions and returns the results to the frontend.

## Machine Learning Pipeline

1. **Data Preparation:**
   - Drop irrelevant columns.
   - Encode categorical variables.
   - Handle missing values.

2. **Feature Engineering:**
   - Use Welch’s t-tests to analyze numerical features.

3. **Model Training:**
   - Train an XGBoost classifier with optimized hyperparameters.
   - Evaluate the model with cross-validation and AUC-ROC scores.

4. **Testing Pipeline:**
   - Monitor input directory for Excel files.
   - Process the files using the trained model.
   - Generate user-friendly outputs with decoded predictions.

## Results

- Achieved a mean cross-validation accuracy of ~79.68%.
- Test accuracy of 81.21%.
- Micro-average AUC-ROC: 0.95
- Macro-average AUC-ROC: 0.93

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

Thank you for exploring RCCIIT PDA! For any queries or feedback, feel free to reach out.

