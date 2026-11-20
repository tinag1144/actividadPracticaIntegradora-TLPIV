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
import { ProductRepository } from "./modules/products/ProductRepository.js";
import { SubscriptionRepository } from "./modules/subscriptions/SubscriptionRepository.js";
import { NotificationRepository } from "./repository/NotificationRepository.js";
import { ProductService } from "./modules/products/ProductService.js";
import { SubscriptionService } from "./modules/subscriptions/SubscriptionService.js";
import { NotificationService } from "./modules/notifications/NotificationService.js";
import { NotifierFactory } from "./modules/notifications/NotifierFactory.js";
import { EventPublisher } from "./observer/EventPublisher.js";
import { ProductController } from "./controllers/ProductController.js";
import { SubscriptionController } from "./controllers/SubscriptionController.js";
import { NotificationController } from "./controllers/NotificationController.js";
import { createProductRouter } from "./routes/product.routes.js";
import { createSubscriptionRouter } from "./routes/subscription.routes.js";
import { createNotificationRouter } from "./routes/notification.routes.js";

// Composition root: every object is created and wired here, and nowhere else.
const start = async (): Promise<void> => {
  await db.connect(env.mongoUri);

  // Repositories
  const userRepository = new UserRepository();
  const roleRepository = new RoleRepository();
  const productRepository = new ProductRepository();
  const subscriptionRepository = new SubscriptionRepository();
  const notificationRepository = new NotificationRepository();

  // Services
  const authService = new AuthService(userRepository, roleRepository);
  const userService = new UserService(userRepository, roleRepository);
  const eventPublisher = new EventPublisher();
  const notifierFactory = new NotifierFactory(notificationRepository);
  const productService = new ProductService(productRepository, eventPublisher);
  const subscriptionService = new SubscriptionService(subscriptionRepository, productRepository);
  const notificationService = new NotificationService(
    subscriptionRepository, userRepository, notificationRepository, notifierFactory,
  );
  eventPublisher.attach(notificationService);

  // Middlewares
  const authenticate = createAuthenticate(authService);

  // Controllers
  const authController = new AuthController(authService);
  const userController = new UserController(userService);

  const productController = new ProductController(productService);
  const subscriptionController = new SubscriptionController(subscriptionService);
  const notificationController = new NotificationController(notificationService);

  const app = createApp({
    corsOrigin: env.corsOrigin,
    routes: [
      { path: "/api/auth", router: createAuthRouter(authController, authenticate) },
      { path: "/api/users", router: createUserRouter(userController, authenticate) },
      { path: "/api/products/:id/subscription", router: createSubscriptionRouter(subscriptionController, authenticate) },
      { path: "/api/products", router: createProductRouter(productController, authenticate) },
      { path: "/api/notifications", router: createNotificationRouter(notificationController, authenticate) },
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
