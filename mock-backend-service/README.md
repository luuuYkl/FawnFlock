# Mock Backend Service

This project is a mock backend service designed to facilitate testing during the development phase. It simulates a RESTful API for managing users and products.

## Project Structure

- **src/**: Contains the source code for the application.
  - **server.ts**: Entry point of the application, sets up the Express server, middleware, and routes.
  - **routes/**: Contains route definitions.
    - **index.ts**: Exports a function to set the main routes.
    - **users.ts**: Defines user-related routes and uses the user controller.
    - **products.ts**: Defines product-related routes and uses the product controller.
  - **controllers/**: Contains the logic for handling requests.
    - **userController.ts**: Handles user-related requests.
    - **productController.ts**: Handles product-related requests.
  - **middleware/**: Contains middleware functions.
    - **logger.ts**: Logs request information.
    - **errorHandler.ts**: Handles errors in the application.
  - **data/**: Contains mock data in JSON format.
    - **users.json**: Mock user data.
    - **products.json**: Mock product data.
  - **types/**: Contains TypeScript interfaces.
    - **index.ts**: Defines interfaces for User and Product types.

## Installation

To install the necessary dependencies, run:

```
npm install
```

## Usage

To start the server, run:

```
npm start
```

The server will be running on `http://localhost:3000`.

## API Endpoints

- **Users**
  - `GET /api/users`: Retrieve all users.
  - `GET /api/users/:id`: Retrieve a user by ID.

- **Products**
  - `GET /api/products`: Retrieve all products.
  - `GET /api/products/:id`: Retrieve a product by ID.

## Contributing

Feel free to submit issues or pull requests to improve the project.