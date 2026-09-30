//acá defino el modelo de mongoose para las notificaciones 

import { Schema, model } from "mongoose";
import type { ProductStatus } from "../types/index.js";
import { type Notification } from "./interfaces/notification.interface.js";

//estados permitidos para validar oldStatus y newStatus
const PRODUCT_STATUSES: ProductStatus[] = [
  "DISPONIBLE",
  "SIN_STOCK",
  "DISCONTINUADO",
];

// Schema de como se guarda una notificación en MongoDB
const NotificationSchema = new Schema<Notification>(
  {
    userId: {
      type: String,
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
    },

    productId: {
      type: String,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    oldStatus: {
      type: String,
      enum: PRODUCT_STATUSES,
      required: true,
    },

    newStatus: {
      type: String,
      enum: PRODUCT_STATUSES,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    //la notificación nueva comienza como no leída
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// modelo que utilizará el repositorio para acceder a la colección
export const NotificationModel = model<Notification>(
  "Notification",
  NotificationSchema,
);