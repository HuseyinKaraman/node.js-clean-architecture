import express from "express";
import { Container } from "inversify";
import { INTERFACE_TYPES } from "../utils";
import { IProductRepository } from "../interfaces/IProductRepository";
import { ProductRepository } from "../repositories/productRepository";
import { IMailer } from "../interfaces/IMailer";
import { IProductInteractor } from "../interfaces/IProductInteractor";
import { ProductInteractor } from "../interactors/productInteractor";
import { Mailer } from "../libs/mailer";
import { IMessageBroker } from "../interfaces/IMessageBroker";
import { MessageBroker } from "../libs/messageBroker";
import { ProductController } from "../controllers/ProductController";

const container = new Container();

container.bind<IProductRepository>(INTERFACE_TYPES.ProductRepository).to(ProductRepository);
container.bind<IProductInteractor>(INTERFACE_TYPES.ProductInteractor).to(ProductInteractor);
container.bind<IMailer>(INTERFACE_TYPES.Mailer).to(Mailer);
container.bind<IMessageBroker>(INTERFACE_TYPES.MessageBroker).to(MessageBroker);
container.bind(INTERFACE_TYPES.ProductController).to(ProductController);

const router = express.Router();
const controller = container.get<ProductController>(INTERFACE_TYPES.ProductController);

router.post("/products", controller.onCreateProduct.bind(controller));
router.get("/products", controller.onGetProducts.bind(controller));
router.patch("/products/:id", controller.onUpdateStock.bind(controller));

export default router;
