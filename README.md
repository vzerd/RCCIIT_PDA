# RCCIIT Placement Data Analytics and Prediction (RCCIIT_PDA)

This project aims to provide a comprehensive solution for analyzing and predicting placement trends for students at RCC Institute of Information Technology (RCCIIT). It utilizes Java-based data processing and visualization techniques to deliver insights and predictions based on historical placement data.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Contributing](#contributing)
6. [License](#license)

## Overview

RCCIIT_PDA is designed to simplify the process of analyzing past placement data and forecasting future trends. It assists educational institutions and placement cells in making data-driven decisions by processing raw placement data, performing statistical analysis, and providing meaningful insights through visualizations.

## Features

- **Data Analysis**: In-depth analysis of historical placement data, including success rates, industry trends, and department-wise breakdowns.
- **Prediction Models**: Integration of machine learning techniques to predict student placement probabilities based on their academic and extracurricular profiles.
- **Custom Visualizations**: Graphical representations of insights, such as bar charts, pie charts, and line graphs.
- **User-Friendly Interface**: Simple and intuitive interface for data input and result visualization.
- **Scalable Solution**: Designed to handle large datasets efficiently.

## Installation

To set up the project locally, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Monodipta/RCCIIT_PDA.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd RCCIIT_PDA
   ```

3. **Compile the Java Source Code**:

   ```bash
   javac -d bin src/*.java
   ```

4. **Run the Application**:

   ```bash
   java -cp bin Main
   ```

## Usage

1. **Data Input**:
   - Prepare a CSV or Excel file containing historical placement data. Ensure the data includes fields like `Student Name`, `Roll Number`, `Department`, `CGPA`, `Placement Status`, etc.
   - Load the data into the application through the input interface.

2. **Analysis**:
   - The application will process the data and generate insights, such as placement statistics, company preferences, and department-specific trends.

3. **Prediction**:
   - For new students, input their academic and personal details. The prediction module will calculate their placement probability and display the results.

4. **Export Results**:
   - Save the analyzed data and predictions as reports in a downloadable format.

## Contributing

Contributions are welcome to enhance the functionality of RCCIIT_PDA. To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Add feature"`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details. 
