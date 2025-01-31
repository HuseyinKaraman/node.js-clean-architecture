import { IMessageBroker } from "../interfaces/IMessageBroker";

export class MessageBroker implements IMessageBroker {
    NotifyToPromotionService(product: unknown) {
        //  kafka, rabbitmq implementation
        console.log("Clling message broker");
        return Promise.resolve();
    }
    
}