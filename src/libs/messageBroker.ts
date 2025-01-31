import { injectable } from "inversify";
import { IMessageBroker } from "../interfaces/IMessageBroker";

@injectable()
export class MessageBroker implements IMessageBroker {
    NotifyToPromotionService(product: unknown) {
        //  kafka, rabbitmq implementation
        console.log("Clling message broker");
        return Promise.resolve();
    }
    
}