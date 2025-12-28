# Vehicle Rental System

[Live Demo](https://vehicle-rental-system-ochre-mu.vercel.app/)

## Features
- User authentication & authorization (JWT-based)
- Role-based access control (Admin, User)
- Vehicle management (CRUD operations)
- Booking management (create, view, cancel bookings)
- Error handling middleware
- Modular code structure for scalability

## Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Deployment:** Vercel
- **Other:** TypeScript, dotenv, custom middlewares

## Setup & Usage Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/diptowebhero/Vehicle-Rental-System.git
   cd Vehicle-Rental-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and update values as needed.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

6. **Access the app:**
   - Visit [http://localhost:PORT](http://localhost:PORT) (replace PORT with your configured port)
   - Or use the [Live Demo](https://vehicle-rental-system-ochre-mu.vercel.app/)

---

For more details, see the source code and comments in each module.
