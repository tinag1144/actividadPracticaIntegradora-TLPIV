
import type { ProductStatus } from "../../types/index.js";

//notificación dentro de la aplicación 
export interface Notification {
    id?: string; //como mongo genera el identificador, el signo de pregunta lo marca como opcional
    userId: string;
    userEmail: string;
    productId: string;
    productName: string;
    oldStatus: ProductStatus;
    newStatus: ProductStatus;
    message: string;
    read: boolean;
    createdAt?: Date;


}
