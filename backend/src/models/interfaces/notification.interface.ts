
//los únicos estados que puede tener un producto en la tienda 

export type ProductStatus = 'DISPONIBLE' | 'SIN_STOCK' | 'DISCONTINUADO'
//type: para crear alias o nombres personalizados para un tipo de dato 

//canales de envío permitidos 
export type NotifierChannel = 'inapp' | 'console';

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
