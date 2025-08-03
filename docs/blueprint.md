# **App Name**: ResponseReady MDT

## Core Features:

- User Authentication: Secure authentication via Firestore with signup requiring secret key 'HTKI2'. The very first user to sign up gets the 'commissioner' role, and all subsequent users get the 'user' role. A React context manages user sessions (name, email, role).
- Dashboard Layout: Collapsible sidebar with navigation links (Dashboard, Active Incidents, Records, Comms, Admin) is visible to 'commissioner' roles only. Profile dropdown with logout.
- Incident List: Display a list of ongoing incidents from the `incidents` collection in a table. The incident status should be highlighted with a colored badge.
- Records Search: Search for individuals and vehicles from the `individuals` and `vehicles` collections in Firestore. Results displayed in separate tabs.
- Secure Comms: Chat interface displays messages from the `comms` collection in Firestore.
- Real-time Intel Feed: Analyze radio communication text using a Genkit AI tool to provide a summary and detect potential alerts. The alerts are visually distinct.
- Database Seeding: Populate Firestore database with initial sample data for `incidents`, `individuals`, `vehicles`, and `comms` using `npm run db:seed`.

## Style Guidelines:

- Primary color: Saturated blue (#3498db) for a professional, calm, and trustworthy feel. It's vibrant enough to stand out in a dark theme.
- Background color: Dark gray (#2c3e50) to create a clean, modern, dark interface.
- Accent color: Purple (#8e44ad) as an analogous color for highlights and interactive elements to draw attention.
- Body and headline font: 'Inter', a grotesque-style sans-serif known for a modern, machined, objective, neutral look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use consistent icons from `lucide-react` throughout the application.
- Maintain a consistent layout with clear separation of components using spacing and dividers.