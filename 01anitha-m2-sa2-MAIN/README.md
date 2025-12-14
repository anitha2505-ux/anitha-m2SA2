TaskGlide – Smart To-Do List Application

TaskGlide is a modern, responsive to-do list web application that helps users manage daily tasks, due dates, and progress efficiently. It features task filtering, real-time date & time display, cloud persistence, and export functionality — all wrapped in a sleek glassmorphism UI.

Project Overview

TaskGlide allows users to:

⦁	Add, edit, complete, and delete tasks
⦁	Assign due dates to tasks
⦁	Filter tasks by All, Due Today, Pending, and Completed
⦁	Persist tasks using a cloud-based JSON storage
⦁	Export tasks to Excel
⦁	View real-time date and time
⦁	Use the app seamlessly on both desktop and mobile devices
⦁	The project is built using HTML, CSS, and JavaScript, with Axios for API calls and JSONBin for backend storage.

Features

⦁	Task Management
⦁	Add new tasks with optional due dates
⦁	Edit existing tasks
⦁	Mark tasks as completed
⦁	Delete tasks with confirmation modal
⦁	Task Filtering: All tasks, Due Today, Pending, Completed
⦁	Cloud Storage: Tasks are saved and loaded from JSONBin using REST API
⦁	Export to Excel: Download all tasks as an Excel file
⦁	Live Date & Time: Displays current date and time updated every second
⦁	Responsive Design: Table view for desktop, Card-based view for mobile devices

Technologies Used

⦁	HTML5 – Structure and layout 
⦁	CSS – Styling, glassmorphism UI, responsiveness 
⦁	JavaScript – Application logic and state management 
⦁	Axios – API communication
⦁	JSONBin API – Cloud data persistence
⦁	Boxicons – UI icons
⦁	SheetJS (xlsx) – Export to Excel functionality

Project Structure 
taskglide/
│
├── index.html        # Main HTML file
├── styles.css        # Styling and responsive design
├── script.js         # Application logic and API handling
└── README.md         # Project documentation

How It Works

⦁	On page load, tasks are fetched from JSONBin.
⦁	Users can add tasks with optional due dates.
⦁	Tasks are automatically categorized as: Due Today, Pending, Completed
⦁	Any change (add/edit/delete/complete) is instantly saved to the cloud.
⦁	Users can filter tasks or export them to Excel.