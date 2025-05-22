# React Project Setup Guide (Vite + Tailwind CSS)

This guide will walk you through setting up a local React development environment using Vite and Tailwind CSS, and then integrating the SubHub MVP components.

## Prerequisites

- **Node.js and npm**: Ensure you have Node.js (which includes npm) installed. You can download it from [https://nodejs.org/](https://nodejs.org/). We recommend using the latest LTS version.

## Step 1: Create a New Vite + React Project

1.  **Open your terminal or command prompt.**
2.  **Navigate to the directory where you want to create your project.**
3.  **Run the Vite create command:**
    ```bash
    npm create vite@latest subhub-mvp-app --template react
    ```
    - This will create a new directory named `subhub-mvp-app` with a React project.
    - If prompted to choose a framework, select `React`.
    - If prompted to choose a variant, select `JavaScript`.

4.  **Navigate into your new project directory:**
    ```bash
    cd subhub-mvp-app
    ```

5.  **Install project dependencies:**
    ```bash
    npm install
    ```

## Step 2: Integrate Tailwind CSS

1.  **Install Tailwind CSS and its peer dependencies:**
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    ```

2.  **Generate Tailwind CSS configuration files:**
    ```bash
    npx tailwindcss init -p
    ```
    - This will create `tailwind.config.js` and `postcss.config.js`.

3.  **Configure Tailwind's template paths:**
    Open `tailwind.config.js` and update the `content` array to include paths to your source files:
    ```javascript
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // Ensure this covers your component files
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```

4.  **Create and configure `src/index.css`:**
    Create a file named `index.css` in your `src` directory (if it doesn't already exist, Vite's default template might have one). Add the following Tailwind directives at the top of this file:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

5.  **Import `index.css` into your main entry point:**
    Open `src/main.jsx` (or `src/main.js`) and import the `index.css` file at the top:
    ```javascript
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import App from './App.jsx' // Or your main App component
    import './index.css' // Add this line

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    ```

## Step 3: Integrate Provided SubHub MVP Components

1.  **Locate the SubHub MVP component files provided to you.** These should include:
    *   `App.js`
    *   `contexts/SubscriptionContext.js`
    *   `AddSubscriptionsDir/AddSubscriptionForm.js`
    *   `SubscriptionDetailsDir/SubscriptionListItem.js`
    *   `SubscriptionDetailsDir/SubscriptionList.js`

2.  **Organize your `src` directory in the `subhub-mvp-app` project:**
    *   You can keep `App.jsx` (Vite default) or replace its content with the provided `App.js`. Rename `App.js` to `App.jsx` if you keep Vite's default import structure.
    *   Create a `components` directory inside `src`: `src/components`.
    *   Create a `context` directory inside `src`: `src/context`. (Note: singular 'context' is a common convention).

3.  **Copy the provided files into your new project structure:**
    *   Copy `App.js` content into `src/App.jsx` (or rename and move).
    *   Copy `contexts/SubscriptionContext.js` into `src/context/SubscriptionContext.js`.
    *   Copy `AddSubscriptionsDir/AddSubscriptionForm.js` into `src/components/AddSubscriptionForm.jsx`.
    *   Copy `SubscriptionDetailsDir/SubscriptionListItem.js` into `src/components/SubscriptionListItem.jsx`.
    *   Copy `SubscriptionDetailsDir/SubscriptionList.js` into `src/components/SubscriptionList.jsx`.

    **Important:**
    *   You will likely need to rename the `.js` files to `.jsx` if your Vite project is set up to use `.jsx` for React components (which is the default for Vite's React template).
    *   Adjust the import paths within these files to match their new locations. For example, in `App.jsx`, imports for `SubscriptionContext` will change from `../contexts/...` to `./context/...`, and components from `../AddSubscriptionsDir/...` to `./components/...`.

    **Example of path adjustments in `App.jsx` (formerly `App.js`):**
    ```javascript
    // src/App.jsx
    import React from 'react';
    import { SubscriptionProvider } from './context/SubscriptionContext'; // Adjusted path
    import AddSubscriptionForm from './components/AddSubscriptionForm'; // Adjusted path
    import SubscriptionList from './components/SubscriptionList'; // Adjusted path
    import './App.css'; // Or remove if not using App.css specifically

    function App() {
      return (
        <SubscriptionProvider>
          <div className="App container mx-auto p-4">
            <header className="App-header mb-8">
              <h1 className="text-3xl font-bold text-center">SubHub MVP</h1>
            </header
            <AddSubscriptionForm />
            <SubscriptionList />
          </div>
        </SubscriptionProvider>
      );
    }

    export default App;
    ```
    **(Ensure you review all components for correct import paths based on your new structure.)**

## Step 4: Run the Development Server

1.  **In your terminal (still in the `subhub-mvp-app` directory), run:**
    ```bash
    npm run dev
    ```
2.  This will start the Vite development server, usually at `http://localhost:5173` (Vite will tell you the exact address).
3.  Open this address in your web browser. You should see the SubHub MVP application with the basic UI for adding and viewing subscriptions.

## Troubleshooting

*   **Path Issues**: Most common issues will be incorrect import paths after moving files. Double-check all `import` statements.
*   **Tailwind Not Applying**: Ensure `tailwind.config.js` has the correct `content` paths and that `index.css` is imported into `main.jsx`.
*   **`.jsx` vs `.js`**: Vite's React template uses `.jsx` for files containing JSX. If you copy `.js` files with JSX, rename them to `.jsx` and update imports.

---

This guide should help you get the initial components running locally. Further components (Dashboard, Notifications) will be provided as code and can be integrated similarly.
---

## Step 5: Add Dashboard and Notifications Panel Components

Below is the code for `Dashboard.jsx` and `NotificationsPanel.jsx`. You should create these files in your `src/components/` directory and then integrate them into your `src/App.jsx` file.

### `src/components/Dashboard.jsx`

```javascript
// src/components/Dashboard.jsx
import React, { useContext } from 'react';
// Adjust the path if your SubscriptionContext.js is elsewhere
import { SubscriptionContext } from '../context/SubscriptionContext'; 

const Dashboard = () => {
  const { subscriptions } = useContext(SubscriptionContext);

  let totalMonthlyCost = 0;
  let totalYearlyCost = 0;

  subscriptions.forEach(sub => {
    if (sub.frequency === 'Monthly') {
      totalMonthlyCost += parseFloat(sub.cost);
      totalYearlyCost += parseFloat(sub.cost) * 12;
    } else if (sub.frequency === 'Yearly') {
      totalMonthlyCost += parseFloat(sub.cost) / 12;
      totalYearlyCost += parseFloat(sub.cost);
    }
    // TODO: Add calculations for other frequencies if necessary
  });

  const upcomingPayments = subscriptions.filter(sub => {
    if (!sub.startDate) return false;
    try {
      const startDate = new Date(sub.startDate);
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      // This is a very basic filter for demonstration.
      // A real implementation would need to calculate the next payment date based on frequency and start date.
      return startDate >= today && startDate <= sevenDaysFromNow && sub.frequency === 'Monthly';
    } catch (e) {
      console.error("Error processing date for subscription: ", sub.name, e);
      return false;
    }
  });

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-medium text-gray-600">Total Monthly Cost</h3>
          <p className="text-xl font-bold text-blue-500">${totalMonthlyCost.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-medium text-gray-600">Total Yearly Cost</h3>
          <p className="text-xl font-bold text-green-500">${totalYearlyCost.toFixed(2)}</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">Upcoming Payments (Next 7 Days - Simplified)</h3>
        {upcomingPayments.length > 0 ? (
          <ul className="space-y-2">
            {upcomingPayments.map(sub => (
              <li key={sub.id} className="p-3 bg-white rounded shadow text-sm">
                {sub.name} - ${parseFloat(sub.cost).toFixed(2)} on {new Date(sub.startDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming payments based on current simplified logic.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
```

### `src/components/NotificationsPanel.jsx`

```javascript
// src/components/NotificationsPanel.jsx
import React from 'react';

const NotificationsPanel = () => {
  const mockNotifications = [
    { id: 1, message: "Your Netflix subscription renews in 3 days.", type: "alert" },
    { id: 2, message: "Spotify payment was successful.", type: "success" },
    { id: 3, message: "Adobe Creative Cloud price has increased by $5.", type: "warning" },
  ];

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'alert':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'warning':
        return 'bg-red-100 border-red-500 text-red-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Notifications</h2>
      {mockNotifications.length > 0 ? (
        <ul className="space-y-3">
          {mockNotifications.map(notification => (
            <li 
              key={notification.id} 
              className={`p-3 border-l-4 rounded ${getNotificationStyle(notification.type)}`}
            >
              {notification.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No new notifications.</p>
      )}
    </div>
  );
};

export default NotificationsPanel;
```

### Integrating into `App.jsx`

You would then import and use these components in your `src/App.jsx` file, for example:

```javascript
// src/App.jsx
import React from 'react';
import { SubscriptionProvider } from './context/SubscriptionContext';
import AddSubscriptionForm from './components/AddSubscriptionForm';
import SubscriptionList from './components/SubscriptionList';
import Dashboard from './components/Dashboard'; // Import Dashboard
import NotificationsPanel from './components/NotificationsPanel'; // Import NotificationsPanel
// Remove './App.css' if you are not using it, or ensure it's correctly placed.
// import './App.css'; 

function App() {
  return (
    <SubscriptionProvider>
      <div className="App container mx-auto p-4">
        <header className="App-header mb-8">
          <h1 className="text-3xl font-bold text-center">SubHub MVP</h1>
        </header>
        <Dashboard /> {/* Add Dashboard component */}
        <NotificationsPanel /> {/* Add NotificationsPanel component */}
        <div className="mt-8"> {/* Added margin-top for spacing */}
          <AddSubscriptionForm />
        </div>
        <div className="mt-8"> {/* Added margin-top for spacing */}
          <SubscriptionList />
        </div>
      </div>
    </SubscriptionProvider>
  );
}

export default App;
```

Make sure to adjust import paths if your file structure is different. Also, ensure the `SubscriptionContext` import path in `Dashboard.jsx` (`../context/SubscriptionContext`) correctly points to where `SubscriptionContext.js` will be placed (e.g., `src/context/SubscriptionContext.js`).
The example `App.jsx` above assumes all components (`AddSubscriptionForm`, `SubscriptionList`, `Dashboard`, `NotificationsPanel`) are directly in `src/components/`.
```
---

## Architecture Overview (MVP)

This section outlines the basic frontend architecture for the SubHub MVP.

### Core Concepts

*   **React Components**: The UI is built using React components. Key components include:
    *   `App.jsx`: The main application wrapper.
    *   `SubscriptionContext.js`: Manages shared state (subscriptions list) and related functions (add, edit, delete) using React Context API. This serves as the **mock backend** for the MVP.
    *   `AddSubscriptionForm.jsx`: UI for adding new subscriptions.
    *   `SubscriptionList.jsx` & `SubscriptionListItem.jsx`: UI for displaying the list of subscriptions.
    *   `Dashboard.jsx`: UI for displaying summarized financial information (monthly/yearly costs) and upcoming payments.
    *   `NotificationsPanel.jsx`: UI for displaying mock user notifications.
*   **Tailwind CSS**: Used for styling all components, providing utility classes for rapid UI development.
*   **Mock Data**: All data is currently mocked and managed within the `SubscriptionContext.js`. There is no actual backend database or API interaction in this MVP. Data will persist only for the duration of the browser session and will not be saved permanently.

### Data Flow

1.  **Initialization**: `SubscriptionProvider` (from `SubscriptionContext.js`) wraps the main part of the application in `App.jsx`. It initializes an empty list of subscriptions.
2.  **Adding Subscriptions**:
    *   The `AddSubscriptionForm.jsx` component captures user input for a new subscription.
    *   On submission, it calls the `addSubscription` function provided by `SubscriptionContext`.
    *   `SubscriptionContext` updates its internal list of subscriptions.
3.  **Displaying Subscriptions**:
    *   `SubscriptionList.jsx` consumes `SubscriptionContext` to get the current list of subscriptions.
    *   It maps over this list and renders `SubscriptionListItem.jsx` for each subscription.
4.  **Dashboard Display**:
    *   `Dashboard.jsx` consumes `SubscriptionContext` to get the subscriptions.
    *   It calculates totals and filters upcoming payments based on this data.
5.  **Notifications**:
    *   `NotificationsPanel.jsx` currently displays hardcoded mock notifications. It does not yet interact with `SubscriptionContext` for dynamic alerts.

### Directory Structure (Recommended for Local Setup)

```
subhub-mvp-app/
├── public/
├── src/
│   ├── assets/         // For static assets like images
│   ├── components/     // Reusable UI components
│   │   ├── AddSubscriptionForm.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NotificationsPanel.jsx
│   │   ├── SubscriptionList.jsx
│   │   └── SubscriptionListItem.jsx
│   ├── context/        // React context providers
│   │   └── SubscriptionContext.js
│   ├── App.jsx         // Main application component
│   ├── index.css       // Global styles and Tailwind imports
│   └── main.jsx        // Application entry point
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

This architecture is designed for rapid MVP development and local testing. For a production application, a proper backend, database, and API would be required.

---

## Roadmap

This roadmap outlines the development plan for SubHub, starting with the current MVP.

### Phase 1: MVP (Current Focus)

*   **Goal**: Launch a basic, usable subscription tracker to validate core functionality and gather user feedback.
*   **Core Features**:
    *   [x] Add, edit, and remove subscription details (Name, Cost, Frequency, Start Date).
    *   [x] Basic dashboard:
        *   [x] Display total monthly and yearly costs.
        *   [ ] Display upcoming payments (simplified).
    *   [x] View list of all subscriptions.
    *   [ ] Basic notification alerts (mocked).
    *   [x] Frontend components developed in React.
    *   [x] Styling with Tailwind CSS.
    *   [x] Mock data handling via React Context.
    *   [x] Local setup guide for running the application.
*   **Monetization Aspect**: Focus on delivering a functional tool that users would find valuable enough to consider for a future paid tier.

### Phase 2: Enhanced Features (Post-MVP)

*   **Goal**: Improve UI/UX, add more robust features, and prepare for a potential backend.
*   **Features**:
    *   **Improved UI/UX**: Based on initial feedback.
    *   **Calendar Integration**: Visual payment schedule.
    *   **Multi-currency Support**: Accurate tracking for international services.
    *   **Advanced Notification Options**: Customizable alert timings, email notifications (requires backend).
    *   **Data Persistence**: Local storage or basic backend integration (e.g., Firebase, Supabase) to save user data.
    *   **Sorting and Filtering**: For the subscription list.
    *   **Categories**: Allow users to categorize subscriptions.

### Phase 3: Premium Tier & Full Backend

*   **Goal**: Introduce premium features and a scalable backend solution.
*   **Features**:
    *   **Full Backend System**: Node.js/Express with PostgreSQL/SQLite (as per PRD).
    *   **User Accounts & Authentication**.
    *   **Advanced Analytics Dashboard**: Spending trends, optimization suggestions.
    *   **Family/Household Shared Subscriptions**.
    *   **Bank Account/Credit Card Syncing** (if feasible and secure).
    *   **Email Scanning for Subscription Detection** (if feasible).
    *   **Docker Deployment**.

### Future Considerations (Long-term)

*   AI-powered subscription optimization suggestions.
*   Community-based price comparison.
*   Direct cancellation services for popular subscriptions.
*   Subscription marketplace with exclusive discounts.

This roadmap is subject to change based on user feedback and development priorities. The immediate next step after the MVP is to gather user feedback to inform Phase 2.
---

## Step 6: Basic Unit Test Examples (Jest & React Testing Library)

This section provides examples of how you might write unit tests for the React components using Jest and React Testing Library.

### A. Setup Testing Environment

If your Vite project doesn't already have Jest and React Testing Library configured, you'll need to install them.

1.  **Install dependencies:**
    ```bash
    npm install --save-dev jest @testing-library/react @testing-library/jest-dom @babel/preset-env @babel/preset-react babel-jest
    ```

2.  **Configure Babel:**
    Create a `babel.config.js` file in your project root:
    ```javascript
    // babel.config.js
    module.exports = {
      presets: [
        ['@babel/preset-env', {targets: {node: 'current'}}],
        ['@babel/preset-react', {runtime: 'automatic'}],
      ],
    };
    ```

3.  **Configure Jest:**
    You can add Jest configuration to your `package.json` or create a `jest.config.js` file. Here's an example for `package.json`:
    ```json
    // package.json (add this "jest" section)
    "jest": {
      "testEnvironment": "jsdom",
      "moduleNameMapper": {
        "\.(css|less|scss|sass)$": "identity-obj-proxy"
      },
      "transform": {
        "^.+\.jsx?$": "babel-jest"
      },
      "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"] // Optional: for global test setup
    }
    ```
    For the `moduleNameMapper` to work with CSS, also install `identity-obj-proxy`:
    ```bash
    npm install --save-dev identity-obj-proxy
    ```

4.  **Create `src/setupTests.js` (Optional but Recommended):**
    This file is useful for importing `jest-dom` matchers globally.
    ```javascript
    // src/setupTests.js
    import '@testing-library/jest-dom';
    ```

5.  **Add test script to `package.json`:**
    ```json
    // package.json (inside "scripts")
    "scripts": {
      // ... other scripts
      "test": "jest"
    },
    ```

### B. Example Test for `AddSubscriptionForm.jsx`

Create a file named `src/components/AddSubscriptionForm.test.jsx`:

```javascript
// src/components/AddSubscriptionForm.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubscriptionProvider, SubscriptionContext } from '../context/SubscriptionContext'; // Adjust path
import AddSubscriptionForm from './AddSubscriptionForm'; // Adjust path

// Mock the context's addSubscription function
const mockAddSubscription = jest.fn();

const renderWithContext = (ui) => {
  return render(
    <SubscriptionContext.Provider value={{ subscriptions: [], addSubscription: mockAddSubscription }}>
      {ui}
    </SubscriptionContext.Provider>
  );
};

describe('AddSubscriptionForm', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockAddSubscription.mockClear();
  });

  test('renders all input fields and a submit button', () => {
    renderWithContext(<AddSubscriptionForm />);
    expect(screen.getByLabelText(/Subscription Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Subscription/i })).toBeInTheDocument();
  });

  test('allows typing into input fields', () => {
    renderWithContext(<AddSubscriptionForm />);
    fireEvent.change(screen.getByLabelText(/Subscription Name/i), { target: { value: 'Netflix' } });
    expect(screen.getByLabelText(/Subscription Name/i).value).toBe('Netflix');

    fireEvent.change(screen.getByLabelText(/Cost/i), { target: { value: '15.99' } });
    expect(screen.getByLabelText(/Cost/i).value).toBe('15.99');
  });

  test('calls addSubscription with form data on submit', () => {
    renderWithContext(<AddSubscriptionForm />);

    fireEvent.change(screen.getByLabelText(/Subscription Name/i), { target: { value: 'Spotify' } });
    fireEvent.change(screen.getByLabelText(/Cost/i), { target: { value: '9.99' } });
    fireEvent.change(screen.getByLabelText(/Payment Frequency/i), { target: { value: 'Monthly' } });
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2024-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Subscription/i }));

    expect(mockAddSubscription).toHaveBeenCalledTimes(1);
    expect(mockAddSubscription).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Spotify',
      cost: '9.99', // Note: input values are strings
      frequency: 'Monthly',
      startDate: '2024-01-01',
    }));
  });

  test('clears form fields after successful submission', () => {
    renderWithContext(<AddSubscriptionForm />);
    fireEvent.change(screen.getByLabelText(/Subscription Name/i), { target: { value: 'Test Sub' } });
    // ... fill other fields ...
    fireEvent.click(screen.getByRole('button', { name: /Add Subscription/i }));

    expect(screen.getByLabelText(/Subscription Name/i).value).toBe('');
    // ... check other fields are cleared ...
  });
});
```

### C. Example Test for `SubscriptionList.jsx`

Create a file named `src/components/SubscriptionList.test.jsx`:

```javascript
// src/components/SubscriptionList.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubscriptionContext } from '../context/SubscriptionContext'; // Adjust path
import SubscriptionList from './SubscriptionList'; // Adjust path

const mockSubscriptions = [
  { id: 1, name: 'Netflix', cost: '15.99', frequency: 'Monthly', startDate: '2024-01-10' },
  { id: 2, name: 'HBO Max', cost: '14.99', frequency: 'Monthly', startDate: '2024-01-12' },
];

const renderWithContext = (ui, providerProps) => {
  return render(
    <SubscriptionContext.Provider {...providerProps}>{ui}</SubscriptionContext.Provider>
  );
};

describe('SubscriptionList', () => {
  test('renders "No subscriptions yet" when list is empty', () => {
    const providerProps = {
      value: { subscriptions: [], addSubscription: jest.fn() }
    };
    renderWithContext(<SubscriptionList />, providerProps);
    expect(screen.getByText(/No subscriptions yet. Add some!/i)).toBeInTheDocument();
  });

  test('renders a list of subscriptions', () => {
    const providerProps = {
      value: { subscriptions: mockSubscriptions, addSubscription: jest.fn() }
    };
    renderWithContext(<SubscriptionList />, providerProps);

    expect(screen.getByText(/Netflix/i)).toBeInTheDocument();
    expect(screen.getByText(/\$15.99/i)).toBeInTheDocument();
    expect(screen.getByText(/HBO Max/i)).toBeInTheDocument();
    expect(screen.getByText(/\$14.99/i)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(mockSubscriptions.length);
  });
});

```

### D. Running Tests

Once configured, you can run your tests from the terminal:

```bash
npm test
```

This provides a starting point for testing your SubHub MVP components. Remember to adjust import paths based on your final project structure.
---

## Step 7: Implement Data Persistence with Local Storage

To make your SubHub MVP more useful, we'll update `SubscriptionContext.js` to save and load subscriptions from the browser's local storage. This means your data will persist even after you close the browser tab.

**Instructions:**

Replace the entire content of your `src/context/SubscriptionContext.js` file with the code below.

### Updated `src/context/SubscriptionContext.js` (with Local Storage)

```javascript
// src/context/SubscriptionContext.js
import React, { createContext, useState, useEffect } from 'react';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState(() => {
    // Load subscriptions from local storage on initial render
    const localData = localStorage.getItem('subscriptions');
    return localData ? JSON.parse(localData) : [];
  });

  // Save subscriptions to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const addSubscription = (subscription) => {
    // Ensure cost is a number before saving
    const newSubscription = {
      ...subscription,
      id: Date.now(), // Simple ID generation
      cost: parseFloat(subscription.cost) || 0, // Ensure cost is a number
    };
    setSubscriptions(prevSubscriptions => [...prevSubscriptions, newSubscription]);
  };

  // Placeholder for editSubscription - to be implemented
  const editSubscription = (updatedSubscription) => {
    setSubscriptions(prevSubscriptions =>
      prevSubscriptions.map(sub =>
        sub.id === updatedSubscription.id ? { ...sub, ...updatedSubscription, cost: parseFloat(updatedSubscription.cost) || 0 } : sub
      )
    );
  };

  // Placeholder for deleteSubscription - to be implemented
  const deleteSubscription = (id) => {
    setSubscriptions(prevSubscriptions =>
      prevSubscriptions.filter(sub => sub.id !== id)
    );
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription, editSubscription, deleteSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
```

**Key changes in this version:**

1.  **Loading from Local Storage**:
    *   When `SubscriptionProvider` first loads, `useState` for `subscriptions` now has a function as its initial value.
    *   This function tries to read `'subscriptions'` from `localStorage`.
    *   If data exists, it parses it (it's stored as a JSON string). Otherwise, it defaults to an empty array `[]`.
2.  **Saving to Local Storage**:
    *   A `useEffect` hook is added. This hook runs every time the `subscriptions` state changes.
    *   Inside `useEffect`, `localStorage.setItem('subscriptions', JSON.stringify(subscriptions))` saves the current list of subscriptions to local storage. They are converted to a JSON string because local storage can only store strings.
3.  **`addSubscription` Update**:
    *   Ensures `cost` is stored as a number using `parseFloat()`.
4.  **`editSubscription` and `deleteSubscription`**:
    *   Basic implementations for these functions are now provided to allow for future enhancements. They also update the local storage implicitly due to the `useEffect` hook.

After replacing the file content, your application will automatically save subscriptions to and load them from local storage. You can test this by adding subscriptions, closing the tab or browser, and then reopening it. Your subscriptions should still be there.
---

## Step 8: Add Subscription Categories

To better organize subscriptions, we'll add a `category` field. This involves updating the context, the form, and the list item display.

**Instructions:**

Update the relevant parts of your `src/context/SubscriptionContext.js`, `src/components/AddSubscriptionForm.jsx`, and `src/components/SubscriptionListItem.jsx` files with the code provided below.

### 1. Updated `src/context/SubscriptionContext.js` (with Categories)

This version builds upon the previous local storage implementation by adding a `category` to the subscription object.

```javascript
// src/context/SubscriptionContext.js
import React, { createContext, useState, useEffect } from 'react';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState(() => {
    const localData = localStorage.getItem('subscriptions');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const addSubscription = (subscription) => {
    const newSubscription = {
      ...subscription,
      id: Date.now(),
      cost: parseFloat(subscription.cost) || 0,
      category: subscription.category || 'General', // Add category, default to 'General'
    };
    setSubscriptions(prevSubscriptions => [...prevSubscriptions, newSubscription]);
  };

  const editSubscription = (updatedSubscription) => {
    setSubscriptions(prevSubscriptions =>
      prevSubscriptions.map(sub =>
        sub.id === updatedSubscription.id ? { 
          ...sub, 
          ...updatedSubscription, 
          cost: parseFloat(updatedSubscription.cost) || 0,
          category: updatedSubscription.category || sub.category // Ensure category is part of update
        } : sub
      )
    );
  };

  const deleteSubscription = (id) => {
    setSubscriptions(prevSubscriptions =>
      prevSubscriptions.filter(sub => sub.id !== id)
    );
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription, editSubscription, deleteSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
```
**Key changes:**
- In `addSubscription`: `category: subscription.category || 'General'` is added.
- In `editSubscription`: The category field is now part of the update logic.

### 2. Updated `src/components/AddSubscriptionForm.jsx` (with Category Input)

Add a new input field for the category.

```javascript
// src/components/AddSubscriptionForm.jsx
import React, { useState, useContext } from 'react';
// Adjust path as needed
import { SubscriptionContext } from '../context/SubscriptionContext'; 

const AddSubscriptionForm = () => {
  const { addSubscription } = useContext(SubscriptionContext);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [startDate, setStartDate] = useState('');
  const [category, setCategory] = useState(''); // New state for category

  // Suggested categories (can be expanded or moved to context/config)
  const suggestedCategories = ["Entertainment", "Software", "Utilities", "Health", "Education", "Finance", "Other"];


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !cost || !startDate) {
      alert('Please fill in all required fields: Name, Cost, and Start Date.');
      return;
    }
    addSubscription({ name, cost, frequency, startDate, category: category || 'General' });
    setName('');
    setCost('');
    setFrequency('Monthly');
    setStartDate('');
    setCategory(''); // Reset category field
  };

  return (
    // Suggested Tailwind for form: <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md mb-8 space-y-4">
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md mb-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Subscription Name</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
      </div>
      <div>
        <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Cost ($)</label>
        <input type="number" id="cost" value={cost} onChange={(e) => setCost(e.target.value)} step="0.01"
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
      </div>
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Payment Frequency</label>
        <select id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
          <option value="Quarterly">Quarterly</option>
          {/* Add other frequencies as needed */}
        </select>
      </div>
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date / Next Payment</label>
        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)}
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category (Optional)</label>
        <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} list="categories"
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        <datalist id="categories">
          {suggestedCategories.map(cat => <option key={cat} value={cat} />)}
        </datalist>
      </div>
      <button type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Add Subscription
      </button>
    </form>
  );
};

export default AddSubscriptionForm;
```
**Key changes:**
- Added `category` state and an input field for it.
- Using a `datalist` for category suggestions (simple approach).
- `category` is passed to `addSubscription`.

### 3. Updated `src/components/SubscriptionListItem.jsx` (to Display Category)

Modify the item display to include the category.

```javascript
// src/components/SubscriptionListItem.jsx
import React from 'react'; // Removed useContext as it's not used directly here

const SubscriptionListItem = ({ subscription }) => {
  // Basic styling for the category tag
  // const categoryStyle = "px-2 py-0.5 text-xs font-semibold text-indigo-800 bg-indigo-100 rounded-full";

  return (
    // Suggested Tailwind for list item: <li className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
    <li className="p-4 bg-white rounded-lg shadow-md mb-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{subscription.name}</h3>
          <p className="text-sm text-gray-600">
            Cost: ${subscription.cost.toFixed(2)} / {subscription.frequency}
          </p>
          <p className="text-sm text-gray-500">
            Next Payment: {new Date(subscription.startDate).toLocaleDateString()}
          </p>
        </div>
        {/* Display Category */}
        {subscription.category && (
          <span className="px-2 py-0.5 text-xs font-semibold text-indigo-800 bg-indigo-100 rounded-full">
            {subscription.category}
          </span>
        )}
      </div>
      {/* Add Edit/Delete buttons here if implementing that functionality */}
      {/* 
      <div className="mt-2">
        <button onClick={() => console.log('Edit:', subscription.id)} className="text-xs text-blue-500 hover:text-blue-700 mr-2">Edit</button>
        <button onClick={() => console.log('Delete:', subscription.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
      </div>
      */}
    </li>
  );
};

export default SubscriptionListItem;
```
**Key changes:**
- Added a `span` to display `subscription.category` if it exists.
- Included commented-out placeholders for Edit/Delete buttons for future use.

Make sure to replace the content of these files in your local project with the updated versions above. This will enable category management in your SubHub MVP.
---

## Step 9: Enhance Dashboard UI & Functionality

This step focuses on making the Dashboard more informative and visually appealing by improving the display of upcoming payments and adding a spending breakdown by category.

**Instructions:**

Replace the content of your `src/components/Dashboard.jsx` file with the code provided below.

### Updated `src/components/Dashboard.jsx` (Enhanced)

```javascript
// src/components/Dashboard.jsx
import React, { useContext } from 'react';
// Adjust path if your SubscriptionContext.js is elsewhere
import { SubscriptionContext } from '../context/SubscriptionContext'; 

const Dashboard = () => {
  const { subscriptions } = useContext(SubscriptionContext);

  let totalMonthlyCost = 0;
  let totalYearlyCost = 0;
  const spendingByCategory = {};

  subscriptions.forEach(sub => {
    const cost = parseFloat(sub.cost) || 0;
    if (sub.frequency === 'Monthly') {
      totalMonthlyCost += cost;
      totalYearlyCost += cost * 12;
    } else if (sub.frequency === 'Yearly') {
      totalMonthlyCost += cost / 12;
      totalYearlyCost += cost;
    }
    // TODO: Add calculations for other frequencies if necessary

    // Calculate spending by category
    const category = sub.category || 'General';
    spendingByCategory[category] = (spendingByCategory[category] || 0) + (sub.frequency === 'Monthly' ? cost : cost / 12); // Monthly equivalent for simplicity
  });

  const upcomingPayments = subscriptions.filter(sub => {
    if (!sub.startDate) return false;
    try {
      const startDate = new Date(sub.startDate);
      const today = new Date();
      // Consider payments upcoming if their start date is today or in the future.
      // This is a very basic filter. A real app needs to calculate specific next payment dates.
      return startDate >= today; 
    } catch (e) {
      console.error("Error processing date for subscription: ", sub.name, e);
      return false;
    }
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Sort by date

  return (
    <div className="p-4 md:p-6 bg-slate-50 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-6 border-b pb-3">Dashboard</h2>
      
      {/* Financial Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="p-4 bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg">
          <h3 className="text-lg font-medium text-slate-600">Total Monthly Cost</h3>
          <p className="text-2xl font-bold text-sky-600">${totalMonthlyCost.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg">
          <h3 className="text-lg font-medium text-slate-600">Estimated Yearly Cost</h3>
          <p className="text-2xl font-bold text-emerald-600">${totalYearlyCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Spending by Category Section */}
      <div className="mb-8 p-4 bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">Spending by Category (Monthly Est.)</h3>
        {Object.keys(spendingByCategory).length > 0 ? (
          <ul className="space-y-2">
            {Object.entries(spendingByCategory).sort(([,a],[,b]) => b-a).map(([category, total]) => (
              <li key={category} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                <span className="text-slate-700 font-medium">{category}</span>
                <span className="text-slate-800 font-semibold">${total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 italic">No subscriptions with categories yet.</p>
        )}
      </div>
      
      {/* Upcoming Payments Section */}
      <div className="p-4 bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">Upcoming Payments (Sorted by Date)</h3>
        {upcomingPayments.length > 0 ? (
          <ul className="space-y-3">
            {upcomingPayments.map(sub => (
              <li key={sub.id} className="p-3 bg-slate-50 rounded-md shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800">{sub.name}</span>
                    {sub.category && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                        {sub.category}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-slate-700">${(parseFloat(sub.cost) || 0).toFixed(2)}</span>
                </div>
                <p className="text-sm text-slate-500">
                  Due: {new Date(sub.startDate).toLocaleDateString()} ({sub.frequency})
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 italic">No upcoming payments based on current data.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

```

**Key changes in this `Dashboard.jsx` version:**

-   **Improved Styling**: Uses `slate`, `sky`, `emerald` Tailwind color shades for a more modern look. Added `shadow-lg` and transitions for some hover effects.
-   **Spending by Category**:
    -   Calculates total monthly spending for each category.
    -   Displays this in a new section, sorted by amount.
-   **Upcoming Payments**:
    -   The filter logic is still basic (shows items with `startDate` today or in the future).
    -   Payments are now sorted by `startDate`.
    -   The display for each upcoming payment is slightly more detailed, including the category.
-   **Layout**: Uses `md:` prefixes for responsive design adjustments on medium screens and above.

Remember to integrate this updated `Dashboard.jsx` into your local project by replacing the old version. This should give you a more dynamic and visually organized dashboard.
```
