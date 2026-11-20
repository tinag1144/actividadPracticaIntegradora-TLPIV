import { env } from "./config/env.js";
import { db } from "./config/database.js";
import { createApp } from "./app.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { RoleRepository } from "./repositories/RoleRepository.js";
import { AuthService } from "./services/AuthService.js";
import { UserService } from "./services/UserService.js";
import { AuthController } from "./controllers/Auth.controller.js";
import { UserController } from "./controllers/User.controller.js";
import { createAuthenticate } from "./middlewares/authenticate.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createUserRouter } from "./routes/user.routes.js";

// Composition root: every object is created and wired here, and nowhere else.
const start = async (): Promise<void> => {
  await db.connect(env.mongoUri);

  // Repositories
  const userRepository = new UserRepository();
  const roleRepository = new RoleRepository();

  // Services
  const authService = new AuthService(userRepository, roleRepository);
  const userService = new UserService(userRepository, roleRepository);

  // Middlewares
  const authenticate = createAuthenticate(authService);

  // Controllers
  const authController = new AuthController(authService);
  const userController = new UserController(userService);

  // TODO(team): wire products, subscriptions and notifications here
  // (EventPublisher.attach(notificationService), ProductService, routers...).

  const app = createApp({
    corsOrigin: env.corsOrigin,
    routes: [
      { path: "/api/auth", router: createAuthRouter(authController, authenticate) },
      { path: "/api/users", router: createUserRouter(userController, authenticate) },
    ],
  });

  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });
};

start().catch((error: unknown) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
